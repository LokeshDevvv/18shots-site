import "server-only";
import { EVENT, PASS_PREVIEW } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/booking/env";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PassOption } from "@/lib/booking/types";

/**
 * Server-side pass catalogue.
 *
 * Supabase is the source of truth for price, active state and remaining
 * inventory. Presentation metadata the schema doesn't carry — the strike-through
 * price, the one-line note, which pass is featured — stays in PASS_PREVIEW and
 * is matched by name.
 *
 * Prices are never taken from the client: a Server Function accepts direct
 * POSTs, so a browser-supplied price is an attacker-supplied price.
 */

const PRESENTATION = new Map(
  PASS_PREVIEW.map((p) => [p.name.toLowerCase(), p] as const),
);

function fallbackCatalogue(): PassOption[] {
  return PASS_PREVIEW.map((p) => ({
    key: p.key,
    name: p.name,
    price: p.price,
    strikePrice: p.strikePrice,
    note: p.note,
    featured: p.featured,
  }));
}

export async function getPassCatalogue(): Promise<PassOption[]> {
  if (!isSupabaseConfigured()) return fallbackCatalogue();

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("passes")
    .select(
      "name, price, active, quantity_total, quantity_reserved, quantity_sold, sort_order, events!inner(slug)",
    )
    .eq("events.slug", EVENT.slug)
    .eq("active", true)
    .order("sort_order");

  // A backend hiccup must not take the pass list off the page.
  if (error || !data?.length) return fallbackCatalogue();

  return data.map((row) => {
    const meta = PRESENTATION.get(row.name.toLowerCase());
    const remaining = row.quantity_total - row.quantity_reserved - row.quantity_sold;

    return {
      key: meta?.key ?? row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: row.name.toUpperCase(),
      price: row.price,
      strikePrice: meta?.strikePrice ?? null,
      note: meta?.note ?? "",
      featured: meta?.featured ?? false,
      soldOut: remaining <= 0,
    };
  });
}

export async function findPass(key: string): Promise<PassOption | undefined> {
  return (await getPassCatalogue()).find((p) => p.key === key);
}
