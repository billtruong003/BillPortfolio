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
        
        {/* === ARCADE CTA SECTION === */}
        <section className="py-16 px-6 border-y border-white/5 bg-[#080808] relative z-20">
          <div className="container mx-auto flex flex-col items-center text-center gap-6">
            <span className="font-mono text-primary text-xs tracking-[0.4em] uppercase">Interactive Lab</span>
            <h2 className="text-3xl font-bold text-zinc-100">Want to play some games?</h2>
            <p className="text-zinc-500 text-sm max-w-lg">
              Explore my WebGL game builds — playable directly in your browser. No downloads needed.
            </p>
            <a 
              href="/arcade" 
              className="group flex items-center gap-3 px-8 py-4 bg-primary/10 hover:bg-primary text-primary hover:text-black font-mono text-sm font-bold uppercase tracking-widest border border-primary/30 hover:border-primary rounded-lg transition-all duration-300 shadow-lg hover:shadow-primary/20"
            >
              🎮 ENTER GAME ARCADE
            </a>
          </div>
        </section>

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