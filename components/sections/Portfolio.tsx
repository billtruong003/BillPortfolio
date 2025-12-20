'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/hooks/useStore';
import { resumeData } from '@/data/resume';
import { PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { getYoutubeThumbnail, getAssetPath } from '@/lib/utils';
import { SciFiLoadBtn } from '@/components/ui/SciFiLoadBtn';

const INITIAL_COUNT = 6;
const LOAD_INCREMENT = 6;

export const Portfolio = () => {
    const { activeFilter, setFilter, openModal } = useStore();
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

    const filteredProjects = useMemo(() => {
        return activeFilter === 'all' 
            ? resumeData.portfolio 
            : resumeData.portfolio.filter(p => p.category === activeFilter);
    }, [activeFilter]);

    useEffect(() => {
        setVisibleCount(INITIAL_COUNT);
    }, [activeFilter]);

    const visibleProjects = filteredProjects.slice(0, visibleCount);
    const hasMore = visibleCount < filteredProjects.length;

    const handleLoadMore = () => {
        setVisibleCount(prev => Math.min(prev + LOAD_INCREMENT, filteredProjects.length));
    };

    return (
        <section id="portfolio" className="py-32 px-6 container mx-auto scroll-mt-20">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Selected <span className="text-primary">Works</span>
                    </h2>
                    <p className="text-zinc-500 max-w-md">
                        A curation of shaders, tools, and immersive experiences from the vault.
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                    {['all', 'shader', 'tool', 'game'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setFilter(filter)}
                            className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all border ${
                                activeFilter === filter 
                                ? 'border-primary text-primary bg-primary/10 shadow-[0_0_10px_rgba(255,184,77,0.2)]' 
                                : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {visibleProjects.map((project) => {
                        const isOnlineVideo = project.type === 'video' && project.src.startsWith('http');
                        const imageSrc = isOnlineVideo
                            ? getYoutubeThumbnail(project.src) 
                            : getAssetPath(project.src);

                        return (
                            <motion.div
                                layout
                                layoutId={`card-${project.id}`}
                                key={project.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => openModal(project)}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-video bg-zinc-900 border border-zinc-800 overflow-hidden rounded-sm transition-all duration-500 group-hover:border-primary/50">
                                    <Image
                                        src={imageSrc}
                                        alt={project.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />
                                    
                                    {project.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <PlayCircle className="w-12 h-12 text-primary drop-shadow-[0_0_15px_rgba(255,184,77,0.5)]" />
                                        </div>
                                    )}

                                    <div className="absolute bottom-0 left-0 p-4 w-full">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <h3 className="text-lg font-bold text-zinc-100 group-hover:text-primary transition-colors">
                                                    {project.title}
                                                </h3>
                                                <div className="flex gap-2 mt-2">
                                                    {project.tags.slice(0, 2).map(tag => (
                                                        <span key={tag} className="text-[10px] font-mono text-zinc-400">#{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {hasMore && <SciFiLoadBtn onClick={handleLoadMore} label="ACCESS_ARCHIVED_PROJECTS" />}
        </section>
    );
};