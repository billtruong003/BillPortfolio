import { postManifest } from '@/data/posts';
import { PostGrid } from '@/components/lab/PostGrid';
import { LabNav } from '@/components/lab/LabNav';
import { FlaskConical } from 'lucide-react';

export const metadata = {
    title: 'Lab | Bill The Dev',
    description: 'Shader breakdowns, Unity tutorials, and tech art experiments by Bill Truong.',
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
                            Shader Breakdowns & <span className="text-primary">Tech Notes</span>
                        </h1>
                        <p className="text-zinc-400 max-w-2xl text-base leading-relaxed">
                            Deep dives into shader code, Unity rendering, and technical art.
                            Each post includes full source code and performance analysis.
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
