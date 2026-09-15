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

/** 01 THE EVENT — copy from the approved mockup. */
export const STORY = {
  eyebrow: "The Event",
  headline: "More Than Just A Party.",
  body: "A private villa experience built for good music, great people and unforgettable nights.",
  keywords: ["MUSIC", "PEOPLE", "FREEDOM", "CONNECTION", "MEMORIES"],
  image: "/images/event-portrait.jpg",
  imageAlt: "A guest at the villa party, lit by warm light, holding a drink",
} as const;

/** 02 EXPERIENCE — image-led blocks, not feature cards. */
export const EXPERIENCE = [
  {
    key: "music",
    title: "CURATED MUSIC",
    caption: "Deep beats. Long nights.",
    image: "/images/experience-dj.jpg",
    alt: "A DJ mixing at the villa, hands on the decks under warm light",
  },
  {
    key: "crowd",
    title: "SELECTED CROWD",
    caption: "Good people. Better vibes.",
    image: "/images/experience-sparklers.jpg",
    alt: "Guests dancing with sparklers raised above the crowd",
  },
  {
    key: "villa",
    title: "PRIVATE VILLA",
    caption: "Exclusive location.",
    image: "/images/cta-villa-entrance.jpg",
    alt: "The lit entrance of the private villa at night",
  },
] as const;

/** Full-bleed interstitial between 02 and 03. */
export const INTERSTITIAL = {
  headline: ["IT HITS", "DIFFERENT", "HERE."],
  lines: [
    "Same people.",
    "Different energy.",
    "A night you'll talk about for a long time.",
  ],
  image: "/images/hero-crowd-desktop.jpg",
  alt: "The crowd with hands raised under strung lights",
} as const;

/** 03 THE DETAILS — the four facts, nothing more. */
export const DETAILS = [
  { label: "Date", value: EVENT.dateLong, note: EVENT.dayLabel },
  { label: "Location", value: EVENT.city, note: "Private villa" },
  { label: "Time", value: EVENT.startTime, note: EVENT.timeNote },
  { label: "Entry", value: EVENT.ageLabel, note: EVENT.ageNote },
] as const;

export const DETAILS_IMAGE = {
  src: "/images/details-drinks.jpg",
  alt: "Glasses raised together, lit by candlelight",
} as const;

/** 05 GALLERY. `mono` frames render desaturated, per the mockup. */
export const GALLERY: {
  src: string;
  alt: string;
  ratio: "portrait" | "landscape";
  mono?: boolean;
}[] = [
  { src: "/images/gallery-portrait.jpg", alt: "A guest at the villa party", ratio: "portrait" },
  { src: "/images/gallery-pool.jpg", alt: "The lit pool at night", ratio: "landscape", mono: true },
  { src: "/images/gallery-bw-crowd.jpg", alt: "The crowd mid-night", ratio: "portrait", mono: true },
  { src: "/images/gallery-palm.jpg", alt: "Palms strung with lights above the villa", ratio: "portrait" },
  { src: "/images/ambient-crowd.jpg", alt: "Guests together on the terrace", ratio: "landscape" },
];

/**
 * 06 FAQ.
 *
 * An entry with a null answer is not rendered — we do not invent policy. The
 * refund question stays here so it appears the moment 18SHOTS supplies wording.
 */
export const FAQ: { q: string; a: string | null }[] = [
  {
    q: "Is the location private?",
    a: "Yes. The villa address is shared only with confirmed guests, by WhatsApp, closer to the night.",
  },
  {
    q: "Is my booking confirmed immediately?",
    a: "No. Your passes are held while we verify your payment against the UTR you submit. You'll get a confirmation on WhatsApp once it clears.",
  },
  {
    q: "Can I get a refund?",
    // TODO client: supply the refund and cancellation policy. Until then this
    // question is hidden rather than answered with something invented.
    a: null,
  },
  {
    q: "Can I transfer my pass?",
    a: "Message us on Instagram before the event with the new guest's name and number. Transfers close once the guest list is locked on the day.",
  },
  {
    q: "What ID do I need?",
    a: "Entry is strictly 21+. Bring a government photo ID that shows your date of birth — the name should match your booking.",
  },
  {
    q: "How do I receive my pass?",
    a: "On WhatsApp, at the number you booked with, once payment is verified. Your booking code is your reference until then.",
  },
];

/** Final CTA. */
export const FINAL_CTA = {
  headline: ["Ready For", "The Weekend?"],
  sub: "Limited passes. One night. No ordinary weekend.",
  image: "/images/ambient-pool.jpg",
  alt: "The villa pool lit at dusk",
} as const;

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
