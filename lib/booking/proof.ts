import "server-only";
import { ACCEPTED_PROOF_TYPES, MAX_PROOF_BYTES } from "@/lib/booking/schema";

/**
 * The browser checks type and size before upload, but a Server Function accepts
 * direct POSTs, so the same checks have to exist here. The extension comes from
 * an allowlist rather than the submitted filename — never from user input.
 */

const EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

export type ProofCheck =
  | { ok: true; file: File; extension: string }
  | { ok: false; reason: string };

export function validateProof(value: FormDataEntryValue | null): ProofCheck | null {
  if (!(value instanceof File) || value.size === 0) return null;

  if (!ACCEPTED_PROOF_TYPES.includes(value.type)) {
    return { ok: false, reason: "Upload a JPG, PNG or WebP screenshot." };
  }
  if (value.size > MAX_PROOF_BYTES) {
    return { ok: false, reason: "That image is over 5 MB." };
  }

  const extension = EXTENSION[value.type];
  if (!extension) return { ok: false, reason: "Unsupported image type." };

  return { ok: true, file: value, extension };
}
