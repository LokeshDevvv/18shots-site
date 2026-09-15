import { Mail } from "lucide-react";

/**
 * lucide-react v1 dropped brand glyphs, so Instagram and WhatsApp are inline.
 * Stroke weights match the lucide icons used elsewhere (1.5 at 24px).
 */

type IconProps = { size?: number; className?: string };

export function InstagramIcon({ size = 15, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 15, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-4-1L3 21l2-5.5a8.5 8.5 0 0 1-1-4 8.38 8.38 0 0 1 8.5-8.5A8.38 8.38 0 0 1 21 11.5Z" />
      <path d="M8.6 9.2c0 3 2.2 5.2 5.2 5.2l1-1 1.6.9-.5 1.4c-2.9.5-6.9-2.5-7.4-5.4l1.4-.5.9 1.6-1 1" />
    </svg>
  );
}

export function MailIcon({ size = 15, className }: IconProps) {
  return <Mail size={size} strokeWidth={1.5} className={className} aria-hidden />;
}
