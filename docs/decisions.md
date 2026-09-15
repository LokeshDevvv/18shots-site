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

## Booking refactor (15 Sep 2026)

- **No `/book` route — booking is in-page.** The old CTAs pointed at a route that
  never existed and returned 404. Every entry point (header, mobile drawer, hero,
  and future pass blocks and final CTA) now calls `open()` on one provider
  mounted in `app/layout.tsx`. The site stays a single page at `/`.
- **Radix Dialog, not a hand-rolled modal.** Focus trapping, focus restoration,
  Escape, `aria-modal` and background inerting are easy to get subtly wrong;
  12 KB is the right trade. One component renders both presentations — bottom
  sheet under `md`, centred panel above.
- **shadcn/ui still not installed.** Its `init` would overwrite `globals.css`
  with a competing token set, and `@radix-ui/react-dialog` is the only primitive
  the booking flow actually needed.
- **State reset policy** (`booking-provider.tsx`): closing mid-flow KEEPS the
  form, because a mis-tap on the backdrop should not cost someone their details;
  reopening after a confirmed booking STARTS FRESH, so the next guest never lands
  inside someone else's confirmation; `open(passKey)` always moves the selection
  to that pass.
- **Backdrop dismissal is guarded** from the details step onward, and while
  submitting. Escape always closes except mid-submit. Backdrop-close stays
  available on the first step, where nothing has been typed.
- **Prices are read server-side** in the action, never taken from the submitted
  form. A Server Function accepts direct POSTs, so a client-supplied price is an
  attacker-supplied price. Both actions re-parse with the same Zod schemas.
- **A failed proof upload does not fail the booking.** Admins can still verify by
  UTR; losing a whole submission over an image would cost a sale.
- **Preview mode.** With no Supabase project yet, `isSupabaseConfigured()` is
  false: the flow runs end to end, nothing is persisted, and a banner inside the
  sheet says so. The same code path writes real rows once the keys land.
- **Closed mobile drawer is now `inert`**, not just `aria-hidden`. It was
  invisible but still keyboard-focusable — found while testing the booking CTAs.
- **Hero title reduced** to `min(8vw, 16vh)` on desktop, per the agreed
  correction. Composition, scrims and photography are untouched.

## Sections 01 + 02 (15 Sep 2026)

- **`SectionEyebrow`** added so the mockup's numbered markers (`01 THE EVENT` …
  `06 FAQ`) stay consistent as sections land.
- **01 keyword rail** is a column in the desktop gutter and a wrapped row on
  mobile. A column of one-word lines reads badly on a phone, and the mockup's
  mobile frame doesn't show the rail at all.
- **`OUR STORY ↗` points at `#experience`.** There is no story page; rather than
  repeat the `/book` mistake, it scrolls to the next section. Revisit if the
  client wants a real story page.
- **`VIEW GALLERY ↗` omitted for now.** The mockup places it in 02, but `#gallery`
  doesn't exist yet and a dead control is worse than a missing one. It goes in
  with 05 GALLERY.
- **02 follows the mockup's three equal landscape blocks**, not the "different
  aspect ratios" idea from the later review — the approved mockup is the contract
  until the client changes it.
- **Image edges: one real seam, one false alarm.** `hero-villa-desktop.jpg` has a
  genuine generator seam down its left edge (95th-percentile luminance peaks at
  246 against an interior of 49–77); 20px trimmed. Everything else ships exactly
  as the pack delivered it. An earlier pass cropped several images chasing what
  turned out to be photographic edge glow and, in one case, a sparkler in the
  frame — reverted. Measure before cropping.
