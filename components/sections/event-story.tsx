import Image from "next/image";
import { STORY } from "@/lib/site";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { CtaLink } from "@/components/ui/cta";

/**
 * 01 THE EVENT — editorial two-column: statement left, portrait centre-right,
 * keyword rail in the far gutter. Mobile stacks it and turns the rail into a
 * wrapped row, which reads better than a column of one-word lines on a phone.
 */
export function EventStory() {
  return (
    <section id="event" className="shell scroll-mt-24 py-20 md:py-32">
      <SectionEyebrow index="01" label={STORY.eyebrow} />

      <div className="mt-10 grid grid-cols-1 gap-10 md:mt-16 md:grid-cols-12 md:gap-8">
        <div className="flex flex-col md:col-span-5 md:pt-6">
          <h2 className="type-headline text-[clamp(2.25rem,6vw,3.75rem)]">
            More Than
            <br />
            Just A Party.
          </h2>

          <p className="text-ink-dim mt-6 max-w-sm font-sans text-[15px] leading-[1.75]">
            {STORY.body}
          </p>

          <CtaLink href="#experience" size="md" className="mt-9 self-start">
            Our Story ↗
          </CtaLink>
        </div>

        <div className="md:col-span-4 md:col-start-7">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={STORY.image}
              alt={STORY.imageAlt}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Keyword rail — a column in the desktop gutter, a wrapped row on mobile. */}
        <div className="md:col-span-2 md:col-start-11 md:pt-6">
          <span className="bg-gold mb-6 hidden h-px w-8 md:block" aria-hidden />
          <ul className="flex flex-wrap gap-x-5 gap-y-3 md:flex-col md:gap-y-5">
            {STORY.keywords.map((word) => (
              <li key={word} className="label-micro">
                {word}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
