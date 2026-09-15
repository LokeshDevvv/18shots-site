import { cn } from "@/lib/utils";

/** Circular dot + SCROLL label. Label is desktop-only, per the mockup. */
export function ScrollCue({ className }: { className?: string }) {
  return (
    <a
      href="#event"
      className={cn("group flex items-center gap-4", className)}
      aria-label="Scroll to the event"
    >
      <span className="border-line group-hover:border-gold flex size-10 items-center justify-center rounded-full border transition-colors duration-200">
        <span className="bg-gold-hi motion-safe:animate-cue block size-1.5 rounded-full" />
      </span>
      <span className="label-micro group-hover:text-gold-hi hidden transition-colors duration-200 md:inline">
        Scroll
      </span>
    </a>
  );
}
