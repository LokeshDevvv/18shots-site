-- Reset to a known state: one LIVE event, one pass with :total seats.
delete from bookings;
delete from booking_attempts;
delete from passes;
delete from events;

insert into events (name, slug, event_date, start_time, venue_label, capacity, status)
values ('Villa After Dark', 'villa-after-dark', '2026-09-19', '19:30', 'Private Villa', 150, 'LIVE');

insert into passes (event_id, name, price, quantity_total, sort_order)
select id, 'General Pass', 1499, :total, 1 from events where slug = 'villa-after-dark';
