"use client";

import { useRef, useState } from "react";
import { Check, Copy, ImageUp, X } from "lucide-react";
import { submitPayment } from "@/app/actions/booking";
import { ACCEPTED_PROOF_TYPES, MAX_PROOF_BYTES } from "@/lib/booking/schema";
import { useBooking } from "@/components/booking/booking-provider";
import { Field } from "@/components/ui/field";
import { CtaButton } from "@/components/ui/cta";
import { formatINR } from "@/lib/utils";

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID ?? null;

export function PaymentStep() {
  const { booking, goTo, setBusy } = useBooking();
  const [utr, setUtr] = useState("");
  const [utrError, setUtrError] = useState<string | undefined>();
  const [proof, setProof] = useState<File | null>(null);
  const [proofError, setProofError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  if (!booking) return null;

  function pickProof(file: File | null) {
    setProofError(undefined);
    if (!file) return setProof(null);
    if (!ACCEPTED_PROOF_TYPES.includes(file.type)) {
      return setProofError("Upload a JPG, PNG or WebP screenshot.");
    }
    if (file.size > MAX_PROOF_BYTES) {
      return setProofError("That image is over 5 MB. Try a screenshot instead of a photo.");
    }
    setProof(file);
  }

  async function copyUpi() {
    if (!UPI_ID) return;
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the ID is on screen to type manually.
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setUtrError(undefined);

    if (utr.trim().length < 6) {
      return setUtrError("Enter the UTR / transaction ID from your payment app.");
    }

    setSubmitting(true);
    setBusy(true);

    let proofData: FormData | null = null;
    if (proof) {
      proofData = new FormData();
      proofData.append("proof", proof);
    }

    const result = await submitPayment(
      { bookingCode: booking!.bookingCode, utr: utr.trim() },
      proofData,
    );

    setSubmitting(false);
    setBusy(false);

    if (!result.ok) {
      setFormError(result.error);
      if (result.fieldErrors?.utr?.[0]) setUtrError(result.fieldErrors.utr[0]);
      return;
    }

    goTo("confirmation");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <div className="border-line flex items-center justify-between border p-4">
        <div className="flex flex-col gap-1">
          <span className="label-micro">Amount due</span>
          <span className="text-ink-dim font-sans text-xs">
            {booking.passName} × {booking.quantity}
          </span>
        </div>
        <span className="font-sans text-2xl">{formatINR(booking.amount)}</span>
      </div>

      {/* UPI */}
      <div className="border-line flex flex-col items-center gap-4 border p-6">
        <p className="label-micro">Scan to pay</p>

        <div className="border-line bg-bg flex size-44 items-center justify-center border">
          {/* TODO client: drop the UPI QR at public/media/upi-qr.png and render it here. */}
          <p className="text-ink-dim px-6 text-center font-sans text-xs leading-relaxed">
            UPI QR code
            <br />
            pending from 18SHOTS
          </p>
        </div>

        {UPI_ID ? (
          <button
            type="button"
            onClick={copyUpi}
            className="border-line hover:border-gold flex items-center gap-2.5 border px-4 py-2.5 transition-colors duration-200"
          >
            <span className="font-sans text-sm">{UPI_ID}</span>
            {copied ? (
              <Check size={13} strokeWidth={2} className="text-gold-hi" />
            ) : (
              <Copy size={13} strokeWidth={1.5} className="text-ink-dim" />
            )}
            <span className="sr-only">Copy UPI ID</span>
          </button>
        ) : (
          <p className="text-ink-dim text-center font-sans text-xs">
            UPI ID pending from 18SHOTS.
          </p>
        )}
      </div>

      <div className="bg-line h-px" aria-hidden />

      <p className="label-micro">After paying</p>

      <Field label="UTR / Transaction ID" error={utrError}>
        {(p) => (
          <input
            {...p}
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            placeholder="e.g. 483910293015"
            inputMode="text"
            autoComplete="off"
          />
        )}
      </Field>

      {/* Payment proof */}
      <div className="flex flex-col gap-2">
        <span className="label-micro">Payment screenshot</span>

        {proof ? (
          <div className="border-line flex items-center justify-between border px-4 py-3">
            <span className="truncate font-sans text-sm">{proof.name}</span>
            <button
              type="button"
              onClick={() => {
                setProof(null);
                if (fileInput.current) fileInput.current.value = "";
              }}
              aria-label="Remove screenshot"
              className="text-ink-dim hover:text-ink ml-3 p-1 transition-colors duration-200"
            >
              <X size={15} strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="border-line hover:border-gold text-ink-dim hover:text-ink flex items-center justify-center gap-2.5 border border-dashed px-4 py-5 transition-colors duration-200"
          >
            <ImageUp size={16} strokeWidth={1.5} />
            <span className="font-sans text-sm">Upload screenshot</span>
          </button>
        )}

        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED_PROOF_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => pickProof(e.target.files?.[0] ?? null)}
        />

        <p
          className={proofError ? "font-sans text-xs text-red-400" : "text-ink-dim font-sans text-xs"}
          role={proofError ? "alert" : undefined}
        >
          {proofError ?? "Optional, but it gets your pass confirmed faster."}
        </p>
      </div>

      {formError && (
        <p role="alert" className="font-sans text-sm text-red-400">
          {formError}
        </p>
      )}

      <CtaButton type="submit" variant="solid" size="lg" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit payment"}
      </CtaButton>

      <p className="text-ink-dim font-sans text-xs leading-relaxed">
        Your reservation stays pending until we verify this payment. Booking
        {" "}
        <span className="text-ink">{booking.bookingCode}</span> is held while we check.
      </p>
    </form>
  );
}
