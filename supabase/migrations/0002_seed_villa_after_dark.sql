-- Seed for local/dev only.
-- ⚠ Values are provisional (read off the approved mockup). Confirm with the
-- client before running against production.

insert into events (name, slug, event_date, start_time, venue_label, capacity, status)
values (
  'Villa After Dark',
  'villa-after-dark',
  '2026-09-19',
  '19:30',
  'Private Villa, Chennai',
  150,
  'DRAFT'
)
on conflict (slug) do nothing;

insert into passes (event_id, name, price, quantity_total, sort_order)
select e.id, v.name, v.price, v.qty, v.sort_order
from events e
cross join (values
  ('Early Bird',   999, 25,  1),
  ('General Pass', 1499, 100, 2),
  ('Couple Pass',  2499, 25,  3)
) as v(name, price, qty, sort_order)
where e.slug = 'villa-after-dark';
