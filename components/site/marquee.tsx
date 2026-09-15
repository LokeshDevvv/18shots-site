import { MARQUEE } from "@/lib/site";

/**
 * Thin ticker strip that sits above the footer on desktop.
 * CSS-only so it costs nothing and respects reduced motion via globals.css.
 */
export function Marquee() {
  const items = [...MARQUEE, ...MARQUEE, ...MARQUEE];

  return (
    <div className="border-line overflow-hidden border-y py-4">
      <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
        {items.map((item, i) => (
          <span key={`${item}-${i}`} className="label-micro flex items-center gap-10">
            {item}
            <span className="text-gold" aria-hidden>
              •
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
