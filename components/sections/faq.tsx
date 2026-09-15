import { FAQ } from "@/lib/site";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";

/**
 * 06 FAQ — hairline rows, native <details> so it works without JavaScript and
 * carries the right semantics for free. The `+` rotates via CSS on [open].
 *
 * Entries with no answer are not rendered: we don't publish invented policy.
 */
export function Faq() {
  const answered = FAQ.filter((item) => item.a);

  return (
    <section id="faq" className="shell scroll-mt-24 pb-20 md:pb-32">
      <SectionEyebrow index="06" label="FAQ" />

      <h2 className="type-headline mt-10 text-[clamp(2.875rem,5.5vw,3.5rem)] md:mt-14">
        Common Questions.
      </h2>

      <div className="border-line mt-10 border-t md:mt-14">
        {answered.map((item) => (
          <details key={item.q} className="faq-row border-line group border-b">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
              <span className="font-sans text-[var(--text-body)]">{item.q}</span>
              <span
                className="text-ink-dim group-hover:text-gold-hi faq-marker shrink-0 text-xl transition-transform duration-200"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="text-ink-dim max-w-2xl pb-6 font-sans text-[var(--text-input)] leading-[1.8]">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
