"use server";

import { randomInt } from "node:crypto";
import { detailsSchema, paymentSchema } from "@/lib/booking/schema";
import { findPass } from "@/lib/booking/passes";
import { validateProof } from "@/lib/booking/proof";
import { isSupabaseConfigured } from "@/lib/booking/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { EVENT } from "@/lib/site";
import type { ActionResult, CreatedBooking } from "@/lib/booking/types";

/** Shape returned by the create_booking RPC (migration 0003). */
type CreateBookingRow = {
  ok: boolean;
  message: string | null;
  booking_code: string | null;
  amount: number | null;
  remaining: number | null;
};

/**
 * Server Functions are reachable by direct POST, so everything is re-validated
 * here, the price is looked up server-side, and inventory is claimed inside a
 * single locking transaction (see supabase/migrations/0003).
 */

export async function createBooking(
  raw: unknown,
): Promise<ActionResult<CreatedBooking>> {
  const parsed = detailsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const values = parsed.data;
  const pass = await findPass(values.passKey);
  if (!pass) return { ok: false, error: "That pass is no longer available." };

  if (!isSupabaseConfigured()) {
    // Preview mode — see lib/booking/env.ts. Nothing is written.
    return {
      ok: true,
      data: {
        bookingCode: `18SE-${1000 + randomInt(1, 999)}`,
        amount: pass.price * values.quantity,
        passName: pass.name,
        quantity: values.quantity,
      },
    };
  }

  const supabase = createAdminClient();

  // One transaction: lock the pass row, verify availability, claim the seats,
  // insert the booking. Checking availability and inserting separately let two
  // callers both buy the last pass.
  const { data, error } = await supabase
    .rpc("create_booking", {
      p_event_slug: EVENT.slug,
      p_pass_name: pass.name,
      p_customer_name: values.customerName,
      p_phone: values.phone,
      p_email: values.email,
      p_instagram: values.instagram ?? "",
      p_quantity: values.quantity,
      p_special_request: values.specialRequest ?? "",
    })
    .returns<CreateBookingRow[]>()
    .single();

  if (error || !data) {
    return { ok: false, error: "We couldn't start your booking. Please try again." };
  }

  if (!data.ok || !data.booking_code || data.amount === null) {
    return { ok: false, error: data.message ?? "That pass is no longer available." };
  }

  return {
    ok: true,
    data: {
      bookingCode: data.booking_code,
      amount: data.amount,
      passName: pass.name,
      quantity: values.quantity,
    },
  };
}

export async function submitPayment(
  raw: unknown,
  proof: FormData | null,
): Promise<ActionResult<{ bookingCode: string }>> {
  const parsed = paymentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { bookingCode, utr } = parsed.data;

  // Re-check the upload server-side; the browser's checks are a courtesy.
  const checked = validateProof(proof?.get("proof") ?? null);
  if (checked && !checked.ok) {
    return { ok: false, error: checked.reason, fieldErrors: { proof: [checked.reason] } };
  }

  if (!isSupabaseConfigured()) {
    return { ok: true, data: { bookingCode } };
  }

  const supabase = createAdminClient();
  let proofUrl: string | null = null;

  if (checked?.ok) {
    const path = `${bookingCode}/${Date.now()}.${checked.extension}`;
    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(path, checked.file, { contentType: checked.file.type, upsert: false });

    // A failed upload must not block the booking — admins can still verify by
    // UTR, and losing the whole submission over an image would cost a sale.
    if (!uploadError) proofUrl = path;
  }

  // `.select()` matters: an update matching zero rows returns no error, so
  // without it a wrong or already-submitted code would report success.
  const { data, error } = await supabase
    .from("bookings")
    .update({ utr, payment_proof_url: proofUrl, status: "PAYMENT_SUBMITTED" })
    .eq("booking_code", bookingCode)
    .eq("status", "PENDING_PAYMENT")
    .select("booking_code");

  if (error) {
    return { ok: false, error: "We couldn't record your payment. Please try again." };
  }

  if (!data || data.length !== 1) {
    return {
      ok: false,
      error:
        "We couldn't find a booking waiting for payment under that reference. " +
        "If you've already submitted it, we're on it — no need to pay twice.",
    };
  }

  return { ok: true, data: { bookingCode } };
}
