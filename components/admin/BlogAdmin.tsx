"use client";

import { postManifest } from "@/data/posts";
import { FlaskConical, Eye, Clock, ExternalLink, FileText } from "lucide-react";

export const BlogAdmin = () => {
    const posts = postManifest.posts;

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <FlaskConical size={20} className="text-violet-400" />
                    <h2 className="text-xl font-bold font-mono">Lab Posts</h2>
                    <span className="text-xs font-mono bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded border border-violet-500/20">
                        {posts.length}
                    </span>
                </div>
                <a
                    href="/lab"
                    target="_blank"
                    className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-violet-400 transition-colors"
                >
                    View Lab <ExternalLink size={12} />
                </a>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-8 text-zinc-600 font-mono text-sm border border-dashed border-zinc-800 rounded-lg">
                    No posts yet. Run: node scripts/new-post.mjs &quot;Title&quot;
                </div>
            ) : (
                <div className="space-y-3">
                    {posts.map((post) => (
                        <div
                            key={post.slug}
                            className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-white/5 rounded-lg hover:border-violet-500/30 transition-colors group"
                        >
                            <div className="p-2 bg-zinc-800 rounded-lg shrink-0">
                                <FileText size={16} className="text-zinc-500 group-hover:text-violet-400 transition-colors" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-zinc-200 truncate">{post.title}</span>
                                    {post.featured && (
                                        <span className="text-[9px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-mono">FEATURED</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-600">
                                    <span>{post.date}</span>
                                    <span className="text-violet-400/60">{post.category}</span>
                                    <span className="flex items-center gap-1"><Clock size={9} /> {post.readingTime}m</span>
                                    <span>{post.tags.length} tags</span>
                                </div>
                            </div>

                            <a
                                href={`/lab/${post.slug}`}
                                target="_blank"
                                className="p-2 text-zinc-600 hover:text-violet-400 transition-colors shrink-0"
                            >
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 p-3 bg-zinc-900/30 border border-zinc-800/50 rounded text-[10px] font-mono text-zinc-600">
                Tip: Add new posts via <span className="text-violet-400">node scripts/new-post.mjs &quot;Title&quot;</span> then rebuild.
            </div>
        </section>
    );
};
