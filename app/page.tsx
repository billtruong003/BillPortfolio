'use client';
import dynamic from 'next/dynamic';
import { Hero } from '@/components/sections/Hero';
import { Portfolio } from '@/components/sections/Portfolio';
import { Experience } from '@/components/sections/Experience';
import { Testimonials } from '@/components/sections/Testimonials';
import { Certifications } from '@/components/sections/Certifications';
import { Feed } from '@/components/sections/Feed';
import { TrustedBy } from '@/components/sections/TrustedBy';
import { BigProductions } from '@/components/sections/BigProductions';
import { ProjectModal } from '@/components/overlay/ProjectModal';

const ParticleBackground = dynamic(() => import('@/components/canvas/ParticleBackground').then(mod => mod.ParticleBackground), {
  ssr: false
});

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#050505]">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleBackground />
      </div>

      <ProjectModal />

      <div className="relative z-10">
        <Hero />
        
        <div className="flex flex-col">
            <TrustedBy />
            <BigProductions />
        </div>
        
        <Certifications />
        <Portfolio />
        <Experience />
        <Testimonials />
        <Feed />
      </div>
      
      <footer className="relative z-10 py-12 text-center border-t border-white/5 bg-black/40 backdrop-blur-md">
        <p className="text-zinc-600 font-mono text-xs">
            © {new Date().getFullYear()} Bill The Dev. <br className="md:hidden"/> Engineered with Next.js & R3F.
        </p>
      </footer>
    </main>
  );
}