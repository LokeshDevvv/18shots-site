# Media drop folder

Files the site expects. Until they exist, sections fall back to typographic
treatments — nothing invents stock imagery.

## Hero
- `hero-poster.jpg` — 1920×1080 or larger, warm/tungsten grade, dark enough that
  ivory type stays readable over the lower-left third.
- `hero-loop.webm` + `hero-loop.mp4` — 6–10s silent loop, no hard cuts, under
  ~3 MB. Desktop only; mobile uses the poster.

Then set `HERO_MEDIA` in `lib/site.ts`.

## Later phases
- `experience/{music,crowd,villa}.jpg` — landscape, 3:2
- `gallery/*.jpg` — mixed portrait and landscape
- `brand/18shots.svg` — the crest, for `components/site/wordmark.tsx`
