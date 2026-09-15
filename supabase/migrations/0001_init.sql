-- 18SHOTS Events — V1 schema
-- Mirrors docs/18shots-events-design.md § 7.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums ----

create type booking_status as enum (
  'PENDING_PAYMENT',
  'PAYMENT_SUBMITTED',
  'CONFIRMED',
  'REJECTED',
  'CANCELLED',
  'CHECKED_IN'
);

create type event_status as enum ('DRAFT', 'LIVE', 'SOLD_OUT', 'CLOSED');

-- --------------------------------------------------------------- events ----

create table events (
  id                    uuid primary key default gen_random_uuid(),
  name                  text        not null,
  slug                  text        not null unique,
  event_date            date        not null,
  start_time            time        not null,
  venue_label           text        not null,
  venue_private_details text,
  capacity              integer     not null check (capacity > 0),
  status                event_status not null default 'DRAFT',
  hero_media_url        text,
  created_at            timestamptz not null default now()
);

-- --------------------------------------------------------------- passes ----

create table passes (
  id                uuid primary key default gen_random_uuid(),
  event_id          uuid    not null references events(id) on delete cascade,
  name              text    not null,
  price             integer not null check (price >= 0),          -- whole rupees
  quantity_total    integer not null check (quantity_total >= 0),
  quantity_reserved integer not null default 0 check (quantity_reserved >= 0),
  quantity_sold     integer not null default 0 check (quantity_sold >= 0),
  active            boolean not null default true,
  sort_order        integer not null default 0,
  constraint passes_not_oversold
    check (quantity_reserved + quantity_sold <= quantity_total)
);

create index passes_event_id_idx on passes (event_id);

-- ------------------------------------------------------------- bookings ----

create table bookings (
  id               uuid primary key default gen_random_uuid(),
  booking_code     text        not null unique,
  event_id         uuid        not null references events(id) on delete restrict,
  pass_id          uuid        not null references passes(id) on delete restrict,
  customer_name    text        not null,
  phone            text        not null,
  email            text        not null,
  instagram        text,
  quantity         integer     not null check (quantity between 1 and 10),
  amount           integer     not null check (amount >= 0),
  payment_method   text        not null default 'UPI',
  utr              text,
  payment_proof_url text,
  special_request  text,
  status           booking_status not null default 'PENDING_PAYMENT',
  admin_note       text,
  entry_code       text unique,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  confirmed_at     timestamptz
);

create index bookings_event_id_idx  on bookings (event_id);
create index bookings_status_idx    on bookings (status);
create index bookings_created_at_idx on bookings (created_at desc);

-- Booking codes: 18SE-1001, 18SE-1002, ...
create sequence booking_code_seq start with 1001;

create or replace function set_booking_code()
returns trigger
language plpgsql
as $$
begin
  if new.booking_code is null or new.booking_code = '' then
    new.booking_code := '18SE-' || nextval('booking_code_seq')::text;
  end if;
  return new;
end;
$$;

create trigger bookings_set_code
  before insert on bookings
  for each row execute function set_booking_code();

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger bookings_touch_updated_at
  before update on bookings
  for each row execute function touch_updated_at();

-- ------------------------------------------------------------------ RLS ----
-- Public site reads events/passes. Everything else goes through the server
-- (service role) or an authenticated admin. Customers never read bookings
-- directly — the confirmation page is served by a route that looks the booking
-- up by code on the server.

alter table events   enable row level security;
alter table passes   enable row level security;
alter table bookings enable row level security;

create table admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

create policy "events are publicly readable when live"
  on events for select
  using (status in ('LIVE', 'SOLD_OUT') or is_admin());

create policy "active passes are publicly readable"
  on passes for select
  using (active or is_admin());

create policy "admins read bookings"
  on bookings for select
  using (is_admin());

create policy "admins update bookings"
  on bookings for update
  using (is_admin())
  with check (is_admin());

create policy "admins read admin list"
  on admins for select
  using (is_admin());
