import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { BRAND, EVENT } from "@/lib/site";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BookingProvider } from "@/components/booking/booking-provider";
import { BookingShell } from "@/components/booking/booking-shell";
import { StickyCta } from "@/components/site/sticky-cta";
import { getPassCatalogue } from "@/lib/booking/passes";
import { isSupabaseConfigured } from "@/lib/booking/env";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${EVENT.title.join(" ")} — ${BRAND.eventsName}`,
    template: `%s — ${BRAND.name}`,
  },
  description: `${EVENT.subtitle}. ${EVENT.dateLong}, ${EVENT.city}.`,
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // null means Supabase is configured but unreachable — the booking flow shows
  // an unavailable state rather than quoting prices we cannot verify.
  const passes = await getPassCatalogue();

  return (
    <html lang="en" className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col">
        {/*
          One booking controller for the whole site. Every CTA — header, mobile
          menu, hero, pass blocks, final CTA — opens this same flow. There is no
          /book route.
        */}
        <BookingProvider
          passes={passes ?? []}
          catalogueUnavailable={passes === null}
          previewMode={!isSupabaseConfigured()}
        >
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <StickyCta />
          <BookingShell />
        </BookingProvider>
      </body>
    </html>
  );
}
