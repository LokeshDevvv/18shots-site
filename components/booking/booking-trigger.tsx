"use client";

import { ctaClass } from "@/components/ui/cta";
import { useBooking } from "@/components/booking/booking-provider";

/**
 * Replaces every former <Link href="/book">. That route never existed, so those
 * CTAs 404'd; booking is in-page now and the site stays a single page at /.
 */
export function BookingTrigger({
  passKey,
  variant,
  size,
  className,
  onActivate,
  children,
}: {
  passKey?: string;
  variant?: "ghost" | "solid";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** e.g. close the mobile menu before the sheet opens. */
  onActivate?: () => void;
  children: React.ReactNode;
}) {
  const { open } = useBooking();

  return (
    <button
      type="button"
      className={ctaClass({ variant, size, className })}
      onClick={() => {
        onActivate?.();
        open(passKey);
      }}
    >
      {children}
    </button>
  );
}
