import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { SiteNav } from '@/components/layout/SiteNav';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { DocsTabs } from '@/components/docs/DocsTabs';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { DOC_TRACKS, getTrack } from '@/lib/docs-tracks';
import { getDocPages } from '@/data/docs';
import { SITE, absoluteUrl } from '@/lib/site';

type Params = { params: { track: string } };

export function generateStaticParams() {
    return DOC_TRACKS.filter((t) => getDocPages(t.id).length > 0).map((t) => ({ track: t.id }));
}

export function generateMetadata({ params }: Params): Metadata {
    const track = getTrack(params.track);
    if (!track) return { title: 'Không tìm thấy' };
    return {
        title: `Học ${track.name} | ${SITE.name}`,
        description: track.description,
        alternates: { canonical: absoluteUrl(`/docs/${track.id}/`) },
    };
}

export default function TrackPage({ params }: Params) {
    const track = getTrack(params.track);
    const pages = getDocPages(params.track);
    if (!track || !pages.length) notFound();

    return (
        <>
            <SiteNav />
            <DocsTabs active={track.id} />
            <main className="min-h-screen bg-[#050505] pt-32 pb-24">
                <div className="container mx-auto px-6 flex flex-col lg:flex-row lg:gap-10">
                    <DocsSidebar track={track.id} trackName={track.name} pages={pages} />
                    <div className="min-w-0 flex-1 max-w-3xl">
                        <p className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: track.color }}>Docs</p>
                        <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-zinc-100">{track.name}</h1>
                        <p className="mt-4 text-lg text-zinc-400 leading-relaxed">{track.description}</p>
                        <Link
                            href={`/docs/${track.id}/${pages[0].slug}`}
                            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-black hover:bg-white"
                        >
                            Bắt đầu học <ArrowRight size={18} aria-hidden />
                        </Link>

                        <ol className="mt-12 grid gap-3 sm:grid-cols-2">
                            {pages.map((p, i) => (
                                <li key={p.slug}>
                                    <Link
                                        href={`/docs/${track.id}/${p.slug}`}
                                        className="block h-full rounded-lg border border-white/10 bg-zinc-900/40 p-4 hover:border-primary/50"
                                    >
                                        <span className="font-mono text-xs text-zinc-500">{String(i + 1).padStart(2, '0')}</span>
                                        <span className="mt-1 block font-semibold text-zinc-100">{p.title}</span>
                                        <span className="mt-1 block text-sm text-zinc-400 line-clamp-2">{p.description}</span>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
