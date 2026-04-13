'use client';
import Link from 'next/link';
import { Home, FlaskConical, ChevronRight } from 'lucide-react';

interface LabNavProps {
    postTitle?: string;
}

export const LabNav = ({ postTitle }: LabNavProps) => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
            <div className="container mx-auto max-w-5xl px-6 h-12 flex items-center gap-2 text-xs font-mono">
                <Link
                    href="/"
                    className="text-zinc-400 hover:text-primary transition-colors flex items-center gap-1.5 shrink-0"
                >
                    <Home size={14} />
                    <span className="hidden sm:inline">Home</span>
                </Link>
                <ChevronRight size={12} className="text-zinc-700 shrink-0" />
                <Link
                    href="/lab"
                    className={`flex items-center gap-1.5 shrink-0 transition-colors ${
                        postTitle ? 'text-zinc-400 hover:text-primary' : 'text-primary'
                    }`}
                >
                    <FlaskConical size={14} />
                    Lab
                </Link>
                {postTitle && (
                    <>
                        <ChevronRight size={12} className="text-zinc-700 shrink-0" />
                        <span className="text-zinc-300 truncate max-w-[40vw]">{postTitle}</span>
                    </>
                )}
            </div>
        </nav>
    );
};
