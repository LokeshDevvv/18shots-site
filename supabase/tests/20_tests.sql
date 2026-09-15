\set ON_ERROR_STOP on
\pset pager off

-- ---------------------------------------------------------------- helpers ---
create or replace function t_remaining() returns integer language sql as $$
  select quantity_total - quantity_reserved - quantity_sold from passes limit 1;
$$;
create or replace function t_counts() returns text language sql as $$
  select format('reserved=%s sold=%s remaining=%s', quantity_reserved, quantity_sold,
                quantity_total - quantity_reserved - quantity_sold) from passes limit 1;
$$;

-- =========================================================== 2. expiry ======
do $$
declare r record; v_code text; released integer;
begin
  select * into r from create_booking('villa-after-dark','General Pass','Expiry Test',
    '9990000001','e@x.com','',2,'', 'test-expiry') ;
  assert r.ok, 'expiry: booking should be created';
  v_code := r.booking_code;
  assert t_remaining() = 3, format('expiry: expected 3 remaining, got %s', t_remaining());

  -- Backdate the hold, then release.
  update bookings set reserved_until = now() - interval '1 minute' where booking_code = v_code;
  select release_expired_reservations() into released;
  assert released = 1, format('expiry: expected 1 released, got %s', released);
  assert t_remaining() = 5, format('expiry: stock not returned — %s', t_counts());
  assert (select status from bookings where booking_code = v_code) = 'CANCELLED',
    'expiry: booking should be CANCELLED';
  raise notice 'PASS  expiry releases inventory (%)', t_counts();
end $$;

-- ======================================= 4. confirm moves reserved->sold ====
do $$
declare r record; v_code text; res record;
begin
  select * into r from create_booking('villa-after-dark','General Pass','Confirm Test',
    '9990000002','e@x.com','',2,'', 'test-confirm');
  v_code := r.booking_code;
  select * into res from set_booking_status(v_code, 'PAYMENT_SUBMITTED');
  assert res.ok, 'confirm: PENDING_PAYMENT -> PAYMENT_SUBMITTED should be legal';
  select * into res from set_booking_status(v_code, 'CONFIRMED');
  assert res.ok, 'confirm: PAYMENT_SUBMITTED -> CONFIRMED should be legal';
  assert (select quantity_reserved from passes limit 1) = 0,
    format('confirm: reserved should be 0 — %s', t_counts());
  assert (select quantity_sold from passes limit 1) = 2,
    format('confirm: sold should be 2 — %s', t_counts());
  assert (select confirmed_at is not null from bookings where booking_code = v_code),
    'confirm: confirmed_at should be set';
  raise notice 'PASS  confirm moves reserved -> sold (%)', t_counts();
end $$;

-- ================================= 3. illegal transitions are rejected ======
do $$
declare r record; v_code text; res record; before text;
begin
  select booking_code into v_code from bookings where status = 'CONFIRMED' limit 1;
  before := t_counts();

  select * into res from set_booking_status(v_code, 'PAYMENT_SUBMITTED');
  assert not res.ok, 'transitions: CONFIRMED -> PAYMENT_SUBMITTED must be rejected';
  assert t_counts() = before, format('transitions: inventory changed on a rejected move — %s', t_counts());

  -- Cancel it (legal refund path), then try to resurrect it.
  select * into res from set_booking_status(v_code, 'CANCELLED');
  assert res.ok, 'transitions: CONFIRMED -> CANCELLED should be legal (refund)';
  before := t_counts();
  select * into res from set_booking_status(v_code, 'CONFIRMED');
  assert not res.ok, 'transitions: CANCELLED -> CONFIRMED must be rejected';
  assert t_counts() = before,
    format('transitions: cancelled booking re-confirmed and moved stock — %s', t_counts());

  select * into res from set_booking_status('18SE-NOPE', 'CONFIRMED');
  assert not res.ok, 'transitions: unknown booking code must be rejected';
  raise notice 'PASS  illegal transitions rejected without touching inventory (%)', t_counts();
end $$;

-- ======================================== 5. reject releases reserved =======
do $$
declare r record; v_code text; res record;
begin
  select * into r from create_booking('villa-after-dark','General Pass','Reject Test',
    '9990000003','e@x.com','',3,'', 'test-reject');
  v_code := r.booking_code;
  perform set_booking_status(v_code, 'PAYMENT_SUBMITTED');
  assert (select quantity_reserved from passes limit 1) = 3,
    format('reject: expected 3 reserved — %s', t_counts());
  select * into res from set_booking_status(v_code, 'REJECTED');
  assert res.ok, 'reject: PAYMENT_SUBMITTED -> REJECTED should be legal';
  assert (select quantity_reserved from passes limit 1) = 0,
    format('reject: reservation not released — %s', t_counts());
  raise notice 'PASS  reject releases reserved (%)', t_counts();
end $$;

-- ================================ 7. zero-row payment update is detectable ==
do $$
declare n integer;
begin
  with updated as (
    update bookings set status = 'PAYMENT_SUBMITTED', utr = 'X'
     where booking_code = '18SE-DOESNOTEXIST' and status = 'PENDING_PAYMENT'
    returning 1
  ) select count(*) into n from updated;
  assert n = 0, 'zero-row: expected no rows updated';
  raise notice 'PASS  payment update on a bogus code changes 0 rows (app must check this)';
end $$;

-- ========================================= 5b. per-phone hold limit =========
do $$
declare r record;
begin
  select * into r from create_booking('villa-after-dark','General Pass','Hold A',
    '9995550000','a@x.com','',1,'', 'test-holds-1');
  assert r.ok, 'holds: first hold should succeed';
  select * into r from create_booking('villa-after-dark','General Pass','Hold B',
    '9995550000','a@x.com','',1,'', 'test-holds-2');
  assert r.ok, 'holds: second hold should succeed';
  select * into r from create_booking('villa-after-dark','General Pass','Hold C',
    '9995550000','a@x.com','',1,'', 'test-holds-3');
  assert not r.ok, 'holds: third concurrent hold on one phone must be refused';
  raise notice 'PASS  per-phone open-hold limit enforced (%)', r.message;
end $$;

-- ============================================ 5c. per-client rate limit =====
do $$
declare r record; i integer; refused boolean := false;
begin
  for i in 1..7 loop
    select * into r from create_booking('villa-after-dark','General Pass','Flood '||i,
      '99966600'||lpad(i::text,2,'0'),'f@x.com','',1,'', 'test-flooder');
    if not r.ok and r.message like 'Too many%' then refused := true; exit; end if;
  end loop;
  assert refused, 'rate limit: flooding one client key should be refused';
  raise notice 'PASS  per-client rate limit enforced';
end $$;

-- ================================================ grants for service_role ===
do $$
begin
  assert has_function_privilege('service_role',
    'create_booking(text,text,text,text,text,text,integer,text,text,integer,integer,integer,integer)', 'EXECUTE'),
    'grants: service_role cannot EXECUTE create_booking';
  assert has_function_privilege('service_role',
    'set_booking_status(text,booking_status,text)', 'EXECUTE'),
    'grants: service_role cannot EXECUTE set_booking_status';
  assert not has_function_privilege('anon',
    'create_booking(text,text,text,text,text,text,integer,text,text,integer,integer,integer,integer)', 'EXECUTE'),
    'grants: anon must NOT be able to EXECUTE create_booking';
  raise notice 'PASS  service_role can execute the RPCs; anon cannot';
end $$;
