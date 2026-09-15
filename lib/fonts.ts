import { Bodoni_Moda, Geist } from "next/font/google";

/**
 * Two families. A third, handwritten face was tried and removed — a script
 * accent is the single strongest tell of a generated luxury template, and the
 * identity should come from the Bodoni/Geist contrast instead. If the brand
 * needs handwritten energy it should be a drawn graphic, not a webfont.
 *
 * Free Google stand-ins matching the approved mockup. If the client supplies
 * licensed faces, swap them here with next/font/local — no component names a
 * family directly.
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

export const fontVariables = `${bodoni.variable} ${geist.variable}`;
