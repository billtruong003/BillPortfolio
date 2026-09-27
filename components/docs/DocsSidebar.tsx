import Link from 'next/link';
import type { DocPage } from '@/data/docs';
import { cn } from '@/lib/utils';

const groupBySection = (pages: DocPage[]) => {
    const groups = new Map<string, DocPage[]>();
    for (const p of pages) groups.set(p.section, [...(groups.get(p.section) ?? []), p]);
    return [...groups];
};

const List = ({ track, pages, current }: { track: string; pages: DocPage[]; current?: string }) => (
    <div className="space-y-6">
        {groupBySection(pages).map(([section, items]) => (
            <div key={section}>
                <p className="mb-2 px-3 text-xs font-mono uppercase tracking-wider text-zinc-500">{section}</p>
                <ul>
                    {items.map((p) => (
                        <li key={p.slug}>
                            <Link
                                href={`/docs/${track}/${p.slug}`}
                                aria-current={p.slug === current ? 'page' : undefined}
                                className={cn(
                                    'block rounded-md px-3 py-1.5 text-sm transition-colors',
                                    p.slug === current ? 'bg-primary text-black font-semibold' : 'text-zinc-300 hover:bg-white/5 hover:text-white',
                                )}
                            >
                                {p.title.split(':')[0]}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        ))}
    </div>
);

export const DocsSidebar = ({ track, trackName, pages, current }: { track: string; trackName: string; pages: DocPage[]; current?: string }) => (
    <>
        <details className="lg:hidden mb-8 rounded-lg border border-white/10 bg-zinc-900/60">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-zinc-200">Mục lục {trackName}</summary>
            <div className="px-1 pb-4">
                <List track={track} pages={pages} current={current} />
            </div>
        </details>
        <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto pr-2 pb-8">
                <p className="mb-4 px-3 font-bold text-zinc-100">{trackName}</p>
                <List track={track} pages={pages} current={current} />
            </div>
        </aside>
    </>
);
