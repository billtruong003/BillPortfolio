import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SiteNav } from '@/components/layout/SiteNav';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { DocsTabs } from '@/components/docs/DocsTabs';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { DocEnhancer } from '@/components/docs/DocEnhancer';
import { JsonLd } from '@/components/logic/JsonLd';
import { DOC_TRACKS, getTrack } from '@/lib/docs-tracks';
import { getDocPages } from '@/data/docs';
import { SITE, absoluteUrl } from '@/lib/site';
import { getAssetPath } from '@/lib/utils';

type Params = { params: { track: string; slug: string } };

export function generateStaticParams() {
    return DOC_TRACKS.flatMap((t) => getDocPages(t.id).map((p) => ({ track: t.id, slug: p.slug })));
}

const find = ({ track, slug }: Params['params']) => {
    const pages = getDocPages(track);
    const index = pages.findIndex((p) => p.slug === slug);
    return { track: getTrack(track), pages, page: pages[index], prev: pages[index - 1], next: pages[index + 1] };
};

export function generateMetadata({ params }: Params): Metadata {
    const { track, page } = find(params);
    if (!track || !page) return { title: 'Không tìm thấy' };
    const url = absoluteUrl(`/docs/${track.id}/${page.slug}/`);
    return {
        title: `${page.title} | ${track.name} | ${SITE.name}`,
        description: page.description,
        alternates: { canonical: url },
        openGraph: {
            type: 'article',
            url,
            siteName: SITE.name,
            title: page.title,
            description: page.description,
            locale: 'vi_VN',
            images: page.image ? [{ url: absoluteUrl(page.image), alt: page.title }] : undefined,
        },
    };
}

const Pager = ({ track, prev, next }: { track: string; prev?: { slug: string; title: string }; next?: { slug: string; title: string } }) => (
    <div className="flex justify-between gap-4">
        {prev ? (
            <Link href={`/docs/${track}/${prev.slug}`} className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-bold text-black hover:bg-white">
                <ChevronLeft size={16} aria-hidden /> Bài trước
            </Link>
        ) : <span />}
        {next ? (
            <Link href={`/docs/${track}/${next.slug}`} className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-bold text-black hover:bg-white">
                Bài tiếp <ChevronRight size={16} aria-hidden />
            </Link>
        ) : <span />}
    </div>
);

export default function DocPageRoute({ params }: Params) {
    const { track, pages, page, prev, next } = find(params);
    if (!track || !page) notFound();

    return (
        <>
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'TechArticle',
                    headline: page.title,
                    description: page.description,
                    inLanguage: 'vi',
                    author: { '@type': 'Person', name: SITE.author, url: SITE.url },
                    isPartOf: { '@type': 'Course', name: track.name, url: absoluteUrl(`/docs/${track.id}/`) },
                }}
            />
            <SiteNav />
            <DocsTabs active={track.id} />
            <main className="min-h-screen bg-[#050505] pt-32 pb-24">
                <div className="container mx-auto px-6 flex flex-col lg:flex-row lg:gap-10">
                    <DocsSidebar track={track.id} trackName={track.name} pages={pages} current={page.slug} />

                    <div className="min-w-0 flex-1 max-w-3xl">
                        <p className="mb-3 text-xs font-mono text-zinc-500">
                            <Link href="/docs" className="hover:text-primary">Docs</Link>
                            {' / '}
                            <Link href={`/docs/${track.id}`} className="hover:text-primary">{track.name}</Link>
                        </p>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-100">{page.title}</h1>
                        {page.difficulty && (
                            <p className="mt-3 inline-block rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
                                Độ khó: {page.difficulty}
                            </p>
                        )}

                        <div className="my-8"><Pager track={track.id} prev={prev} next={next} /></div>

                        {page.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={getAssetPath(page.image)}
                                alt=""
                                width={1200}
                                height={675}
                                className="mb-8 w-full rounded-xl border border-white/10"
                            />
                        )}

                        <article id="doc-body" lang="vi" className="lab-prose doc-prose" dangerouslySetInnerHTML={{ __html: page.html }} />
                        <DocEnhancer rootId="doc-body" />

                        <div className="mt-12 pt-8 border-t border-white/10"><Pager track={track.id} prev={prev} next={next} /></div>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
