import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

/**
 * A coarse per-client key for booking rate limits. Hashed so we never store a
 * raw IP alongside booking records, and salted so the hashes aren't a rainbow
 * table of every visitor's address.
 *
 * Proxy headers are spoofable, so this raises the cost of flooding rather than
 * making it impossible — the per-phone open-hold limit in create_booking is the
 * stricter control.
 */
export async function getClientKey(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || h.get("x-real-ip") || "unknown";
  const salt = process.env.BOOKING_RATE_SALT ?? "18shots-dev-salt";

  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}
