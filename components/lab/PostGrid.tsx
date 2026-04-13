'use client';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLabStore } from '@/hooks/useLabStore';
import { PostCard } from './PostCard';
import { BlogPost } from '@/types';
import { Search, X, Filter, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { SciFiLoadBtn } from '@/components/ui/SciFiLoadBtn';
import { SERIES_CONFIG, getSeriesPosts } from '@/lib/series';
import Link from 'next/link';

const INITIAL_COUNT = 6;
const LOAD_INCREMENT = 6;

/* ── Series Card ── */
const SeriesCard = ({
    series,
    posts,
    isActive,
    onClick,
}: {
    series: (typeof SERIES_CONFIG)[0];
    posts: BlogPost[];
    isActive: boolean;
    onClick: () => void;
}) => {
    const totalTime = posts.reduce((sum, p) => sum + p.readingTime, 0);
    return (
        <motion.button
            onClick={onClick}
            layout
            className={`relative text-left p-4 rounded-xl border transition-all duration-300 overflow-hidden group ${
                isActive
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80'
            }`}
        >
            <div
                className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
                style={{ background: `linear-gradient(135deg, ${series.color}, transparent)` }}
            />
            <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{series.icon}</span>
                    <span className="font-bold text-sm text-zinc-100">{series.name}</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">{series.description}</p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                        <BookOpen size={10} />
                        {posts.length} bài
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {totalTime} min
                    </span>
                </div>
            </div>
        </motion.button>
    );
};

/* ── Series Expanded List ── */
const SeriesList = ({ posts, seriesName }: { posts: BlogPost[]; seriesName: string }) => (
    <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
    >
        <div className="pt-2 pb-4">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-bold text-zinc-200">{seriesName}</h3>
                <span className="text-[10px] font-mono text-zinc-600">— Theo thứ tự học</span>
            </div>
            <div className="space-y-2">
                {posts.map((post, idx) => (
                    <Link
                        key={post.slug}
                        href={`/lab/${post.slug}`}
                        className="flex items-center gap-4 p-3 bg-zinc-900/50 border border-zinc-800/50 hover:border-primary/40 rounded-lg transition-all group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                            {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm text-zinc-200 group-hover:text-primary transition-colors truncate">
                                {post.title}
                            </div>
                            <div className="text-[10px] text-zinc-600 font-mono mt-0.5">
                                {post.readingTime} min read
                            </div>
                        </div>
                        <ChevronRight size={14} className="text-zinc-700 group-hover:text-primary shrink-0" />
                    </Link>
                ))}
            </div>
        </div>
    </motion.div>
);

/* ── Main PostGrid ── */
export const PostGrid = ({ posts }: { posts: BlogPost[] }) => {
    const { activeCategory, activeTags, activeSeries, searchQuery, setCategory, toggleTag, setSeries, setSearch, clearFilters } = useLabStore();
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

    const seriesData = useMemo(() =>
        SERIES_CONFIG.map(s => ({
            ...s,
            posts: getSeriesPosts(posts, s.id),
        })).filter(s => s.posts.length > 0),
    [posts]);

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
        if (activeSeries) {
            const series = SERIES_CONFIG.find(s => s.id === activeSeries);
            if (series) {
                return posts
                    .filter(p => series.pattern.test(p.slug))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            }
        }

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
    }, [posts, activeCategory, activeTags, activeSeries, searchQuery]);

    const visible = activeSeries ? filtered : filtered.slice(0, visibleCount);
    const hasMore = !activeSeries && visibleCount < filtered.length;
    const hasFilters = activeCategory !== 'all' || activeTags.length > 0 || searchQuery !== '' || activeSeries !== null;

    return (
        <div className="space-y-8">
            {/* Series Cards */}
            {seriesData.length > 0 && (
                <div>
                    <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">
                        📚 Learning Paths
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {seriesData.map(s => (
                            <SeriesCard
                                key={s.id}
                                series={s}
                                posts={s.posts}
                                isActive={activeSeries === s.id}
                                onClick={() => setSeries(s.id)}
                            />
                        ))}
                    </div>

                    {/* Expanded series list */}
                    <AnimatePresence>
                        {activeSeries && (() => {
                            const s = seriesData.find(s => s.id === activeSeries);
                            return s ? <SeriesList posts={s.posts} seriesName={s.name} /> : null;
                        })()}
                    </AnimatePresence>
                </div>
            )}

            {/* Divider */}
            {!activeSeries && (
                <>
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-zinc-800/50" />
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">All Posts</span>
                        <div className="h-px flex-1 bg-zinc-800/50" />
                    </div>

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
                </>
            )}

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
            {!activeSeries && (
                <>
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
                </>
            )}
        </div>
    );
};
