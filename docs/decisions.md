# Build decisions log

Append a line whenever a choice is made that the spec didn't dictate.

## Phase 1 — foundation (15 Sep 2026)

- **Next.js 16.3.5 + React 19.2 + Tailwind 4.** `create-next-app` pulled current
  versions. Tailwind 4 is CSS-first: there is no `tailwind.config.ts`, all tokens
  live in `@theme` in `app/globals.css`.
- **No GitHub.** Per client. `create-next-app` still made a local `.git` folder —
  left in place as a local undo buffer, no remote configured.
- **Fonts — provisional.** Bodoni Moda (display + headlines), Geist (UI),
  Sacramento (the one gold script). Free Google faces matching the mockup. All
  three are declared once in `lib/fonts.ts`; no component names a family, so a
  licensed swap is a one-file change.
- **shadcn/ui deferred to Phase 3.** Its init rewrites `globals.css` with its own
  token set, which would fight the brand tokens. The public site needs no shadcn
  primitives — it needs editorial layout. Components will be added individually
  when the booking sheet and admin tables need them.
- **lucide-react v1 dropped brand glyphs.** Instagram and WhatsApp are inline SVG
  in `components/site/social-icons.tsx`, matched to lucide's 1.5 stroke weight.
- **Two button treatments only** (`components/ui/cta.tsx`): ghost hairline and
  solid gold, as drawn. Arrow glyphs are text, not icons.
- **Money is stored as whole rupees (integer).** No paise in V1 pricing.
- **Booking codes** come from a Postgres sequence via trigger (`18SE-1001`…), so
  they can't collide under concurrent submits.
- **Customers never read `bookings` directly.** RLS grants select to admins only;
  the confirmation page will look a booking up server-side by code. Keeps the
  anon key from being able to enumerate everyone's phone numbers.

## Phase 2 — hero (15 Sep 2026)

- **Hero entrance is CSS, not JS.** The headline is the LCP element; a JS-driven
  reveal renders it `translateY(105%)` in the server HTML, so it would be blank
  until hydration and permanently blank if JS fails. Keyframes live in
  `globals.css`, delays are inline `animationDelay`, and `animation-fill-mode:
  both` means the existing reduced-motion block lands them on their end state.
  Result: the whole hero is a server component with zero client JS. Verified with
  JS disabled (headline visible) and `prefers-reduced-motion: reduce`
  (identity transform, opacity 1).
- **No placeholder photography.** `HERO_MEDIA` in `lib/site.ts` is null until the
  client sends the shoot; the hero renders a warm tungsten CSS field instead.
  Shipping stock "AI party" imagery would make an unapproved layout look signed
  off. Drop files in `public/media/` and fill in the constant — see the README
  there.
- **Video is desktop-only** (`motion-safe:md:block`), poster everywhere else, so
  mobile 4G doesn't pull a loop it will never show.
- **Desktop title is capped by viewport height**, `min(9.5vw, 19vh)`, not width
  alone. At 1440×900 a width-only clamp pushed the scroll cue and the 21+ rule
  below the fold.
- **Mobile hero is centred, desktop is left-aligned**, per the mockup — and the
  mobile CTA sits in thumb reach with the scroll cue beneath it. The `STRICTLY
  21+` rule is desktop-only in the hero; on mobile it appears in § 03 Details and
  the footer, so the requirement is still met.
- **Grain is an inline SVG data URI** (`components/site/grain.tsx`) — no asset
  request, tiles at 128px.

## Phase 2 — hero imagery (15 Sep 2026)

- **Image pack wired in.** Copied `images/*` to `public/images/`, following the
  paths in `asset-map.json` (`/images/…`). The pack README says
  `public/images/18shots/`, which contradicts its own map — the map won, since
  that's the file the code reads. Pack docs kept at `docs/references/`.
- **Hero is art-directed `<picture>`, not `next/image`.** Desktop gets the wide
  villa frame, mobile a portrait crop of the same scene. next/image resizes one
  source but can't swap crops at a breakpoint, and the crop is the point. Only
  one source is ever fetched; both are already small (≈200 KB / 156 KB).
- **Trimmed 1.5% off `hero-villa-desktop.jpg`** (1920×1080 → 1882×1058). The
  original had a pale vertical seam down the left edge — exactly where the
  headline sits.
- **Two scrims, not one.** A vertical pass seats the header and baseline row; a
  left-hand pass carries the desktop lockup; a third, mobile-only, darkens the
  lower half where the mobile type stacks over the brightest part of the villa.
  Mostly inside the 8–22% band the pack asks for, heavier only where type sits.
- **`brand/18shots-logo-reference.png` was NOT used.** It isn't a logo — it's a
  heavily zoomed screenshot crop showing part of the word "Ins…" in white UI
  text. `Wordmark` stays typographic until the client sends the real crest.
