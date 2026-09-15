import { HeroMedia } from "@/components/sections/hero-media";
import { HeroLockup } from "@/components/sections/hero-lockup";
import { ScrollCue } from "@/components/sections/scroll-cue";

export function Hero() {
  return (
    <section id="hero" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <HeroMedia />

      <div className="shell relative z-30 flex flex-1 flex-col pt-24 md:pt-28">
        <HeroLockup />
      </div>

      {/* Baseline row: scroll cue left, age rule right. */}
      <div className="shell relative z-30 hidden items-end justify-between pb-12 md:flex">
        <ScrollCue />
        <p className="label-micro text-right leading-[1.6]">
          Strictly
          <br />
          <span className="text-ink text-base tracking-[0.1em]">21+</span>
        </p>
      </div>

    </section>
  );
}
