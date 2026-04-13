'use client';
import { BlogPost } from '@/types';
import { Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import { getAssetPath } from '@/lib/utils';

export const PostHeader = ({ post }: { post: BlogPost }) => {
    return (
        <header className="mb-12">
            {post.coverImage && (
                <div className="relative aspect-[21/9] rounded-xl overflow-hidden mb-8 border border-zinc-800">
                    <Image
                        src={getAssetPath(post.coverImage)}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                </div>
            )}

            <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                    {post.category.replace('-', ' ')}
                </span>
                {post.featured && (
                    <span className="px-2.5 py-1 bg-primary/90 text-black text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                        Featured
                    </span>
                )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-zinc-100 leading-tight mb-6 tracking-tight">
                {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500 mb-6">
                <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                {post.updated && post.updated !== post.date && (
                    <span className="text-zinc-600">
                        Updated {new Date(post.updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                )}
                <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {post.readingTime} min read
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-1 bg-zinc-800/60 text-zinc-300 rounded border border-zinc-700/50 font-mono">
                        #{tag}
                    </span>
                ))}
            </div>
        </header>
    );
};
