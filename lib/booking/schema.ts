import { z } from "zod";

/**
 * Shared by the client form and the server action. Server Functions are
 * reachable by direct POST, so the action re-parses with these same schemas
 * rather than trusting whatever the browser sent.
 */

export const MAX_QUANTITY = 10;

export const detailsSchema = z.object({
  passKey: z.string().min(1, "Choose a pass"),
  quantity: z
    .number()
    .int()
    .min(1, "At least one pass")
    .max(MAX_QUANTITY, `Maximum ${MAX_QUANTITY} passes per booking`),
  customerName: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(80, "That name is too long"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number"),
  email: z.email("Enter a valid email address"),
  instagram: z
    .string()
    .trim()
    .max(40)
    .transform((v) => v.replace(/^@/, ""))
    .optional()
    .or(z.literal("")),
  specialRequest: z.string().trim().max(300, "Keep it under 300 characters").optional(),
});

export type DetailsInput = z.input<typeof detailsSchema>;
export type DetailsValues = z.output<typeof detailsSchema>;

export const paymentSchema = z.object({
  bookingCode: z.string().min(1),
  utr: z
    .string()
    .trim()
    .min(6, "UTR is at least 6 characters")
    .max(30, "That doesn't look like a UTR")
    .regex(/^[A-Za-z0-9]+$/, "UTR is letters and numbers only"),
});

export type PaymentValues = z.output<typeof paymentSchema>;

/** Payment proof: optional, but strongly recommended. */
export const MAX_PROOF_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
