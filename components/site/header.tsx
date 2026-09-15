"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV } from "@/lib/site";
import { cn } from "@/lib/utils";
import { BookingTrigger } from "@/components/booking/booking-trigger";
import { Wordmark } from "@/components/site/wordmark";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-[var(--ease-editorial)]",
        scrolled || open
          ? "bg-bg/92 border-b border-line backdrop-blur-sm"
          : "bg-transparent",
      )}
    >
      <div className="shell flex h-16 items-center justify-between md:h-20">
        <Link href="/" aria-label="18SHOTS home" onClick={() => setOpen(false)}>
          <Wordmark className="text-xl md:text-2xl" />
        </Link>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="label-micro text-ink transition-colors duration-200 hover:text-gold-hi"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <BookingTrigger size="sm" className="hidden md:inline-flex">
          Get Passes
        </BookingTrigger>

        <button
          type="button"
          className="-mr-2 p-2 text-ink md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile drawer. `inert` when closed (not just aria-hidden) so its links
          and CTA are unreachable by keyboard and assistive tech, not merely
          invisible. */}
      <div
        className={cn(
          "bg-bg fixed inset-x-0 top-16 bottom-0 md:hidden",
          "transition-opacity duration-300 ease-[var(--ease-editorial)]",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        inert={!open}
      >
        <nav className="shell flex flex-col pt-10" aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="type-headline border-line border-b py-5 text-3xl"
            >
              {item.label}
            </Link>
          ))}
          <BookingTrigger
            variant="solid"
            size="lg"
            className="mt-10"
            onActivate={() => setOpen(false)}
          >
            Get Passes →
          </BookingTrigger>
        </nav>
      </div>
    </header>
  );
}
