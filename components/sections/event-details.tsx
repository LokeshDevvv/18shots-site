import Image from "next/image";
import { DETAILS, DETAILS_IMAGE, EVENT } from "@/lib/site";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";

/**
 * 03 THE DETAILS — one bordered strip of facts. Hairlines only: no cards, no
 * fills, no shadows.
 */
export function EventDetails() {
  return (
    <section id="details" className="shell scroll-mt-24 py-20 md:py-32">
      <SectionEyebrow index="03" label="The Details" aside="Same energy. Different night." />

      <h2 className="type-headline mt-10 text-[clamp(2.875rem,5.5vw,3.5rem)] md:mt-14">
        Event
        <br />
        Details.
      </h2>

      <dl className="border-line divide-line mt-10 grid grid-cols-1 divide-y border sm:grid-cols-2 sm:divide-y-0 md:mt-14 md:grid-cols-4">
        {DETAILS.map((item, i) => (
          <div
            key={item.label}
            className={[
              "flex flex-col gap-3 px-6 py-7",
              // Hairlines between cells without doubling the outer border.
              i > 0 ? "md:border-line md:border-l" : "",
              i % 2 === 1 ? "sm:border-line sm:border-l" : "",
              i >= 2 ? "sm:border-line sm:border-t md:border-t-0" : "",
            ].join(" ")}
          >
            <dt className="label-micro">{item.label}</dt>
            <dd>
              <span className="block font-sans text-xl tracking-[0.06em]">{item.value}</span>
              <span className="label-micro mt-2 block">{item.note}</span>
            </dd>
          </div>
        ))}
      </dl>

      <p className="type-caption text-ink-dim mt-6 max-w-md">
        {EVENT.locationNote}
      </p>

      <div className="relative mt-12 aspect-[21/9] overflow-hidden md:mt-16">
        <Image
          src={DETAILS_IMAGE.src}
          alt={DETAILS_IMAGE.alt}
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
    </section>
  );
}
