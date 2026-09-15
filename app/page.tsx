import { Hero } from "@/components/sections/hero";
import { EventStory } from "@/components/sections/event-story";
import { Experience } from "@/components/sections/experience";
import { Interstitial } from "@/components/sections/interstitial";
import { EventDetails } from "@/components/sections/event-details";
import { PassSection } from "@/components/sections/passes";
import { Gallery } from "@/components/sections/gallery";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <EventStory />
      <Experience />
      <Interstitial />
      <EventDetails />
      <PassSection />
      <Gallery />
      <Faq />
      <FinalCta />
    </>
  );
}
