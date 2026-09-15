import { Hero } from "@/components/sections/hero";

/**
 * Phase 2 — sections land in mockup order:
 * hero ✓ → 01 the event → 02 experience → interstitial → 03 details →
 * 04 passes → 05 gallery → 06 faq → final CTA.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <div id="event" className="shell py-24">
        <p className="label-micro">01 · The Event — next</p>
      </div>
    </>
  );
}
