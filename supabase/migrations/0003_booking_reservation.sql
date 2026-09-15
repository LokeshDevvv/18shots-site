-- Atomic inventory reservation.
--
-- The application previously read remaining inventory and then inserted a
-- booking in a separate statement. Two people reading the same "1 left" both
-- succeeded. Availability is now checked and claimed inside one transaction
-- holding a row lock on the pass.

alter table bookings
  add column if not exists reserved_until timestamptz;

create index if not exists bookings_reserved_until_idx
  on bookings (reserved_until)
  where status = 'PENDING_PAYMENT';

-- Release holds whose payment window has passed, returning the seats to stock.
-- Call from a scheduled job (pg_cron, or a Supabase scheduled function).
create or replace function release_expired_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  released integer := 0;
  r record;
begin
  for r in
    select id, pass_id, quantity
    from bookings
    where status = 'PENDING_PAYMENT'
      and reserved_until is not null
      and reserved_until < now()
    for update skip locked
  loop
    update passes
       set quantity_reserved = greatest(quantity_reserved - r.quantity, 0)
     where id = r.pass_id;

    update bookings
       set status = 'CANCELLED',
           admin_note = coalesce(admin_note || ' | ', '') || 'Auto-released: payment window expired'
     where id = r.id;

    released := released + 1;
  end loop;

  return released;
end;
$$;

-- Create a booking and claim its seats atomically.
-- Returns a single row; `ok` false carries a user-safe `message`.
create or replace function create_booking(
  p_event_slug     text,
  p_pass_name      text,
  p_customer_name  text,
  p_phone          text,
  p_email          text,
  p_instagram      text,
  p_quantity       integer,
  p_special_request text,
  p_hold_minutes   integer default 15
)
returns table (
  ok           boolean,
  message      text,
  booking_code text,
  amount       integer,
  remaining    integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event    events%rowtype;
  v_pass     passes%rowtype;
  v_remaining integer;
  v_amount   integer;
  v_code     text;
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 10 then
    return query select false, 'Choose between 1 and 10 passes.', null::text, null::integer, null::integer;
    return;
  end if;

  select * into v_event from events where slug = p_event_slug;
  if not found or v_event.status <> 'LIVE' then
    return query select false, 'This event is not open for bookings right now.', null::text, null::integer, null::integer;
    return;
  end if;

  -- Free anything whose hold lapsed before we measure availability.
  perform release_expired_reservations();

  -- The lock is the point: concurrent callers queue here rather than both
  -- reading the same remaining count.
  select * into v_pass
    from passes
   where event_id = v_event.id
     and name = p_pass_name
     and active
   for update;

  if not found then
    return query select false, 'That pass is no longer available.', null::text, null::integer, null::integer;
    return;
  end if;

  v_remaining := v_pass.quantity_total - v_pass.quantity_reserved - v_pass.quantity_sold;

  if v_remaining < p_quantity then
    return query select
      false,
      case
        when v_remaining <= 0 then 'This pass has sold out.'
        when v_remaining = 1  then 'Only 1 left on this pass.'
        else 'Only ' || v_remaining || ' left on this pass.'
      end,
      null::text,
      null::integer,
      v_remaining;
    return;
  end if;

  v_amount := v_pass.price * p_quantity;

  update passes
     set quantity_reserved = quantity_reserved + p_quantity
   where id = v_pass.id;

  insert into bookings (
    event_id, pass_id, customer_name, phone, email, instagram,
    quantity, amount, special_request, status, reserved_until
  ) values (
    v_event.id, v_pass.id, p_customer_name, p_phone, p_email,
    nullif(p_instagram, ''), p_quantity, v_amount,
    nullif(p_special_request, ''), 'PENDING_PAYMENT',
    now() + make_interval(mins => p_hold_minutes)
  )
  returning bookings.booking_code into v_code;

  return query select true, null::text, v_code, v_amount, v_remaining - p_quantity;
end;
$$;

-- Admin status changes, as an explicit state machine.
--
-- An unrestricted setter let a CANCELLED booking be moved to CONFIRMED, which
-- incremented quantity_sold against a reservation that had already been
-- released. Only the transitions below are legal; anything else is rejected
-- without touching inventory.
--
--   PENDING_PAYMENT   -> PAYMENT_SUBMITTED | CANCELLED | REJECTED
--   PAYMENT_SUBMITTED -> CONFIRMED | REJECTED | CANCELLED
--   CONFIRMED         -> CHECKED_IN | CANCELLED        (cancel = refund path)
--   REJECTED | CANCELLED | CHECKED_IN -> terminal
create or replace function set_booking_status(
  p_booking_code text,
  p_status       booking_status,
  p_admin_note   text default null
)
returns table (ok boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings%rowtype;
  v_allowed booking_status[];
begin
  select * into v_booking from bookings where booking_code = p_booking_code for update;
  if not found then
    return query select false, 'No booking with that code.';
    return;
  end if;

  if v_booking.status = p_status then
    return query select true, 'No change.';
    return;
  end if;

  v_allowed := case v_booking.status
    when 'PENDING_PAYMENT'   then array['PAYMENT_SUBMITTED', 'CANCELLED', 'REJECTED']::booking_status[]
    when 'PAYMENT_SUBMITTED' then array['CONFIRMED', 'REJECTED', 'CANCELLED']::booking_status[]
    when 'CONFIRMED'         then array['CHECKED_IN', 'CANCELLED']::booking_status[]
    else array[]::booking_status[]
  end;

  if not (p_status = any (v_allowed)) then
    return query select false,
      format('Cannot move a booking from %s to %s.', v_booking.status, p_status);
    return;
  end if;

  -- Inventory effects, derived from the transition rather than the target alone.
  if p_status = 'CONFIRMED' then
    -- Hold becomes a sale.
    update passes
       set quantity_reserved = greatest(quantity_reserved - v_booking.quantity, 0),
           quantity_sold     = quantity_sold + v_booking.quantity
     where id = v_booking.pass_id;

  elsif p_status in ('REJECTED', 'CANCELLED') then
    if v_booking.status = 'CONFIRMED' then
      -- Refund: give back a sold seat.
      update passes set quantity_sold = greatest(quantity_sold - v_booking.quantity, 0)
       where id = v_booking.pass_id;
    else
      -- Release an unpaid or unverified hold.
      update passes set quantity_reserved = greatest(quantity_reserved - v_booking.quantity, 0)
       where id = v_booking.pass_id;
    end if;
  end if;
  -- CHECKED_IN moves nothing: the seat is already counted as sold.

  update bookings
     set status = p_status,
         admin_note = coalesce(p_admin_note, admin_note),
         confirmed_at = case when p_status = 'CONFIRMED' then now() else confirmed_at end,
         reserved_until = null
   where id = v_booking.id;

  return query select true, null::text;
end;
$$;

-- Privileges.
--
-- Revoking from PUBLIC also removes the default EXECUTE that service_role was
-- relying on, so each function the server calls has to be granted back
-- explicitly. Without this every RPC fails with "permission denied for
-- function". service_role bypasses RLS; it does not bypass function grants.
revoke all on function create_booking(text, text, text, text, text, text, integer, text, integer) from public;
revoke all on function set_booking_status(text, booking_status, text) from public;
revoke all on function release_expired_reservations() from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function create_booking(text, text, text, text, text, text, integer, text, integer) to service_role;
    grant execute on function set_booking_status(text, booking_status, text) to service_role;
    grant execute on function release_expired_reservations() to service_role;
  end if;
end
$$;
