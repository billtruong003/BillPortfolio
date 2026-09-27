import Link from 'next/link';
import { DOC_TRACKS } from '@/lib/docs-tracks';
import { cn } from '@/lib/utils';

// Language bar under the site nav, like the colored strip on W3Schools.
export const DocsTabs = ({ active }: { active?: string }) => (
    <nav aria-label="Ngôn ngữ" className="fixed top-16 inset-x-0 z-40 border-b border-white/10 bg-zinc-950/95 backdrop-blur">
        <ul className="container mx-auto px-6 flex gap-1 overflow-x-auto">
            <li>
                <Link
                    href="/docs"
                    className={cn('block px-4 py-2.5 text-sm whitespace-nowrap hover:text-primary', !active ? 'text-primary' : 'text-zinc-400')}
                >
                    Tất cả
                </Link>
            </li>
            {DOC_TRACKS.map((t) => (
                <li key={t.id}>
                    <Link
                        href={`/docs/${t.id}`}
                        aria-current={active === t.id ? 'page' : undefined}
                        className={cn(
                            'block px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                            active === t.id ? 'text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-100',
                        )}
                        style={active === t.id ? { borderColor: t.color } : undefined}
                    >
                        {t.short}
                    </Link>
                </li>
            ))}
        </ul>
    </nav>
);
