import { cn } from "@/lib/utils";

/**
 * The numbered section marker from the mockup: gold index, uppercase label.
 * Used by every section so the numbering stays consistent as sections land.
 */
export function SectionEyebrow({
  index,
  label,
  aside,
  className,
}: {
  index: string;
  label: string;
  /** Optional right-aligned note, e.g. "MOMENTS FROM OUR NIGHTS". */
  aside?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-6", className)}>
      <p className="flex items-baseline gap-4">
        <span className="label-micro text-gold">{index}</span>
        <span className="label-micro">{label}</span>
      </p>
      {aside && <span className="label-micro text-right">{aside}</span>}
    </div>
  );
}
