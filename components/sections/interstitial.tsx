import Image from "next/image";
import { BRAND, INTERSTITIAL } from "@/lib/site";

/**
 * Full-bleed monochrome break between 02 and 03 — the loudest moment on the
 * page. Deliberately breaks the shell gutter: everything else is measured, this
 * runs edge to edge.
 */
export function Interstitial() {
  return (
    <section className="relative isolate">
      <div className="relative h-[70svh] min-h-[26rem] w-full overflow-hidden md:h-[82svh]">
        <Image
          src={INTERSTITIAL.image}
          alt={INTERSTITIAL.alt}
          fill
          sizes="100vw"
          className="object-cover grayscale"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,5,5,0.62) 0%, rgba(5,5,5,0.28) 40%, rgba(5,5,5,0.78) 100%)",
          }}
        />

        <div className="shell absolute inset-0 flex flex-col justify-end pb-10 md:pb-16">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between md:gap-16">
            <h2 className="type-display text-[clamp(2.5rem,10vw,7rem)]">
              {INTERSTITIAL.headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>

            <div className="md:max-w-[15rem] md:pb-3">
              {INTERSTITIAL.lines.map((line) => (
                <p key={line} className="text-ink-dim font-sans text-sm leading-[1.9]">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <p className="label-micro mt-8 tracking-[0.4em]">{BRAND.name}</p>
        </div>
      </div>
    </section>
  );
}
