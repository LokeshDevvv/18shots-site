import { cn } from "@/lib/utils";

/**
 * Placeholder wordmark.
 *
 * TODO client: replace with the 18SHOTS crest as SVG at public/brand/18shots.svg,
 * then swap this body for <Image src="/brand/18shots.svg" … />. Keeping it as a
 * component means one edit when the asset lands.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "type-display text-gold-hi leading-none tracking-[0.02em]",
        className,
      )}
    >
      18
      <span className="text-ink">SHOTS</span>
    </span>
  );
}
