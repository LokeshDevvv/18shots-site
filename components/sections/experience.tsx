import Image from "next/image";
import { EXPERIENCE } from "@/lib/site";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";

/**
 * 02 EXPERIENCE — three image-led blocks with caption pairs beneath. Not
 * feature cards: no fill, no radius, no shadow, hairline rules only.
 */
export function Experience() {
  return (
    <section id="experience" className="shell scroll-mt-24 pb-20 md:pb-32">
      <SectionEyebrow index="02" label="Experience" />

      <ul className="mt-10 grid grid-cols-1 gap-10 md:mt-14 md:grid-cols-3 md:gap-6">
        {EXPERIENCE.map((item) => (
          <li key={item.key} className="flex flex-col">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="border-line mt-5 border-t pt-5">
              <p className="label-micro text-ink">{item.title}</p>
              <p className="text-ink-dim mt-2 font-sans text-sm">{item.caption}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
