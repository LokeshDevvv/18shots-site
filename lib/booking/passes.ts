import "server-only";
import { PASS_PREVIEW } from "@/lib/site";
import type { PassOption } from "@/lib/booking/types";

/**
 * Server-side pass catalogue. Prices are read here, never from the client —
 * a Server Function is reachable by direct POST, so a browser-supplied price
 * is an attacker-supplied price.
 *
 * Reads Supabase once the project is configured; falls back to the constants in
 * lib/site.ts so the flow is reviewable before the backend exists.
 */
export function getPassCatalogue(): PassOption[] {
  return PASS_PREVIEW.map((p) => ({
    key: p.key,
    name: p.name,
    price: p.price,
    strikePrice: p.strikePrice,
    note: p.note,
    featured: p.featured,
  }));
}

export function findPass(key: string): PassOption | undefined {
  return getPassCatalogue().find((p) => p.key === key);
}
