'use client';
import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLabStore } from '@/hooks/useLabStore';
import { PostCard } from './PostCard';
import { BlogPost } from '@/types';
import { Search, X, Filter } from 'lucide-react';
import { SciFiLoadBtn } from '@/components/ui/SciFiLoadBtn';

const INITIAL_COUNT = 6;
const LOAD_INCREMENT = 6;

export const PostGrid = ({ posts }: { posts: BlogPost[] }) => {
    const { activeCategory, activeTags, searchQuery, setCategory, toggleTag, setSearch, clearFilters } = useLabStore();
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

    const categories = useMemo(() => {
        const map: Record<string, number> = {};
        for (const p of posts) map[p.category] = (map[p.category] || 0) + 1;
        return Object.entries(map).map(([name, count]) => ({ name, count }));
    }, [posts]);

    const allTags = useMemo(() => {
        const map: Record<string, number> = {};
        for (const p of posts) for (const t of p.tags) map[t] = (map[t] || 0) + 1;
        return Object.entries(map)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [posts]);

    const filtered = useMemo(() => {
        let result = posts;
        if (activeCategory !== 'all') {
            result = result.filter(p => p.category === activeCategory);
        }
        if (activeTags.length > 0) {
            result = result.filter(p => activeTags.some(t => p.tags.includes(t)));
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.excerpt.toLowerCase().includes(q) ||
                p.tags.some(t => t.toLowerCase().includes(q))
            );
        }
        return result;
    }, [posts, activeCategory, activeTags, searchQuery]);

    const visible = filtered.slice(0, visibleCount);
    const hasMore = visibleCount < filtered.length;
    const hasFilters = activeCategory !== 'all' || activeTags.length > 0 || searchQuery !== '';

    return (
        <div className="space-y-8">
            {/* Search */}
            <div className="relative max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 font-mono focus:border-primary/50 focus:outline-none transition-colors"
                />
                {searchQuery && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setCategory('all')}
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all border rounded ${
                        activeCategory === 'all'
                            ? 'border-primary text-primary bg-primary/10'
                            : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                >
                    All ({posts.length})
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.name}
                        onClick={() => setCategory(cat.name as any)}
                        className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all border rounded ${
                            activeCategory === cat.name
                                ? 'border-primary text-primary bg-primary/10'
                                : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                        }`}
                    >
                        {cat.name.replace('-', ' ')} ({cat.count})
                    </button>
                ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 12).map(tag => (
                    <button
                        key={tag.name}
                        onClick={() => toggleTag(tag.name)}
                        className={`px-2 py-1 text-[10px] font-mono transition-all border rounded-full ${
                            activeTags.includes(tag.name)
                                ? 'border-primary text-primary bg-primary/10'
                                : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
                        }`}
                    >
                        #{tag.name}
                    </button>
                ))}
            </div>

            {/* Active filters */}
            {hasFilters && (
                <div className="flex items-center gap-3">
                    <Filter size={12} className="text-zinc-500" />
                    <span className="text-[10px] font-mono text-zinc-500">
                        {filtered.length} post{filtered.length !== 1 ? 's' : ''} found
                    </span>
                    <button onClick={clearFilters} className="text-[10px] font-mono text-primary hover:underline">
                        Clear all
                    </button>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {visible.map(post => (
                        <PostCard key={post.slug} post={post} />
                    ))}
                </AnimatePresence>
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-zinc-500 font-mono text-sm">No posts match your filters.</p>
                </div>
            )}

            {hasMore && (
                <SciFiLoadBtn
                    onClick={() => setVisibleCount(prev => Math.min(prev + LOAD_INCREMENT, filtered.length))}
                    label="LOAD_MORE_POSTS"
                />
            )}
        </div>
    );
};
