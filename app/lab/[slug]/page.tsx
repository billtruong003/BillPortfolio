import { postManifest } from '@/data/posts';
import { PostHeader } from '@/components/lab/PostHeader';
import { PostBody } from '@/components/lab/PostBody';
import { TableOfContents } from '@/components/lab/TableOfContents';
import { ScrollTracker } from '@/components/lab/ScrollTracker';
import { LabNav } from '@/components/lab/LabNav';
import { getSeriesNav } from '@/lib/series';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
    return postManifest.posts.map(post => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
    const post = postManifest.posts.find(p => p.slug === params.slug);
    if (!post) return { title: 'Post Not Found' };
    return {
        title: `${post.title} | Bill The Dev Lab`,
        description: post.excerpt,
    };
}

export default function PostPage({ params }: { params: { slug: string } }) {
    const postIndex = postManifest.posts.findIndex(p => p.slug === params.slug);
    const post = postManifest.posts[postIndex];

    if (!post) notFound();

    const seriesNav = getSeriesNav(postManifest.posts, params.slug);

    // Fallback to generic prev/next if not in a series
    const prevPost = seriesNav?.prev
        ?? (postIndex < postManifest.posts.length - 1 ? postManifest.posts[postIndex + 1] : null);
    const nextPost = seriesNav?.next
        ?? (postIndex > 0 ? postManifest.posts[postIndex - 1] : null);

    return (
        <main className="relative min-h-screen w-full bg-[#050505]">
            <LabNav postTitle={post.title} />

            <div className="relative z-10 pt-16 pb-16 px-6">
                <div className="container mx-auto max-w-5xl">
                    <PostHeader post={post} />

                    {/* Series progress bar */}
                    {seriesNav && (
                        <div className="mb-8 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                                    <BookOpen size={12} />
                                    {seriesNav.series.icon} {seriesNav.series.name}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500">
                                    {seriesNav.position} / {seriesNav.total}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                {seriesNav.posts.map((p, i) => (
                                    <Link
                                        key={p.slug}
                                        href={`/lab/${p.slug}`}
                                        title={p.title}
                                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                                            i < seriesNav.currentIndex
                                                ? 'bg-primary/60'
                                                : i === seriesNav.currentIndex
                                                    ? 'bg-primary'
                                                    : 'bg-zinc-700 hover:bg-zinc-600'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-12">
                        <div className="flex-1 min-w-0">
                            <PostBody html={post.body} />
                        </div>

                        <aside className="hidden lg:block w-56 shrink-0">
                            <TableOfContents headings={post.headings} />
                        </aside>
                    </div>

                    {/* Navigation */}
                    <nav className="mt-16 pt-8 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {prevPost ? (
                            <Link
                                href={`/lab/${prevPost.slug}`}
                                className="group flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 hover:border-primary/50 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={16} className="text-zinc-500 group-hover:text-primary shrink-0" />
                                <div className="min-w-0">
                                    <div className="text-[10px] font-mono text-zinc-600 uppercase">
                                        {seriesNav ? `← Bài ${seriesNav.currentIndex}` : 'Previous'}
                                    </div>
                                    <div className="text-sm text-zinc-300 group-hover:text-primary truncate">{prevPost.title}</div>
                                </div>
                            </Link>
                        ) : <div />}
                        {nextPost ? (
                            <Link
                                href={`/lab/${nextPost.slug}`}
                                className="group flex items-center justify-end gap-3 p-4 bg-zinc-900/50 border border-zinc-800 hover:border-primary/50 rounded-lg transition-colors text-right"
                            >
                                <div className="min-w-0">
                                    <div className="text-[10px] font-mono text-zinc-600 uppercase">
                                        {seriesNav ? `Bài ${seriesNav.currentIndex + 2} →` : 'Next'}
                                    </div>
                                    <div className="text-sm text-zinc-300 group-hover:text-primary truncate">{nextPost.title}</div>
                                </div>
                                <ArrowRight size={16} className="text-zinc-500 group-hover:text-primary shrink-0" />
                            </Link>
                        ) : <div />}
                    </nav>
                </div>
            </div>

            <ScrollTracker slug={post.slug} readingTime={post.readingTime} />

            <footer className="relative z-10 py-12 text-center border-t border-white/5 bg-black/40 backdrop-blur-md">
                <p className="text-zinc-600 font-mono text-xs">
                    &copy; {new Date().getFullYear()} Bill The Dev. Engineered with Next.js.
                </p>
            </footer>
        </main>
    );
}
