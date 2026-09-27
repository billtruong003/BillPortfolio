import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { ImpactNumbers } from "@/components/sections/ImpactNumbers";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { BigProductions } from "@/components/sections/BigProductions";
import { YouTubeChannels } from "@/components/sections/YouTubeChannels";
import { Experience } from "@/components/sections/Experience";
import { Portfolio } from "@/components/sections/Portfolio";
import { Testimonials } from "@/components/sections/Testimonials";
import { Certifications } from "@/components/sections/Certifications";
import { Contact } from "@/components/sections/Contact";
import { Services } from "@/components/sections/Services";
import { LabShowcase } from "@/components/sections/LabShowcase";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ProjectModal } from "@/components/overlay/ProjectModal";
import { JsonLd } from "@/components/logic/JsonLd";
import { SITE } from "@/lib/site";
import resume from "@/data/resume.json";
import registry from "@/public/webgl-games/registry.json";
import { postManifest } from "@/data/posts";

const gameCount = registry.games.length;
const labPostCount = new Set(postManifest.posts.map((p) => p.translationKey || p.slug)).size;

const ParticleBackground = dynamic(
  () => import("@/components/canvas/ParticleBackground").then((mod) => mod.ParticleBackground),
  { ssr: false }
);

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: resume.profile.name,
  jobTitle: resume.profile.title,
  description: resume.profile.about,
  url: SITE.url,
  email: resume.profile.contact.email,
  address: { "@type": "PostalAddress", addressLocality: "Ho Chi Minh City", addressCountry: "VN" },
  sameAs: resume.socials.map((s) => s.url),
};

export default function Home() {
  return (
    <>
    <JsonLd data={personJsonLd} />
    <main className="relative min-h-screen w-full bg-[#050505] overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleBackground />
      </div>

      <SiteNav />
      <div className="relative z-10">
        <Hero />
        <ImpactNumbers gameCount={gameCount} labPostCount={labPostCount} />
        <Services />
        <BigProductions />
        <LabShowcase />
        <Experience />
        <TrustedBy />
        <Portfolio />
        <Testimonials />
        <YouTubeChannels />
        <Certifications />
        <Contact />
      </div>

      <ProjectModal />
      <SiteFooter />
    </main>
    </>
  );
}