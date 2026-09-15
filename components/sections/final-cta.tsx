import Image from "next/image";
import { FINAL_CTA } from "@/lib/site";
import { BookingTrigger } from "@/components/booking/booking-trigger";

/** One photograph, a headline, a button. Nothing else. */
export function FinalCta() {
  return (
    <section className="relative isolate">
      <div className="relative flex min-h-[32rem] items-center justify-center overflow-hidden py-24 md:min-h-[38rem]">
        <Image
          src={FINAL_CTA.image}
          alt={FINAL_CTA.alt}
          fill
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, #050505 0%, rgba(5,5,5,0.55) 30%, rgba(5,5,5,0.62) 70%, #050505 100%)",
          }}
        />

        <div className="shell flex flex-col items-center text-center">
          <h2 className="type-headline text-[clamp(2.5rem,7vw,5rem)]">
            {FINAL_CTA.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          <p className="text-ink-dim mt-5 font-sans text-sm">{FINAL_CTA.sub}</p>

          <BookingTrigger variant="solid" size="lg" className="mt-10 px-12">
            Get Your Pass →
          </BookingTrigger>
        </div>
      </div>
    </section>
  );
}
