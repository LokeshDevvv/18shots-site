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
  p_hold_minutes   integer default 30
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

-- Confirming a booking converts the hold into a sale; rejecting releases it.
-- Keeps quantity_reserved/quantity_sold consistent no matter which path an
-- admin takes.
create or replace function set_booking_status(
  p_booking_code text,
  p_status       booking_status,
  p_admin_note   text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings%rowtype;
begin
  select * into v_booking from bookings where booking_code = p_booking_code for update;
  if not found then
    return false;
  end if;

  if p_status = 'CONFIRMED' and v_booking.status <> 'CONFIRMED' then
    update passes
       set quantity_reserved = greatest(quantity_reserved - v_booking.quantity, 0),
           quantity_sold     = quantity_sold + v_booking.quantity
     where id = v_booking.pass_id;

  elsif p_status in ('REJECTED', 'CANCELLED') and v_booking.status not in ('REJECTED', 'CANCELLED') then
    if v_booking.status = 'CONFIRMED' then
      update passes set quantity_sold = greatest(quantity_sold - v_booking.quantity, 0)
       where id = v_booking.pass_id;
    else
      update passes set quantity_reserved = greatest(quantity_reserved - v_booking.quantity, 0)
       where id = v_booking.pass_id;
    end if;
  end if;

  update bookings
     set status = p_status,
         admin_note = coalesce(p_admin_note, admin_note),
         confirmed_at = case when p_status = 'CONFIRMED' then now() else confirmed_at end,
         reserved_until = case when p_status = 'PENDING_PAYMENT' then reserved_until else null end
   where id = v_booking.id;

  return true;
end;
$$;

revoke all on function create_booking(text, text, text, text, text, text, integer, text, integer) from public, anon, authenticated;
revoke all on function set_booking_status(text, booking_status, text) from public, anon, authenticated;
revoke all on function release_expired_reservations() from public, anon;
