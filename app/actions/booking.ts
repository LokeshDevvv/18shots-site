"use server";

import { randomInt } from "node:crypto";
import { detailsSchema, paymentSchema } from "@/lib/booking/schema";
import { findPass } from "@/lib/booking/passes";
import { isSupabaseConfigured } from "@/lib/booking/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { EVENT } from "@/lib/site";
import type { ActionResult, CreatedBooking } from "@/lib/booking/types";

/**
 * Server Functions are reachable by direct POST, so everything is re-validated
 * here and the price is looked up server-side rather than taken from the form.
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
  const pass = findPass(values.passKey);
  if (!pass) return { ok: false, error: "That pass is no longer available." };

  const amount = pass.price * values.quantity;

  if (!isSupabaseConfigured()) {
    // Preview mode — see lib/booking/env.ts. Nothing is written.
    return {
      ok: true,
      data: {
        bookingCode: `18SE-${1000 + randomInt(1, 999)}`,
        amount,
        passName: pass.name,
        quantity: values.quantity,
      },
    };
  }

  const supabase = createAdminClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("slug", EVENT.slug)
    .single();

  if (eventError || !event) {
    return { ok: false, error: "This event is not open for bookings right now." };
  }

  const { data: passRow, error: passError } = await supabase
    .from("passes")
    .select("id, price, quantity_total, quantity_reserved, quantity_sold")
    .eq("event_id", event.id)
    .eq("name", pass.name)
    .eq("active", true)
    .single();

  if (passError || !passRow) {
    return { ok: false, error: "That pass is no longer available." };
  }

  const remaining =
    passRow.quantity_total - passRow.quantity_reserved - passRow.quantity_sold;
  if (remaining < values.quantity) {
    return {
      ok: false,
      error:
        remaining > 0
          ? `Only ${remaining} left on this pass.`
          : "This pass has sold out.",
    };
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      event_id: event.id,
      pass_id: passRow.id,
      customer_name: values.customerName,
      phone: values.phone,
      email: values.email,
      instagram: values.instagram || null,
      quantity: values.quantity,
      // Priced from the database row, not from the client.
      amount: passRow.price * values.quantity,
      special_request: values.specialRequest || null,
      status: "PENDING_PAYMENT",
    })
    .select("booking_code, amount")
    .single();

  if (error || !booking) {
    return { ok: false, error: "We couldn't start your booking. Please try again." };
  }

  return {
    ok: true,
    data: {
      bookingCode: booking.booking_code,
      amount: booking.amount,
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

  if (!isSupabaseConfigured()) {
    return { ok: true, data: { bookingCode } };
  }

  const supabase = createAdminClient();
  let proofUrl: string | null = null;

  const file = proof?.get("proof");
  if (file instanceof File && file.size > 0) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${bookingCode}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(path, file, { contentType: file.type, upsert: false });

    // A failed upload must not block the booking — admins can still verify by
    // UTR, and losing the whole submission over an image would cost a sale.
    if (!uploadError) proofUrl = path;
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      utr,
      payment_proof_url: proofUrl,
      status: "PAYMENT_SUBMITTED",
    })
    .eq("booking_code", bookingCode)
    .eq("status", "PENDING_PAYMENT");

  if (error) {
    return { ok: false, error: "We couldn't record your payment. Please try again." };
  }

  return { ok: true, data: { bookingCode } };
}
