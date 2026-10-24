import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { introGateScript } from "@/lib/intro-gate";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
});

const dmSans = DM_Sans({ subsets: ["latin"], axes: ["opsz"], variable: "--font-dm-sans", display: "swap" });

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotbun.example";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HOT BUN — Smash burgers, crispy chicken & thick shakes · Order online",
    template: "%s · HOT BUN",
  },
  description:
    "Double-smashed burgers, Nashville hot chicken, loaded fries and thick shakes. Order pickup or delivery online, or book a booth at HOT BUN, 48 Foundry Lane.",
  applicationName: "HOT BUN",
  keywords: ["smash burgers", "burger restaurant", "fried chicken", "milkshakes", "order online", "book a table", "Riverside"],
  openGraph: {
    type: "website",
    siteName: "HOT BUN",
    locale: "en_US",
    url: "/",
    title: "HOT BUN — Smash burgers. Loud flavours.",
    description: "Order smash burgers, crispy chicken and shakes for pickup or delivery — or book a booth.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HOT BUN — Smash burgers. Loud flavours.",
    description: "Order online or book a booth.",
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#D63A24",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Decide before first paint whether the burger intro plays (no flash for returning visitors). */}
        <script dangerouslySetInnerHTML={{ __html: introGateScript }} />
      </head>
      <body className="bg-doodles">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-cream"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
