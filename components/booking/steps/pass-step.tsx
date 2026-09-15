"use client";

import { Check } from "lucide-react";
import { useBooking } from "@/components/booking/booking-provider";
import { CtaButton } from "@/components/ui/cta";
import { formatINR, cn } from "@/lib/utils";

export function PassStep() {
  const { passes, passKey, selectPass, goTo } = useBooking();

  return (
    <div className="flex flex-col gap-6">
      <p className="label-micro">Choose your pass</p>

      <ul className="flex flex-col gap-3">
        {passes.map((pass) => {
          const selected = pass.key === passKey;
          return (
            <li key={pass.key}>
              <button
                type="button"
                onClick={() => selectPass(pass.key)}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-center justify-between border px-4 py-4 text-left",
                  "transition-colors duration-200",
                  selected
                    ? "border-gold bg-surface-raised"
                    : "border-line hover:border-line-strong",
                )}
              >
                <span className="flex flex-col gap-1.5">
                  <span className="label-micro text-ink">{pass.name}</span>
                  <span className="text-ink-dim font-sans text-xs">{pass.note}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="flex flex-col items-end">
                    <span className="font-sans text-lg">{formatINR(pass.price)}</span>
                    {pass.strikePrice && (
                      <span className="text-ink-dim font-sans text-xs line-through">
                        {formatINR(pass.strikePrice)}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border transition-colors duration-200",
                      selected ? "border-gold bg-gold-hi text-bg" : "border-line",
                    )}
                    aria-hidden
                  >
                    {selected && <Check size={12} strokeWidth={2.5} />}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <CtaButton
        variant="solid"
        size="lg"
        disabled={!passKey}
        onClick={() => goTo("details")}
      >
        Continue →
      </CtaButton>
    </div>
  );
}
