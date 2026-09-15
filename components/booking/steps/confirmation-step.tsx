"use client";

import { BRAND, EVENT } from "@/lib/site";
import { useBooking } from "@/components/booking/booking-provider";
import { CtaButton } from "@/components/ui/cta";
import { formatINR } from "@/lib/utils";

const STAGES = ["Booking received", "Payment verification", "Entry confirmed"] as const;

export function ConfirmationStep() {
  const { booking, close } = useBooking();
  if (!booking) return null;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <p className="label-micro">Request received</p>
        <p className="type-display text-4xl md:text-5xl">{booking.bookingCode}</p>
        <p className="text-ink-dim font-sans text-sm">
          {booking.passName} × {booking.quantity} · {formatINR(booking.amount)}
        </p>
      </div>

      <div className="bg-line h-px" aria-hidden />

      <ol className="flex flex-col gap-4">
        {STAGES.map((stage, i) => (
          <li key={stage} className="flex items-center gap-3.5">
            <span
              className={
                i === 0
                  ? "bg-gold-hi size-2 rounded-full"
                  : i === 1
                    ? "border-gold size-2 rounded-full border"
                    : "bg-line size-2 rounded-full"
              }
              aria-hidden
            />
            <span className={i === 0 ? "font-sans text-sm" : "text-ink-dim font-sans text-sm"}>
              {stage}
            </span>
            {i === 1 && <span className="label-micro text-gold ml-auto">In review</span>}
          </li>
        ))}
      </ol>

      <div className="border-line flex flex-col gap-2 border p-4">
        <p className="font-sans text-sm leading-relaxed">
          We&apos;ll send your confirmed pass on WhatsApp once payment is verified.
        </p>
        <p className="text-ink-dim font-sans text-xs leading-relaxed">
          {EVENT.locationNote} Entry is strictly 21+ with a valid photo ID.
        </p>
      </div>

      <CtaButton variant="ghost" size="lg" onClick={close}>
        Done
      </CtaButton>

      <p className="label-micro text-center">
        {BRAND.name} · {EVENT.dateLabel} · {EVENT.city}
      </p>
    </div>
  );
}
