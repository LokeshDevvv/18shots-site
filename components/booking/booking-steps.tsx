"use client";

import { useBooking } from "@/components/booking/booking-provider";
import { PassStep } from "@/components/booking/steps/pass-step";
import { DetailsStep } from "@/components/booking/steps/details-step";
import { PaymentStep } from "@/components/booking/steps/payment-step";
import { ConfirmationStep } from "@/components/booking/steps/confirmation-step";
import { cn } from "@/lib/utils";

const ORDER = ["details", "payment", "confirmation"] as const;
const LABELS = { details: "Details", payment: "Payment", confirmation: "Confirm" };

export function BookingSteps() {
  const { step, previewMode, catalogueUnavailable } = useBooking();

  if (catalogueUnavailable) {
    return (
      <div className="flex flex-col gap-4 px-5 py-10 md:px-7">
        <p className="type-headline text-2xl">Bookings temporarily unavailable.</p>
        <p className="type-body text-ink-dim">
          We can&apos;t reach our booking system right now, so we&apos;re not showing
          passes rather than risk quoting the wrong price or a pass that has
          already gone. Please try again shortly — or message us on Instagram and
          we&apos;ll sort you out.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 md:px-7 md:py-7">
      {previewMode && (
        <p className="border-gold/40 text-gold mb-6 border px-3.5 py-3 font-sans text-[13px] leading-relaxed">
          Preview mode — Supabase is not connected, so nothing on this screen is
          saved. Add the keys in <code>.env.local</code> to record real bookings.
        </p>
      )}

      {step !== "pass" && <StepIndicator current={step} />}

      {step === "pass" && <PassStep />}
      {step === "details" && <DetailsStep />}
      {step === "payment" && <PaymentStep />}
      {step === "confirmation" && <ConfirmationStep />}
    </div>
  );
}

function StepIndicator({ current }: { current: (typeof ORDER)[number] }) {
  const index = ORDER.indexOf(current);

  return (
    <ol className="mb-7 flex items-center gap-2.5" aria-label="Booking progress">
      {ORDER.map((key, i) => {
        const done = i < index;
        const active = i === index;
        return (
          <li key={key} className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full font-sans text-[13px] transition-colors duration-200",
                active && "bg-gold-hi text-bg",
                done && "border-gold text-gold border",
                !active && !done && "border-line text-ink-dim border",
              )}
              aria-current={active ? "step" : undefined}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "label-micro",
                active && "text-ink",
                done && "text-gold",
              )}
            >
              {LABELS[key]}
            </span>
            {i < ORDER.length - 1 && (
              <span className="bg-line ml-1 h-px w-4" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
