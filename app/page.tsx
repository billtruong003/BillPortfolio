// app/page.tsx
'use client';
import { ParticleBackground } from '@/components/canvas/ParticleBackground'; // Đã thêm ngoặc nhọn { }
import { Hero } from '@/components/sections/Hero';
import { Portfolio } from '@/components/sections/Portfolio';
import { Experience } from '@/components/sections/Experience';
import { Feed } from '@/components/sections/Feed';
import { ProjectModal } from '@/components/overlay/ProjectModal';

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <ProjectModal />
      <Hero />
      <Portfolio />
      <Experience />
      <Feed />
      
      <footer className="py-12 text-center border-t border-zinc-900 bg-black">
        <p className="text-zinc-600 font-mono text-xs">
            © {new Date().getFullYear()} Bill The Dev. <br className="md:hidden"/> Engineered with Next.js & R3F.
        </p>
      </footer>
    </main>
  );
}