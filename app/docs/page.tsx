import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteNav } from '@/components/layout/SiteNav';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { DocsTabs } from '@/components/docs/DocsTabs';
import { DOC_TRACKS } from '@/lib/docs-tracks';
import { getDocPages } from '@/data/docs';
import { SITE, absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
    title: `Docs lập trình tiếng Việt | ${SITE.name}`,
    description: 'Tài liệu lập trình cơ bản bằng tiếng Việt: C#, Python, JavaScript, TypeScript, HLSL cho Unity và các bài giải thuật hay gặp khi phỏng vấn.',
    alternates: { canonical: absoluteUrl('/docs/') },
};

export default function DocsIndex() {
    const tracks = DOC_TRACKS.map((t) => ({ ...t, count: getDocPages(t.id).length })).filter((t) => t.count > 0);

    return (
        <>
            <SiteNav />
            <DocsTabs />
            <main className="min-h-screen bg-[#050505] pt-32 pb-24">
                <div className="container mx-auto px-6 max-w-5xl">
                    <p className="font-mono text-primary text-xs uppercase tracking-[0.3em]">Docs</p>
                    <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-zinc-100">Học lập trình bằng tiếng Việt</h1>
                    <p className="mt-4 max-w-2xl text-lg text-zinc-400 leading-relaxed">
                        Mỗi trang một khái niệm, có ví dụ chạy được, lỗi hay gặp và bài tập kèm đáp án. Viết cho người mới, ví dụ lấy từ chuyện làm game.
                    </p>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2">
                        {tracks.map((t) => (
                            <Link
                                key={t.id}
                                href={`/docs/${t.id}`}
                                className="group rounded-xl border border-white/10 bg-zinc-900/40 p-6 hover:border-white/30"
                                style={{ borderTopColor: t.color, borderTopWidth: 3 }}
                            >
                                <h2 className="text-2xl font-bold text-zinc-100 group-hover:text-primary">{t.name}</h2>
                                <p className="mt-2 text-zinc-400 leading-relaxed">{t.description}</p>
                                <p className="mt-4 font-mono text-xs text-zinc-500">{t.count} bài</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
