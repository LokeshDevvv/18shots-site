import { Hero } from "@/components/sections/hero";
import { EventStory } from "@/components/sections/event-story";
import { Experience } from "@/components/sections/experience";

/**
 * Sections land in mockup order:
 * hero ✓ → 01 the event ✓ → 02 experience ✓ → interstitial → 03 details →
 * 04 passes → 05 gallery → 06 faq → final CTA.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <EventStory />
      <Experience />
    </>
  );
}
