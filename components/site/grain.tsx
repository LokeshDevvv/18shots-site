/**
 * Fine film grain over hero/full-bleed media. Inline SVG turbulence as a data
 * URI — no network request, no library, tiles at 128px so it never looks like a
 * repeating pattern at scale.
 */
const NOISE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
       <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter>
       <rect width="128" height="128" filter="url(#n)" opacity="0.5"/>
     </svg>`,
  );

export function Grain({ opacity = 0.16 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay"
      style={{ backgroundImage: `url("${NOISE}")`, opacity }}
    />
  );
}
