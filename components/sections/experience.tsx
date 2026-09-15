import Image from "next/image";
import { EXPERIENCE } from "@/lib/site";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { cn } from "@/lib/utils";

/**
 * 02 EXPERIENCE — deliberately asymmetric: one dominant frame, two supporting
 * frames at different sizes and vertical offsets, with black space carrying the
 * rhythm. An equal three-column grid was the earlier version; it was tidy and
 * read as a template.
 *
 * Mobile keeps it simple — full-width, stacked, well spaced — rather than
 * reproducing the desktop offsets on a 390px screen.
 */

const [music, crowd, villa] = EXPERIENCE;

export function Experience() {
  return (
    <section id="experience" className="shell scroll-mt-24 pb-24 md:pb-40">
      <SectionEyebrow index="02" label="Experience" />

      <div className="mt-10 grid grid-cols-1 gap-14 md:mt-16 md:grid-cols-12 md:gap-x-8 md:gap-y-0">
        {/* Dominant frame */}
        <Frame
          item={music}
          ratio="aspect-[4/3]"
          sizes="(min-width: 768px) 58vw, 100vw"
          className="md:col-span-7"
          priority
        />

        {/* Tall supporting frame, dropped well below the dominant one */}
        <Frame
          item={crowd}
          ratio="aspect-[3/4]"
          sizes="(min-width: 768px) 33vw, 100vw"
          className="md:col-span-4 md:col-start-9 md:mt-28"
        />

        {/* Third frame sits back under the dominant one, inset from both edges */}
        <Frame
          item={villa}
          ratio="aspect-[16/10]"
          sizes="(min-width: 768px) 42vw, 100vw"
          className="md:col-span-5 md:col-start-3 md:-mt-16"
        />
      </div>
    </section>
  );
}

function Frame({
  item,
  ratio,
  sizes,
  className,
  priority,
}: {
  item: (typeof EXPERIENCE)[number];
  ratio: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure className={cn("flex flex-col", className)}>
      <div className={cn("relative overflow-hidden", ratio)}>
        <Image
          src={item.image}
          alt={item.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>

      <figcaption className="border-line mt-5 border-t pt-5">
        <p className="label-micro text-ink">{item.title}</p>
        <p className="text-ink-dim mt-2 font-sans text-sm">{item.caption}</p>
      </figcaption>
    </figure>
  );
}
