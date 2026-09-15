-- Abuse protection for a public booking endpoint, plus the expiry scheduler.
--
-- Creating a booking immediately increments quantity_reserved, so an unlimited
-- public endpoint lets anyone lock the whole event out of stock for the length
-- of a hold. Two cheap limits close that: attempts per client, and concurrent
-- unpaid holds per phone number.

create table if not exists booking_attempts (
  id         bigserial primary key,
  client_key text        not null,
  phone      text,
  created_at timestamptz not null default now()
);

create index if not exists booking_attempts_client_idx
  on booking_attempts (client_key, created_at desc);

alter table booking_attempts enable row level security;
-- No policies: only the service role (which bypasses RLS) touches this.

-- Trim the log so it can't grow without bound.
create or replace function prune_booking_attempts(p_keep_hours integer default 24)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  delete from booking_attempts
   where created_at < now() - make_interval(hours => p_keep_hours);
  get diagnostics removed = row_count;
  return removed;
end;
$$;

-- create_booking gains a client key and the two limits. The signature changes,
-- so the previous version is dropped rather than overloaded.
drop function if exists create_booking(text, text, text, text, text, text, integer, text, integer);

create or replace function create_booking(
  p_event_slug      text,
  p_pass_name       text,
  p_customer_name   text,
  p_phone           text,
  p_email           text,
  p_instagram       text,
  p_quantity        integer,
  p_special_request text,
  p_client_key      text default 'unknown',
  p_hold_minutes    integer default 15,
  p_max_per_client  integer default 5,
  p_window_minutes  integer default 10,
  p_max_open_holds  integer default 2
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
  v_event     events%rowtype;
  v_pass      passes%rowtype;
  v_remaining integer;
  v_amount    integer;
  v_code      text;
  v_attempts  integer;
  v_holds     integer;
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 10 then
    return query select false, 'Choose between 1 and 10 passes.', null::text, null::integer, null::integer;
    return;
  end if;

  -- Rate limit per client.
  select count(*) into v_attempts
    from booking_attempts
   where client_key = p_client_key
     and created_at > now() - make_interval(mins => p_window_minutes);

  if v_attempts >= p_max_per_client then
    return query select false,
      'Too many booking attempts. Please wait a few minutes and try again.',
      null::text, null::integer, null::integer;
    return;
  end if;

  insert into booking_attempts (client_key, phone) values (p_client_key, p_phone);

  -- Free anything whose hold lapsed before we measure availability.
  perform release_expired_reservations();

  -- One phone number cannot sit on unlimited unpaid holds.
  select count(*) into v_holds
    from bookings
   where phone = p_phone
     and status = 'PENDING_PAYMENT'
     and (reserved_until is null or reserved_until > now());

  if v_holds >= p_max_open_holds then
    return query select false,
      'You already have a booking awaiting payment. Complete it before starting another.',
      null::text, null::integer, null::integer;
    return;
  end if;

  select * into v_event from events where slug = p_event_slug;
  if not found or v_event.status <> 'LIVE' then
    return query select false, 'This event is not open for bookings right now.', null::text, null::integer, null::integer;
    return;
  end if;

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
      null::text, null::integer, v_remaining;
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

revoke all on function create_booking(text, text, text, text, text, text, integer, text, text, integer, integer, integer, integer) from public;
revoke all on function prune_booking_attempts(integer) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function create_booking(text, text, text, text, text, text, integer, text, text, integer, integer, integer, integer) to service_role;
    grant execute on function prune_booking_attempts(integer) to service_role;
    grant all on table booking_attempts to service_role;
    grant usage, select on sequence booking_attempts_id_seq to service_role;
  end if;
end
$$;

-- ------------------------------------------------------- expiry scheduler ----
--
-- Holds only expire if something calls release_expired_reservations(). It runs
-- at the top of every create_booking, but a quiet hour would otherwise leave
-- stock locked, so schedule it independently.
--
-- On Supabase: Dashboard → Database → Extensions → enable `pg_cron`, then run
-- this file (or the block below) once. Verify with:
--     select * from cron.job;
--     select release_expired_reservations();   -- returns rows released
--
-- Self-hosted Postgres without pg_cron: run the same statement from any
-- scheduler (systemd timer, GitHub Action, Supabase scheduled function):
--     psql "$DATABASE_URL" -c "select release_expired_reservations();"

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('release-expired-reservations')
      where exists (select 1 from cron.job where jobname = 'release-expired-reservations');
    perform cron.schedule(
      'release-expired-reservations',
      '*/5 * * * *',
      $cron$select release_expired_reservations();$cron$
    );

    perform cron.unschedule('prune-booking-attempts')
      where exists (select 1 from cron.job where jobname = 'prune-booking-attempts');
    perform cron.schedule(
      'prune-booking-attempts',
      '17 4 * * *',
      $cron$select prune_booking_attempts();$cron$
    );
  else
    raise notice 'pg_cron not installed — schedule release_expired_reservations() externally (see comments above).';
  end if;
end
$$;
