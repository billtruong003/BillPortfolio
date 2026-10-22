import type { Metadata } from "next";
import { Lexend, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Analytics } from "@/components/logic/Analytics";
import { SITE } from "@/lib/site";

// Lexend over Outfit: Outfit has no Vietnamese letters, so words like "phần" or "viền" mixed in a
// fallback font for ầ/ề. Lexend is as geometric and covers Vietnamese. (The CSS variable keeps its name.)
const outfit = Lexend({ subsets: ["latin", "latin-ext", "vietnamese"], variable: "--font-outfit" });
const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext", "vietnamese"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: `${SITE.siteName} | ${SITE.title}`,
  description: SITE.description,
  openGraph: {
    title: `${SITE.siteName} | ${SITE.title}`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.siteName,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${mono.variable}`}>
      <body className="antialiased bg-black text-white">
        <Analytics />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}