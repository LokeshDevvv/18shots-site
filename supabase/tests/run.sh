#!/usr/bin/env bash
# Runs the migrations and the SQL suite against a throwaway Postgres container.
#
#   ./supabase/tests/run.sh
#
# Needs Docker. The stub supplies the Supabase-only pieces the migrations touch
# (the auth schema, the anon/authenticated/service_role roles) so the same SQL
# can run without a Supabase project.
set -euo pipefail

CONTAINER=18shots-pg-test
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT
cleanup

docker run -d --name "$CONTAINER" -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=app postgres:16 >/dev/null
for _ in $(seq 1 60); do
  docker exec "$CONTAINER" pg_isready -U postgres -d app >/dev/null 2>&1 && break
  sleep 1
done

psql_run() { docker exec "$CONTAINER" psql -U postgres -d app -v ON_ERROR_STOP=1 "$@"; }

for f in "$ROOT"/supabase/tests/00_supabase_stub.sql \
         "$ROOT"/supabase/migrations/0001_init.sql \
         "$ROOT"/supabase/migrations/0003_booking_reservation.sql \
         "$ROOT"/supabase/migrations/0004_abuse_and_scheduling.sql \
         "$ROOT"/supabase/tests/10_fixture.sql \
         "$ROOT"/supabase/tests/20_tests.sql; do
  docker cp "$f" "$CONTAINER:/tmp/$(basename "$f")" >/dev/null
done

echo "── migrations ──"
psql_run -q -f /tmp/00_supabase_stub.sql
psql_run -q -f /tmp/0001_init.sql
psql_run -q -f /tmp/0003_booking_reservation.sql
psql_run -q -f /tmp/0004_abuse_and_scheduling.sql
echo "applied"

echo "── behaviour ──"
psql_run -q -v total=5 -f /tmp/10_fixture.sql
psql_run -f /tmp/20_tests.sql 2>&1 | grep -E "PASS|ERROR" || true

echo "── concurrency: 5 callers, 1 seat ──"
psql_run -q -v total=1 -f /tmp/10_fixture.sql
for i in 1 2 3 4 5; do
  docker exec "$CONTAINER" psql -U postgres -d app -tAc \
    "select ok from create_booking('villa-after-dark','General Pass','Racer $i','99900000$i','r@x.com','',1,'','racer-$i');" &
done > /tmp/race.$$ 2>&1
wait
wins=$(grep -c '^t$' /tmp/race.$$ || true)
inv=$(docker exec "$CONTAINER" psql -U postgres -d app -tAc "select 'reserved='||quantity_reserved||' bookings='||(select count(*) from bookings) from passes;")
rm -f /tmp/race.$$
if [ "$wins" = "1" ]; then echo "PASS  exactly one caller won ($inv)"; else echo "FAIL  $wins callers won ($inv)"; exit 1; fi
