'use client';
import { useState, useEffect } from 'react';
import { PostHeading } from '@/types';
import { List } from 'lucide-react';

export const TableOfContents = ({ headings }: { headings: PostHeading[] }) => {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                }
            },
            { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
        );

        for (const heading of headings) {
            const el = document.getElementById(heading.id);
            if (el) observer.observe(el);
        }

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav className="sticky top-24 space-y-1">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
                <List size={14} className="text-primary" />
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">On this page</span>
            </div>
            {headings.map((h) => (
                <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`block text-xs transition-all duration-200 py-1 border-l-2 ${
                        h.level === 3 ? 'pl-6' : 'pl-3'
                    } ${
                        activeId === h.id
                            ? 'border-primary text-primary font-medium'
                            : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
                    }`}
                >
                    {h.text}
                </a>
            ))}
        </nav>
    );
};
