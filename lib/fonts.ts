import { Bodoni_Moda, Geist, Sacramento } from "next/font/google";

/**
 * Three families only. See docs/visual-reference.md § Type system.
 *
 * These are free Google stand-ins chosen to match the approved mockup. If the
 * client supplies licensed faces, swap them here with next/font/local — nothing
 * else in the codebase references a font family directly.
 */

// Display + section headlines. High-contrast didone.
export const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
});

// All UI, body copy, labels, forms.
export const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

// The single gold script accent. Hero only.
export const sacramento = Sacramento({
  variable: "--font-sacramento",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const fontVariables = `${bodoni.variable} ${geist.variable} ${sacramento.variable}`;
