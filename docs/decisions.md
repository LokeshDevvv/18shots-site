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

## Quality pass before 03–06 (15 Sep 2026)

### Backend correctness

- **Inventory could oversell.** `createBooking` read remaining stock and then
  inserted in a separate statement, so two people could both claim the last
  pass. Replaced by the `create_booking` RPC (migration 0003): one transaction
  that locks the pass row (`for update`), verifies availability, increments
  `quantity_reserved`, and inserts the booking. Concurrent callers now queue at
  the lock instead of both reading the same count.
- **Reservations expire.** Bookings carry `reserved_until` (30 min default);
  `release_expired_reservations()` returns lapsed holds to stock and is called at
  the top of every booking attempt. It still needs a scheduled job (pg_cron or a
  Supabase scheduled function) so stock frees up even when no one is booking.
- **`set_booking_status` added** so admin confirm/reject moves the count between
  `quantity_reserved` and `quantity_sold` correctly, whichever path is taken.
  Phase 4 must use it rather than updating `status` directly.
- **Payment submission could report false success.** The update filtered by code
  and status but only checked `error`; a zero-row match returns no error, so a
  wrong or already-submitted code advanced the UI to confirmation. Now uses
  `.select()` and requires exactly one changed row.
- **Payment proof is validated server-side** (`lib/booking/proof.ts`): MIME type,
  5 MB cap, and an extension taken from an allowlist rather than the submitted
  filename. The browser checks were a courtesy; a direct POST bypasses them.
- **The pass catalogue reads Supabase** for price, active state and remaining
  inventory, falling back to the constants only in preview mode or on error. The
  schema has no column for the strike-through price, the one-line note, or which
  pass is featured, so that presentation metadata stays in `PASS_PREVIEW` and is
  matched by name.

### Art direction

- **Script face removed.** Sacramento and the hero's handwritten accent are gone;
  the stack is Bodoni Moda + Geist. A script webfont is one of the strongest
  tells of a generated luxury template. If the brand wants handwritten energy it
  should be drawn artwork, not a font.
- **Real wordmark** (`components/site/logo.tsx`): numeral in the display didone,
  hairline gold rule, name in letterspaced grotesk. Replaces the placeholder that
  just coloured "18" gold. The ornate crest is still needed from the client — the
  pack's "logo reference" is a zoomed screenshot crop, not artwork.
- **Hero title down again** to `min(6.4vw, 13vh)` with tighter spacing, so the
  photograph carries the frame. Gold now appears only in the wordmark rule and
  the scroll dot.
- **01's `OUR STORY` CTA removed.** It scrolled to Experience, which isn't a
  story; the composition reads better without it.
- **02 rebuilt asymmetrically** — one dominant frame, a tall frame dropped below
  it, a third inset and pulled up, with black space carrying the rhythm. The
  equal three-column grid was tidy and read as a template. This is a deliberate
  departure from the approved mockup, agreed in review.

## Backend hardening before 03–06 (15 Sep 2026)

- **RPC privileges were broken.** `revoke ... from public` also removed the
  default EXECUTE that `service_role` relied on, so every RPC would have failed
  with "permission denied for function" in production. `service_role` bypasses
  RLS; it does not bypass function grants. Each function the server calls is now
  granted back explicitly, guarded by a `pg_roles` check so the migration still
  runs on plain Postgres. Asserted in the test suite, including that `anon`
  cannot execute it.
- **`set_booking_status` is now a state machine.** It previously accepted any
  status, so a CANCELLED booking could be moved to CONFIRMED and increment
  `quantity_sold` against a reservation that had already been released. Legal
  moves only; anything else is refused without touching inventory. Cancelling a
  CONFIRMED booking returns a sold seat (refund path); CHECKED_IN moves nothing.
- **Payment proof is no longer uploaded before the booking is verified.** A made-
  up code with a 5 MB image used to leave an orphan storage object behind. The
  booking is checked first, and the expiry is checked too. The `.select()` guard
  on the update stays, for the row changing in between.
- **Hold shortened to 15 minutes** and the expiry scheduler is now configured:
  migration 0004 registers `release_expired_reservations()` on pg_cron every five
  minutes when the extension exists, and prints setup instructions when it
  doesn't. Calling it at the top of `create_booking` was never enough on its own —
  a quiet hour left stock locked.
- **Abuse protection**: five booking attempts per client per ten minutes, and at
  most two open unpaid holds per phone number. The client key is a salted hash of
  the forwarded IP — spoofable, so the per-phone limit is the stricter control.
  `booking_attempts` is pruned daily.
- **The catalogue fails closed.** Falling back to `PASS_PREVIEW` during a Supabase
  outage could advertise a stale price or a sold-out pass and take money for it.
  In production an unreadable catalogue now returns null and the sheet says
  bookings are temporarily unavailable. The constants remain the preview-mode
  path only.
- **Tests.** `pnpm test:sql` runs the migrations and a behaviour suite against a
  throwaway Postgres container (`supabase/tests/`): expiry, confirm, reject,
  illegal transitions, zero-row update, both abuse limits, grants, and five
  concurrent callers racing for one seat. `pnpm test` covers what SQL can't —
  that an invalid or expired booking code never creates a storage object, and
  that the catalogue fails closed.

### Still open

- Presentation metadata (`display_note`, `compare_at_price`, `featured`) is not in
  the schema and is joined from source by pass name. Fine for one event; needs
  columns before 18SHOTS runs several.
- The migrations have not been run against a hosted Supabase project, because
  there isn't one. They are verified on Postgres 16 with the platform roles
  stubbed.

## Sections 03–06, interstitial and final CTA (15 Sep 2026)

- **Interstitial** breaks the shell gutter deliberately — everything else is
  measured, this runs edge to edge. Uses `hero-crowd-desktop.jpg`, by far the
  sharpest asset in the pack (67.3 vs 8.1 for the villa hero), desaturated in
  CSS for the monochrome treatment the mockup asks for.
- **03** is one bordered strip of four facts with hairline dividers, plus the
  "location released to confirmed guests" note.
- **04** reads the same catalogue the booking sheet uses, so price and sold-out
  state can never disagree between the page and the dialog. Each `BOOK NOW`
  preselects that pass and skips the selection step — asserted in the browser
  tests. A sold-out pass renders as text, not a dead button.
- **05 is columns, not a 12-column grid.** With mixed portrait and landscape
  crops, grid rows size to the tallest item and leave holes — the first attempt
  read as scattered rather than composed. Three stacked columns of differing
  width and offset pack tightly. Mobile pairs two *portraits* in its 2-up row:
  mixing a 3:2 with a 3:4 leaves a ragged edge.
- **Two gallery frames run desaturated** — the cool-toned pool and crowd shots
  fought the warm palette. Alternating warm and monochrome turns that into a
  deliberate rhythm.
- **06 uses native `<details>`** — correct semantics, keyboard support and
  no-JS behaviour for free; the `+` rotates in CSS on `[open]`.
- **The refund question is hidden, not answered.** `FAQ` entries with a null
  answer don't render, so we publish no invented policy. It appears the moment
  18SHOTS supplies wording.
- **`VIEW MORE` points at Instagram** and `VIEW GALLERY` at `#gallery`, now that
  it exists. Every nav anchor resolves — the audit asserts zero dead anchors.
- The gallery renders separate desktop and mobile trees. The hidden one never
  loads, so the image audit counts only laid-out images.

## Redesign pass (a) — type scale (15 Sep 2026)

- **Named type scale in `@theme`**, so sizes stop being sprinkled per component:
  `--text-micro` 12px, `--text-ui` 14px, `--text-caption` 15px, `--text-input`
  16px, `--text-body` 17px. `label-micro` went 10px → 12px with tracking eased
  to 0.16em, and `type-body` / `type-caption` utilities replace ad-hoc
  `text-sm` / `text-xs`.
- **Inputs are 16px.** Below that, iOS Safari zooms the page on focus — a real
  defect mid-form, not a preference. The audit enforces it.
- **Buttons 12/13/14px** with taller targets (h-10/h-12/h-14), up from 10/11/12.
- **Section headings floor at 44px** on mobile (was 36px); the hero title is now
  ~66px at 390px (was ~44px); the header wordmark is 16px (was 13px).
- **Hero grain 13% → 8%.** It was adding dirt to an already soft image.
- **Nothing renders below 12px anywhere**, verified by a new audit that walks
  every laid-out element at 1440 and 390 — including the open booking form — and
  fails if any text is under 12px or any control under 16px.
- **Hero's decorative glyph spans are `pointer-events-none`.** They duplicate the
  sr-only title, and during the entrance animation they briefly sit over the
  mobile CTA's area. Measurement showed the settled layout is fine
  (`elementFromPoint` returns the button), but there's no reason for a
  decorative clone to be hit-testable.

### Still open in this redesign

Passes (b) hero + sticky mobile CTA, (c) Experience swipe reel + Details 2×2 +
editorial pass rows, (d) Motion reveals. Two decisions outstanding: whether to
retire Bodoni for Syne (a brand change — the didone came from the client-approved
mockup), and where sharp photography comes from.

## Redesign pass (b) — sticky mobile CTA (15 Sep 2026)

- **`components/site/sticky-cta.tsx`**: mobile-only bar that slides in once the
  hero is fully past and retires at `04 PASSES`, where the real pass blocks take
  over. A floating CTA competing with the thing it points at is clutter.
- **IntersectionObserver on the two sections**, not a scroll listener, so nothing
  runs between crossings. "Above the viewport" needs `!isIntersecting` *and* a
  negative `boundingClientRect.top` — without the rect check a section far below
  the fold reads identically.
- **Hidden means unreachable**: the bar is `inert` and `aria-hidden` when off
  screen, not merely translated away. Same mistake the mobile drawer had.
- It also hides while the booking sheet is open, and when the catalogue is
  unavailable — quoting "From ₹999" during an outage would be the same failure
  the fail-closed catalogue exists to prevent. The price is read from the live
  catalogue, never hardcoded.
- Padded with `env(safe-area-inset-bottom)` so it clears the home indicator.
- Nine assertions in the sticky suite: hidden over the hero, inert while hidden,
  appears after the hero, interactive when shown, retires at the passes, stays
  away through gallery/FAQ/footer, its button opens the sheet, hides while the
  sheet is open, never renders on desktop.
