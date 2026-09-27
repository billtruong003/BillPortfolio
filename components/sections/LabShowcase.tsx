import Link from 'next/link';
import { ArrowRight, Gamepad2, BookOpen } from 'lucide-react';
import registry from '@/public/webgl-games/registry.json';
import { postManifest } from '@/data/posts';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getAssetPath } from '@/lib/utils';

const FEATURED_GAMES = ['zombie-war', 'zeno', 'spirit-war'];
const FEATURED_POSTS = ['unity-shmup-00-setup-en', 'unity-shmup-04-object-pool-en', 'unity-shmup-11-build-webgl-en'];

const webp = (src: string) => src.replace(/\.(png|jpe?g)$/i, '.webp');

const games = FEATURED_GAMES.map((id) => registry.games.find((g) => g.id === id)).filter((g) => g !== undefined);
const posts = FEATURED_POSTS.map((slug) => postManifest.posts.find((p) => p.slug === slug)).filter((p) => p !== undefined);

const CARD = 'group flex flex-col overflow-hidden bg-zinc-900/40 border border-white/10 rounded-xl hover:border-primary/40 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

export const LabShowcase = () => (
    <section id="labs" className="py-24 px-6 relative z-20 scroll-mt-20 border-t border-white/5 bg-[#080808]">
        <div className="container mx-auto max-w-6xl space-y-20">
            <div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <SectionHeading eyebrow="Game Lab" title="Games you can play right now" className="mb-8">
                        Unity WebGL builds that run in the browser. No install.
                    </SectionHeading>
                    <Link href="/arcade" className="mb-8 inline-flex items-center gap-2 text-primary hover:underline underline-offset-4">
                        <Gamepad2 size={18} aria-hidden /> All {registry.games.length} games <ArrowRight size={16} aria-hidden />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {games.map((game) => (
                        <Link key={game.id} href={`/arcade?game=${game.id}`} className={CARD}>
                            <div className="aspect-video overflow-hidden bg-zinc-900">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={getAssetPath(webp(game.thumbnail))}
                                    alt=""
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-zinc-100 group-hover:text-primary transition-colors">{game.title}</h3>
                                <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{game.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <SectionHeading eyebrow="Dev Lab" title="Build a game with me, step by step" className="mb-8">
                        Unity 6 build-along series. Every lesson ends with a build you can run, and the finished game is playable in the Game Lab.
                    </SectionHeading>
                    <Link href="/lab" className="mb-8 inline-flex items-center gap-2 text-primary hover:underline underline-offset-4">
                        <BookOpen size={18} aria-hidden /> All articles <ArrowRight size={16} aria-hidden />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <Link key={post.slug} href={`/lab/${post.slug}`} className={CARD}>
                            <div className="aspect-video overflow-hidden bg-zinc-900">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={getAssetPath(post.coverImage ?? '')}
                                    alt=""
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-zinc-100 group-hover:text-primary transition-colors">{post.title}</h3>
                                <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{post.excerpt}</p>
                                <span className="mt-auto pt-4 text-xs font-mono text-zinc-500">{post.readingTime} min read</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    </section>
);
