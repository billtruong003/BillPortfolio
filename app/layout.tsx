import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PipelineTrigger } from "@/components/logic/PipelineTrigger";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.billthedev.com"),
  title: "Bill The Dev | Senior Technical Artist",
  description: "Immersive Tech, Unity Development, and Toolsmithing.",
  openGraph: {
    title: "Bill The Dev | Technical Artist",
    description: "Immersive Tech, Unity Development, and Toolsmithing.",
    url: "https://www.billthedev.com",
    siteName: "Bill The Dev",
    type: "website",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${mono.variable}`}>
      <body className="antialiased bg-black text-white">
        <PipelineTrigger />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}