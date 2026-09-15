import { HERO_MEDIA } from "@/lib/site";
import { Grain } from "@/components/site/grain";

/**
 * Hero backdrop — art-directed, so this is a <picture> rather than next/image:
 * desktop gets the wide villa frame, mobile a portrait crop of the same scene.
 * next/image resizes one source but cannot swap crops at a breakpoint, and the
 * crop is the point. Sources are already small (≈200 KB / 156 KB) and only one
 * is ever fetched.
 *
 * A silent loop can sit on top on desktop once the client supplies one.
 */
export function HeroMedia() {
  const { desktop, mobile, videoWebm, videoMp4, alt } = HERO_MEDIA;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <picture>
        <source media="(min-width: 768px)" srcSet={desktop} />
        <img
          src={mobile}
          alt={alt}
          fetchPriority="high"
          decoding="async"
          className="size-full object-cover"
        />
      </picture>

      {(videoWebm || videoMp4) && (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={desktop}
          aria-hidden
          className="absolute inset-0 hidden size-full object-cover motion-safe:md:block"
        >
          {videoWebm && <source src={videoWebm} type="video/webm" />}
          {videoMp4 && <source src={videoMp4} type="video/mp4" />}
        </video>
      )}

      {/*
        Legibility scrim. Two passes: a vertical one that seats the header and
        the baseline row, and a left-hand one that carries the desktop lockup.
        Kept in the 8-22% band the image-pack README asks for, except at the very
        edges where type actually sits.
      */}
      <div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,5,5,0.78) 0%, rgba(5,5,5,0.18) 26%, rgba(5,5,5,0.42) 62%, rgba(5,5,5,0.92) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 z-10 hidden md:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,5,0.86) 0%, rgba(5,5,5,0.55) 34%, rgba(5,5,5,0.12) 62%, transparent 100%)",
        }}
      />
      {/* Mobile stacks type over the middle of the frame, where the villa is
          brightest — this seats the lower half so ivory copy keeps its contrast. */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 md:hidden"
        style={{
          background:
            "linear-gradient(180deg, transparent 30%, rgba(5,5,5,0.42) 46%, rgba(5,5,5,0.78) 64%, rgba(5,5,5,0.95) 100%)",
        }}
      />
      <Grain opacity={0.13} />
    </div>
  );
}
