import Image from "next/image";
import { BRAND, GALLERY } from "@/lib/site";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { CtaLink } from "@/components/ui/cta";
import { cn } from "@/lib/utils";

/**
 * 05 GALLERY.
 *
 * Three stacked columns of differing width and start offset, rather than a
 * 12-column grid: with mixed portrait and landscape crops, grid rows size to
 * the tallest item and leave holes, which reads as scattered rather than
 * composed. Columns pack tightly and keep the offsets deliberate.
 *
 * Two frames run desaturated — the cool-toned ones — so the section alternates
 * warm and monochrome instead of fighting the palette.
 */

const COLUMNS = [
  { width: "md:w-[38%]", offset: "", items: [0, 4] },
  { width: "md:w-[30%]", offset: "md:mt-24", items: [1, 3] },
  { width: "md:w-[26%]", offset: "md:mt-10", items: [2] },
];

export function Gallery() {
  return (
    <section id="gallery" className="shell scroll-mt-24 pb-20 md:pb-32">
      <SectionEyebrow index="05" label="Gallery" aside="Moments from our nights" />

      {/* Desktop: interlocking columns. */}
      <div className="mt-14 hidden gap-6 md:flex md:items-start">
        {COLUMNS.map((column, ci) => (
          <div key={ci} className={cn("flex flex-col gap-6", column.width, column.offset)}>
            {column.items.map((index) => (
              <Frame key={GALLERY[index].src} item={GALLERY[index]} sizes="34vw" />
            ))}
          </div>
        ))}
      </div>

      {/*
        Mobile: full-width opener, a paired row, then full-width moments. The
        pair is two portraits so the row has no ragged edge — mixing a 3:2 with
        a 3:4 leaves a hole under the shorter frame.
      */}
      <div className="mt-10 md:hidden">
        <Frame item={GALLERY[0]} sizes="100vw" />
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Frame item={GALLERY[2]} sizes="50vw" />
          <Frame item={GALLERY[3]} sizes="50vw" />
        </div>
        <div className="mt-4">
          <Frame item={GALLERY[4]} sizes="100vw" />
        </div>
        <div className="mt-4 w-3/4">
          <Frame item={GALLERY[1]} sizes="75vw" />
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between md:mt-16">
        <p className="label-micro">{BRAND.name}</p>
        <CtaLink href={BRAND.instagram} target="_blank" rel="noreferrer" size="sm">
          View more ↗
        </CtaLink>
      </div>
    </section>
  );
}

function Frame({
  item,
  sizes,
}: {
  item: (typeof GALLERY)[number];
  sizes: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        item.ratio === "portrait" ? "aspect-[3/4]" : "aspect-[3/2]",
      )}
    >
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes={sizes}
        className={cn("object-cover", item.mono && "grayscale")}
      />
    </div>
  );
}
