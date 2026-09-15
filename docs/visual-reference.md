# 18SHOTS — Locked Visual Reference (from approved mockup)

Source: approved desktop + mobile mockup supplied by client, 15 Sep 2026.
Place the image file at `docs/references/18shots-mockup.png` and treat it as the
binding visual target. Where this file and `18shots-events-design.md` disagree on
a visual detail, this file wins; where they disagree on product behaviour, the
spec wins.

## Confirmed palette (read from the mockup)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#050505` | page ground |
| `--surface` | `#0D0D0D` | panels, pass cards, FAQ rows |
| `--surface-raised` | `#141210` | selected pass card, nav pill |
| `--text` | `#F5F1E8` | headlines, primary copy |
| `--text-dim` | `#8B8984` | labels, captions, secondary copy |
| `--gold` | `#C89036` | rules, section numbers, hairline borders |
| `--gold-hi` | `#E2B85C` | primary CTA fill, logo, script accent |
| `--line` | `rgba(245,241,232,0.14)` | dividers, card borders |

Photography is warm-toned: amber/tungsten highlights over near-black. All imagery
should be colour-graded toward this warmth, never cool/blue.

## Type system (as drawn)

- **Display serif** — high-contrast didone-style serif, all-caps, very tight
  leading (~0.88), used for `VILLA AFTER DARK` and `IT HITS DIFFERENT HERE.`
- **Section headline serif** — same family, sentence case with a terminal period:
  `More Than Just A Party.` / `Event Details.` / `Choose Your Pass.` /
  `Common Questions.`
- **UI sans** — grotesk for labels, nav, form fields, body copy.
- **Micro-labels** — sans, uppercase, ~10–11px, letter-spacing ~0.18em,
  `--text-dim`: `THE EVENT`, `EXPERIENCE`, `THE DETAILS`, `PASSES`, `GALLERY`, `FAQ`.
- **Script accent** — a single handwritten script, gold, used *once or twice only*:
  `Good People Better Nights` in the hero. Never for UI.

## Section order (numbered on-page)

Hero → `01 THE EVENT` → `02 EXPERIENCE` → (full-bleed "IT HITS DIFFERENT HERE.")
→ `03 THE DETAILS` → `04 PASSES` → `05 GALLERY` → `06 FAQ` → final CTA → footer.

Section numbers render as `01`, `02`, … in gold beside the uppercase micro-label.

## Section notes

**Hero** — fullscreen villa/pool night photo, dark vignette. Stack:
`18SHOTS EVENTS / 001` eyebrow, three-line display title, `A PRIVATE NIGHTLIFE
EXPERIENCE` subtitle, a gold hairline, then a 3-column meta row
(`19 . 09 . 26 / SATURDAY` · `CHENNAI / PRIVATE VILLA` · `7:30 PM / ONWARDS`)
separated by thin vertical rules. Tagline `WE BRING THE SHOTS. / YOU BRING THE
CRAZY. ✨`. Bottom-left circular `SCROLL` indicator, bottom-right `STRICTLY 21+`.

**01 The Event** — two-column: serif headline + paragraph + outlined `OUR STORY ↗`
button on the left; single warm portrait image right; a vertical keyword list
(`MUSIC / PEOPLE / FREEDOM / CONNECTION / MEMORIES`) in the far-right gutter with
a short gold rule above it.

**02 Experience** — three equal landscape images with caption pairs beneath
(`CURATED MUSIC` / `Deep beats. Long nights.` — `SELECTED CROWD` /
`Good people. Better vibes.` — `PRIVATE VILLA` / `Exclusive location.`),
then a right-aligned outlined `VIEW GALLERY ↗`.

**Interstitial** — full-bleed black-and-white crowd photo, display serif
`IT HITS DIFFERENT HERE.` bottom-left, small `18SHOTS` watermark, and a right
column of short copy (`Same people. / Different energy. / A night you'll talk
about for a long time.`) above a small paired image.

**03 The Details** — a single bordered 4-cell strip, hairline dividers, no card
shadows: DATE `19 SEP 2026 / SATURDAY` · LOCATION `CHENNAI / (Private Villa)` ·
TIME `7:30 PM / ONWARDS` · ENTRY `STRICTLY 21+ / Valid ID required`. A wide
cropped palm/sky photo sits directly beneath it.

**04 Passes** — three bordered blocks, not rounded SaaS cards:
- `EARLY BIRD` — ₹999, struck-through ₹1,499, `Limited quantity`, outlined `BOOK NOW`
- `GENERAL PASS` — ₹1,499, `Entry + Party Access`, **selected state**: gold hairline
  border, slightly raised surface, gold `MOST POPULAR` tab clipped to the top edge,
  solid gold `BOOK NOW`
- `COUPLE PASS` — ₹2,499, `2 People`, outlined `BOOK NOW`

Sub-headline: `Limited passes. Once we're full, bookings close.`

**05 Gallery** — irregular editorial grid, mixed portrait/landscape, one frame
desaturated to black-and-white, right-aligned `MOMENTS FROM OUR NIGHTS` label and
an outlined `VIEW MORE` control inside the grid.

**06 FAQ** — plain full-width rows with `+` affordances and an `EXPAND ALL +`
control top-right. No card chrome, hairline separators only.

**Final CTA** — full-bleed warm palm/dusk photo, centred serif `READY FOR / THE
WEEKEND?`, subline `Limited passes. One night. No ordinary weekend.`, solid gold
`GET YOUR PASS`.

**Footer** — logo + `WE BRING THE SHOTS. / YOU BRING THE CRAZY. ✨`, inline nav,
social icons (Instagram, WhatsApp, mail), copyright line, `Strictly 21+` right.

A thin marquee/ticker strip sits above the footer on desktop:
`GOOD PEOPLE • BETTER NIGHTS • 18SHOTS EVENTS • CHENNAI • 19.09.26`.

## Mobile (as drawn, 390px)

- Sticky top bar: logo left, hamburger right.
- Hero: vertical crop, three-line display title, one condensed meta line
  `19 . 09 . 26 | CHENNAI`, gold `GET PASSES ↗` button, circular scroll dot below.
- Story: single column — headline, paragraph, one image, then the experience
  items stacked as image + caption pair with a short gold rule between.
- Booking opens as a **bottom sheet** with a rounded top edge, close `✕`,
  title `Book Your Pass`, and a 3-step indicator (`1 Details · 2 Payment ·
  3 Confirm`) with the active step in a filled gold circle.
- Sheet body: `Selected Pass` summary row (`General Pass` / `₹1,499 × 2` /
  right-aligned `₹2,998`), then `Your Details` — Full Name, Mobile Number with a
  `+91` prefix segment, Email Address — and a full-width gold `Continue →`.
- Inputs: dark fill, hairline border, ~10px radius, dim placeholder text.

## Component inventory implied by the mockup

Buttons: outlined-ghost (`OUR STORY ↗`, `BOOK NOW`, `VIEW GALLERY ↗`, `VIEW MORE`)
and solid gold (`GET PASSES`, selected `BOOK NOW`, `GET YOUR PASS`, `Continue →`).
Both use a small `↗`/`→` glyph, not an icon set.

Repeating primitives: section eyebrow (number + label), gold hairline rule,
bordered info strip, pass block, FAQ row, meta pair (label above value),
caption pair, step indicator, form field, bottom sheet, marquee.

## Explicit non-goals for the build

No gold glow or bloom, no gradient buttons, no glassmorphism, no drop shadows on
cards, no border-radius above 12px on content surfaces, no purple, no cool-toned
imagery, no stock "AI party" photography in production.

## Implementation mapping (Phase 1)

| Mockup element | Where it lives |
|---|---|
| palette | `app/globals.css` `@theme` |
| display / headline / script type | `.type-display` `.type-headline` `.type-script` |
| uppercase micro-label | `.label-micro` |
| page gutter | `.shell` |
| ghost + solid buttons | `components/ui/cta.tsx` |
| ticker strip | `components/site/marquee.tsx` |
| header + mobile drawer | `components/site/header.tsx` |
| footer | `components/site/footer.tsx` |
| all copy + event facts | `lib/site.ts` |
