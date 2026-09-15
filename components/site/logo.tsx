import { cn } from "@/lib/utils";

/**
 * 18SHOTS wordmark.
 *
 * A typographic lockup rather than two coloured words: the numeral is set in
 * the display didone, a hairline gold rule separates it, and the name runs in
 * letterspaced grotesk. That contrast is the brand's, and it survives at 14px
 * in the header.
 *
 * TODO client: the ornate crest (Instagram) is still needed as SVG for hero,
 * footer and social moments. The pack's "logo reference" is unusable — it's a
 * zoomed screenshot crop, not artwork. Once the real file lands, add it here as
 * a `crest` variant; every call site already goes through this component.
 */
export function Logo({
  className,
  withEvents = false,
}: {
  className?: string;
  /** Adds the small EVENTS line — footer and standalone moments. */
  withEvents?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span className="inline-flex items-center gap-[0.45em]">
        <span
          className="font-[family-name:var(--font-bodoni)] leading-none tracking-[-0.02em]"
          style={{ fontSize: "1.32em" }}
        >
          18
        </span>
        <span className="bg-gold h-[1.1em] w-px shrink-0" aria-hidden />
        <span className="font-sans leading-none font-medium tracking-[0.26em] uppercase">
          Shots
        </span>
      </span>

      {withEvents && (
        <span className="label-micro mt-2 ml-[0.1em] tracking-[0.42em]">Events</span>
      )}
    </span>
  );
}
