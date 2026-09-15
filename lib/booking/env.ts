/**
 * Supabase is not wired up yet (no project, no keys). Until it is, the booking
 * flow runs in preview mode: the UI is fully exercised but nothing is persisted,
 * and every screen says so. The moment the env vars land this returns true and
 * the same code path writes real rows.
 */
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export const IS_PREVIEW_BOOKING = !isSupabaseConfigured();
