import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PipelineTrigger } from "@/components/logic/PipelineTrigger";
import { Analytics } from "@/components/logic/Analytics";
import { SITE } from "@/lib/site";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: `${SITE.name} | ${SITE.title}`,
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} | ${SITE.title}`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${mono.variable}`}>
      <body className="antialiased bg-black text-white">
        <Analytics />
        <PipelineTrigger />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}