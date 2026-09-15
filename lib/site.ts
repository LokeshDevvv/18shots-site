/**
 * Single source of truth for event + brand copy.
 *
 * ⚠ UNCONFIRMED: every value marked TODO was read off the approved mockup and
 * has NOT been confirmed by the client. Nothing here may be invented — if a
 * value is unknown it stays null and the UI must handle that, per
 * docs/18shots-events-design.md § 13.
 */

export const BRAND = {
  name: "18SHOTS",
  eventsName: "18SHOTS EVENTS",
  tagline: ["WE BRING THE SHOTS.", "YOU BRING THE CRAZY."],
  instagram: "https://instagram.com/18shotsxevents",
  whatsapp: null as string | null, // TODO client: WhatsApp number
  email: null as string | null, // TODO client: contact email
} as const;

export const EVENT = {
  edition: "001",
  slug: "villa-after-dark",
  title: ["VILLA", "AFTER", "DARK"],
  subtitle: "A PRIVATE NIGHTLIFE EXPERIENCE",
  scriptAccent: "Good People Better Nights",
  // TODO client: confirm date
  date: "2026-09-19",
  dateLabel: "19 . 09 . 26",
  dateLong: "19 SEP 2026",
  dayLabel: "SATURDAY",
  city: "CHENNAI",
  venueLabel: "PRIVATE VILLA",
  startTime: "7:30 PM",
  timeNote: "ONWARDS",
  ageLabel: "STRICTLY 21+",
  ageNote: "Valid ID required",
  locationNote: "Exact villa location is released only to confirmed guests.",
} as const;

/**
 * Display-only fallbacks matching the mockup. The live pass list is read from
 * Supabase (`passes`) — never hardcode inventory or "X left" counts.
 */
export const PASS_PREVIEW = [
  {
    key: "early-bird",
    name: "EARLY BIRD",
    price: 999,
    strikePrice: 1499,
    note: "Limited quantity",
    featured: false,
  },
  {
    key: "general",
    name: "GENERAL PASS",
    price: 1499,
    strikePrice: null,
    note: "Entry + Party Access",
    featured: true,
  },
  {
    key: "couple",
    name: "COUPLE PASS",
    price: 2499,
    strikePrice: null,
    note: "2 People",
    featured: false,
  },
] as const;

/**
 * Hero media.
 *
 * Art-directed: the desktop frame is a wide villa establishing shot, mobile is a
 * portrait crop of the same scene. Both are TEMPORARY development assets from
 * the Phase 2 image pack — see docs/references/image-pack-readme.md. Replace
 * with the client's real villa/event shoot before launch.
 */
export const HERO_MEDIA: {
  desktop: string;
  mobile: string;
  videoWebm: string | null;
  videoMp4: string | null;
  alt: string;
} = {
  desktop: "/images/hero-villa-desktop.jpg",
  mobile: "/images/hero-villa-mobile.jpg",
  videoWebm: null,
  videoMp4: null,
  alt: "A private villa lit for a party at night, palms strung with lights above a pool",
};

export const NAV = [
  { label: "Home", href: "/" },
  { label: "The Event", href: "/#event" },
  { label: "Passes", href: "/#passes" },
  { label: "Gallery", href: "/#gallery" },
  { label: "FAQ", href: "/#faq" },
] as const;

export const MARQUEE = [
  "GOOD PEOPLE",
  "BETTER NIGHTS",
  "18SHOTS EVENTS",
  "CHENNAI",
  "19.09.26",
] as const;
