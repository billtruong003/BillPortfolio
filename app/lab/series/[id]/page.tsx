import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, ChevronRight, Clock } from 'lucide-react';
import { postManifest } from '@/data/posts';
import { LabNav } from '@/components/lab/LabNav';
import { SERIES_CONFIG, getSeries, getSeriesPosts } from '@/lib/series';
import { SITE, absoluteUrl } from '@/lib/site';

type Params = { params: { id: string } };

export function generateStaticParams() {
    return SERIES_CONFIG
        .filter(s => getSeriesPosts(postManifest.posts, s.id).length > 0)
        .map(s => ({ id: s.id }));
}

export function generateMetadata({ params }: Params): Metadata {
    const series = getSeries(params.id);
    if (!series) return { title: 'Series Not Found' };
    const url = absoluteUrl(`/lab/series/${series.id}/`);
    return {
        title: `${series.name} | ${SITE.name} Lab`,
        description: series.description,
        alternates: { canonical: url },
        openGraph: { type: 'website', url, siteName: SITE.name, title: series.name, description: series.description },
    };
}

export default function SeriesPage({ params }: Params) {
    const series = getSeries(params.id);
    if (!series) notFound();

    const posts = getSeriesPosts(postManifest.posts, series.id);
    const totalTime = posts.reduce((sum, p) => sum + p.readingTime, 0);

    return (
        <main className="relative min-h-screen w-full bg-[#050505]">
            <LabNav postTitle={series.name} />

            <div className="relative z-10 pt-28 pb-24 px-6">
                <div className="container mx-auto max-w-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{series.icon}</span>
                        <span className="font-mono text-primary text-xs tracking-[0.4em] uppercase">Learning Path</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tight mb-4">{series.name}</h1>
                    <p className="text-zinc-400 max-w-2xl leading-relaxed mb-6">{series.description}</p>
                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 mb-12">
                        <span className="flex items-center gap-1.5"><BookOpen size={12} /> {posts.length} bài</span>
                        <span className="flex items-center gap-1.5"><Clock size={12} /> {totalTime} min tổng</span>
                    </div>

                    <ol className="space-y-3">
                        {posts.map((post, idx) => (
                            <li key={post.slug}>
                                <Link
                                    href={`/lab/${post.slug}`}
                                    className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800/50 hover:border-primary/40 rounded-lg transition-colors group"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-sm font-mono font-bold text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-base text-zinc-200 group-hover:text-primary transition-colors">{post.title}</div>
                                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{post.excerpt}</p>
                                        <div className="text-[10px] text-zinc-600 font-mono mt-2">{post.readingTime} min read</div>
                                    </div>
                                    <ChevronRight size={16} className="text-zinc-700 group-hover:text-primary shrink-0" />
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>

            <footer className="relative z-10 py-12 text-center border-t border-white/5 bg-black/40 backdrop-blur-md">
                <p className="text-zinc-600 font-mono text-xs">
                    &copy; {new Date().getFullYear()} Bill The Dev. Engineered with Next.js.
                </p>
            </footer>
        </main>
    );
}
