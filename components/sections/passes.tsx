"use client";

import { useBooking } from "@/components/booking/booking-provider";
import { BookingTrigger } from "@/components/booking/booking-trigger";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { cn, formatINR } from "@/lib/utils";

/**
 * 04 PASSES — admission objects, not pricing cards: straight edges, hairline
 * rules, the price set large. The featured pass gets a clipped gold tab and a
 * raised surface, nothing more.
 *
 * Reads the same catalogue the booking flow uses, so price and sold-out state
 * can never disagree between the page and the sheet.
 */
export function PassSection() {
  const { passes, catalogueUnavailable } = useBooking();

  return (
    <section id="passes" className="shell scroll-mt-24 pb-20 md:pb-32">
      <SectionEyebrow index="04" label="Passes" />

      <h2 className="type-headline mt-10 text-[clamp(2.25rem,5.5vw,3.5rem)] md:mt-14">
        Choose Your Pass.
      </h2>
      <p className="text-ink-dim mt-4 font-sans text-sm">
        Limited passes. Once we&apos;re full, bookings close.
      </p>

      {catalogueUnavailable ? (
        <p className="border-line mt-10 border p-6 font-sans text-sm">
          Bookings are temporarily unavailable. Please check back shortly.
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-3 md:gap-6">
          {passes.map((pass) => (
            <li
              key={pass.key}
              className={cn(
                "relative flex flex-col justify-between border p-7 md:p-8",
                pass.featured
                  ? "border-gold bg-surface-raised"
                  : "border-line bg-surface",
                pass.soldOut && "opacity-55",
              )}
            >
              {pass.featured && !pass.soldOut && (
                <span className="bg-gold-hi text-bg absolute -top-px left-7 px-3 py-1 font-sans text-[10px] tracking-[0.18em] uppercase">
                  Most popular
                </span>
              )}

              <div className={cn(pass.featured && "pt-3")}>
                <p className="label-micro text-ink">{pass.name}</p>

                <p className="mt-6 flex items-baseline gap-3">
                  <span className="type-display text-4xl md:text-5xl">
                    {formatINR(pass.price)}
                  </span>
                  {pass.strikePrice && (
                    <span className="text-ink-dim font-sans text-sm line-through">
                      {formatINR(pass.strikePrice)}
                    </span>
                  )}
                </p>

                {pass.note && (
                  <p className="text-ink-dim mt-3 font-sans text-sm">{pass.note}</p>
                )}
              </div>

              <div className="border-line mt-8 border-t pt-6">
                {pass.soldOut ? (
                  <p className="label-micro">Sold out</p>
                ) : (
                  <BookingTrigger
                    passKey={pass.key}
                    variant={pass.featured ? "solid" : "ghost"}
                    size="md"
                    className="w-full"
                  >
                    Book Now
                  </BookingTrigger>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
