import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { BRAND, EVENT } from "@/lib/site";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
