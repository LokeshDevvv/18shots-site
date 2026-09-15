import Link from "next/link";
import {
  InstagramIcon,
  MailIcon,
  WhatsAppIcon,
} from "@/components/site/social-icons";
import { BRAND, EVENT, NAV } from "@/lib/site";
import { Marquee } from "@/components/site/marquee";
import { Logo } from "@/components/site/logo";

export function SiteFooter() {
  const socials = [
    { href: BRAND.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: BRAND.whatsapp, label: "WhatsApp", Icon: WhatsAppIcon },
    { href: BRAND.email ? `mailto:${BRAND.email}` : null, label: "Email", Icon: MailIcon },
  ].filter((s): s is { href: string; label: string; Icon: typeof InstagramIcon } =>
    Boolean(s.href),
  );

  return (
    <footer className="mt-auto">
      <Marquee />

      <div className="shell flex flex-col gap-10 py-12 md:flex-row md:items-start md:justify-between md:py-16">
        <div className="flex flex-col gap-4">
          <Logo className="text-base" withEvents />
          <p className="label-micro leading-[1.8]">
            {BRAND.tagline[0]}
            <br />
            {BRAND.tagline[1]} <span className="text-gold-hi">✦</span>
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-7 gap-y-3" aria-label="Footer">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="label-micro transition-colors duration-200 hover:text-gold-hi"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <ul className="flex items-center gap-4">
          {socials.map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="border-line hover:border-gold hover:text-gold-hi flex size-9 items-center justify-center rounded-full border transition-colors duration-200"
              >
                <Icon size={15} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="shell border-line flex flex-col gap-3 border-t py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="label-micro">
          © {new Date().getFullYear()} {BRAND.name} Events. All rights reserved.
        </p>
        <p className="label-micro">{EVENT.ageLabel}</p>
      </div>
    </footer>
  );
}
