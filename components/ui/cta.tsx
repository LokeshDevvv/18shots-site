import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The two button treatments in the mockup and nothing else:
 *  - "ghost"  → hairline border, transparent fill  (OUR STORY ↗, BOOK NOW, VIEW MORE)
 *  - "solid"  → gold fill, dark label              (GET PASSES, GET YOUR PASS, Continue →)
 *
 * Glyphs are text (↗ / →), not an icon set.
 */

type Variant = "ghost" | "solid";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-sans uppercase " +
  "tracking-[0.14em] transition-colors duration-200 ease-[var(--ease-editorial)] " +
  "disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  ghost:
    "border border-line text-ink hover:border-gold hover:text-gold-hi " +
    "bg-transparent",
  solid: "bg-gold-hi text-bg hover:bg-gold",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[10px]",
  md: "h-11 px-6 text-[11px]",
  lg: "h-14 px-9 text-xs",
};

export function ctaClass({
  variant = "ghost",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type CtaLinkProps = React.ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function CtaLink({ variant, size, className, ...rest }: CtaLinkProps) {
  return <Link className={ctaClass({ variant, size, className })} {...rest} />;
}

type CtaButtonProps = React.ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function CtaButton({ variant, size, className, ...rest }: CtaButtonProps) {
  return <button className={ctaClass({ variant, size, className })} {...rest} />;
}
