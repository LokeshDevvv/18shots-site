import { BRAND, EVENT } from "@/lib/site";
import { CtaLink } from "@/components/ui/cta";
import { ScrollCue } from "@/components/sections/scroll-cue";

/**
 * The hero type lockup — masked line-by-line reveal on load, then the page
 * stays still. Pure CSS (see globals.css § Entrance motion): no client JS, so
 * the headline paints immediately and survives a JS failure.
 */

/** Staggered start times, in seconds, in reading order. */
const D = {
  eyebrow: 0.15,
  line: (i: number) => 0.24 + i * 0.09,
  subtitle: 0.6,
  meta: 0.72,
  tagline: 0.84,
};

const delay = (s: number) => ({ animationDelay: `${s}s` });

export function HeroLockup() {
  return (
    <div className="relative z-30 flex flex-1 flex-col items-center justify-end pb-10 text-center md:items-start md:pb-10 md:text-left">
      <p className="label-micro animate-fade-up" style={delay(D.eyebrow)}>
        {BRAND.eventsName} <span className="text-gold">/</span> {EVENT.edition}
      </p>

      <h1 className="type-display mt-5 text-[clamp(3.25rem,13vw,5.5rem)] md:mt-7 md:text-[min(9.5vw,19vh)]">
        <span className="sr-only">{EVENT.title.join(" ")}</span>
        {EVENT.title.map((word, i) => (
          <span key={word} className="block overflow-hidden pb-[0.04em]">
            <span
              className="animate-reveal-line block"
              style={delay(D.line(i))}
              aria-hidden
            >
              {word}
            </span>
          </span>
        ))}
      </h1>

      <p
        className="label-micro animate-fade-up mt-5 hidden tracking-[0.3em] md:block"
        style={delay(D.subtitle)}
      >
        {EVENT.subtitle}
      </p>

      {/* Desktop: three-column fact row with hairline dividers. */}
      <div
        className="border-line animate-fade-up mt-9 hidden max-w-2xl border-t pt-6 md:block"
        style={delay(D.meta)}
      >
        <dl className="divide-line grid grid-cols-3 divide-x">
          <MetaCell value={EVENT.dateLabel} label={EVENT.dayLabel} className="pr-8" />
          <MetaCell value={EVENT.city} label={EVENT.venueLabel} className="px-8" />
          <MetaCell value={EVENT.startTime} label={EVENT.timeNote} className="px-8" />
        </dl>
      </div>

      {/* Mobile: one condensed line, then the primary CTA in thumb reach. */}
      <p
        className="animate-fade-up mt-6 flex items-center justify-center gap-3 md:hidden"
        style={delay(D.meta)}
      >
        <span className="font-sans text-sm tracking-[0.22em]">{EVENT.dateLabel}</span>
        <span className="bg-line h-4 w-px" aria-hidden />
        <span className="font-sans text-sm tracking-[0.22em]">{EVENT.city}</span>
      </p>

      <div
        className="animate-fade-up mt-9 flex flex-col items-center gap-9 md:hidden"
        style={delay(D.tagline)}
      >
        <CtaLink href="/book" variant="solid" size="lg" className="px-12">
          Get Passes →
        </CtaLink>
        <ScrollCue />
      </div>

      <p
        className="label-micro animate-fade-up mt-10 hidden leading-[2] md:block"
        style={delay(D.tagline)}
      >
        {BRAND.tagline[0]}
        <br />
        {BRAND.tagline[1]} <span className="text-gold-hi">✦</span>
      </p>
    </div>
  );
}

function MetaCell({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="font-sans text-lg tracking-[0.18em] lg:text-xl">{value}</dt>
      <dd className="label-micro mt-2">{label}</dd>
    </div>
  );
}
