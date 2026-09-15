"use client";

import { useEffect, useState } from "react";
import { useBooking } from "@/components/booking/booking-provider";
import { BookingTrigger } from "@/components/booking/booking-trigger";
import { EVENT } from "@/lib/site";
import { cn, formatINR } from "@/lib/utils";

/**
 * Mobile-only booking bar. Slides in once the hero has scrolled past and
 * retires at the Passes section, where the real pass blocks take over — a
 * floating CTA competing with the thing it points at is just clutter.
 *
 * Uses IntersectionObserver on the two sections rather than a scroll listener,
 * so nothing runs between crossings.
 */
export function StickyCta() {
  const { isOpen, passes, catalogueUnavailable } = useBooking();
  const [heroPassed, setHeroPassed] = useState(false);
  const [passesReached, setPassesReached] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const passSection = document.getElementById("passes");
    if (!hero || !passSection) return;

    // "Above the viewport" is !isIntersecting plus a negative top — without the
    // rect check, a section far *below* the fold reads the same way.
    const heroObserver = new IntersectionObserver(
      ([entry]) =>
        setHeroPassed(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );

    const passObserver = new IntersectionObserver(
      ([entry]) =>
        setPassesReached(
          entry.isIntersecting || entry.boundingClientRect.top < 0,
        ),
      { threshold: 0 },
    );

    heroObserver.observe(hero);
    passObserver.observe(passSection);
    return () => {
      heroObserver.disconnect();
      passObserver.disconnect();
    };
  }, []);

  const cheapest = passes.length
    ? passes.reduce((low, p) => (p.price < low.price ? p : low))
    : null;

  const visible = heroPassed && !passesReached && !isOpen && !catalogueUnavailable;

  return (
    <div
      data-sticky-cta
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 md:hidden",
        "border-line bg-bg/95 border-t backdrop-blur-sm",
        "transition-transform duration-300 ease-[var(--ease-editorial)]",
        visible ? "translate-y-0" : "translate-y-full",
      )}
      // Sits below the home indicator on notched iPhones.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      // Off-screen it should be unreachable, not merely invisible.
      inert={!visible}
      aria-hidden={!visible}
    >
      <div className="shell flex items-center justify-between gap-4 py-3.5">
        <div className="flex flex-col gap-1">
          <span className="label-micro">{EVENT.dateLabel}</span>
          {cheapest && (
            <span className="font-sans text-[var(--text-caption)]">
              From {formatINR(cheapest.price)}
            </span>
          )}
        </div>

        <BookingTrigger variant="solid" size="md" className="px-7">
          Get Passes →
        </BookingTrigger>
      </div>
    </div>
  );
}
