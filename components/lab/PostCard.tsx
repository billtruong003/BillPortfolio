'use client';
import { motion } from 'framer-motion';
import { BlogPost } from '@/types';
import { Clock, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getAssetPath } from '@/lib/utils';

export const PostCard = ({ post }: { post: BlogPost }) => {
    return (
        <Link href={`/lab/${post.slug}`}>
            <motion.article
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group cursor-pointer bg-zinc-900/50 border border-zinc-800 hover:border-primary/50 rounded-xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-primary/5 flex flex-col h-full"
            >
                <div className="relative aspect-video bg-zinc-800 overflow-hidden">
                    {post.coverImage ? (
                        <Image
                            src={getAssetPath(post.coverImage)}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                            unoptimized
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-zinc-900 flex items-center justify-center">
                            <span className="text-4xl font-black text-primary/30 font-mono">{'</>'}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {post.featured && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-primary/90 text-black text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                            Featured
                        </div>
                    )}
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur text-[10px] font-mono text-primary rounded border border-primary/20 uppercase tracking-wider">
                        {post.category.replace('-', ' ')}
                    </div>
                </div>

                <div className="p-5 flex flex-col flex-1 gap-3">
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {post.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed flex-1">
                        {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                            <Calendar size={10} />
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                            <Clock size={10} />
                            {post.readingTime} min read
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-zinc-800/60 text-zinc-300 rounded border border-zinc-700/50">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.article>
        </Link>
    );
};
