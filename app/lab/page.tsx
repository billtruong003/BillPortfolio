import { postManifest } from '@/data/posts';
import { PostGrid } from '@/components/lab/PostGrid';
import { LabNav } from '@/components/lab/LabNav';
import { FlaskConical } from 'lucide-react';
import type { Metadata } from 'next';
import { SITE, absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
    title: 'Dev Lab | Bill The Dev',
    description: 'Step-by-step Unity 6 series by Bill Truong: build a game from an empty scene to a playable Web build.',
    alternates: { canonical: absoluteUrl('/lab/'), types: { 'application/rss+xml': absoluteUrl('/lab/feed.xml') } },
    openGraph: { type: 'website', url: absoluteUrl('/lab/'), siteName: SITE.name, title: 'Dev Lab | Bill The Dev', description: 'Step-by-step Unity 6 series by Bill Truong: build a game from an empty scene to a playable Web build.' },
};

export default function LabPage() {
    return (
        <main className="relative min-h-screen w-full bg-[#050505]">
            <LabNav />
            <div className="relative z-10">
                {/* Hero */}
                <section className="pt-20 pb-16 px-6">
                    <div className="container mx-auto max-w-5xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-lg">
                                <FlaskConical size={20} className="text-primary" />
                            </div>
                            <span className="font-mono text-primary text-xs tracking-[0.4em] uppercase">Dev Lab</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tight mb-4">
                            Build games with <span className="text-primary">Unity 6</span>
                        </h1>
                        <p className="text-zinc-400 max-w-2xl text-base leading-relaxed">
                            Step-by-step series in English and Vietnamese. Every lesson ends with a build you can run,
                            with the scripts to download, and the finished game is playable in the Game Lab.
                        </p>
                    </div>
                </section>

                {/* Posts */}
                <section className="pb-32 px-6">
                    <div className="container mx-auto max-w-5xl">
                        <PostGrid posts={postManifest.posts} />
                    </div>
                </section>
            </div>

            <footer className="relative z-10 py-12 text-center border-t border-white/5 bg-black/40 backdrop-blur-md">
                <p className="text-zinc-600 font-mono text-xs">
                    &copy; {new Date().getFullYear()} Bill The Dev. Engineered with Next.js.
                </p>
            </footer>
        </main>
    );
}
