'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/hooks/useStore';
import { X, ExternalLink, Github, ChevronLeft, ChevronRight, Maximize2, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Image from 'next/image';
import { Project } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import { getAssetPath } from '@/lib/utils';

const GalleryContent = ({ project, closeModal }: { project: Project; closeModal: () => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slides = project.gallery ?? [{ type: project.type, src: project.src }];
    const currentSlide = slides[currentIndex];

    // Helper kiểm tra file ảnh
    const isImageFile = (src: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(src);

    const getEmbedUrl = (url: string) => {
        if (url.includes('vimeo.com')) {
            const id = url.split('/').pop();
            return `https://player.vimeo.com/video/${id}?autoplay=1&loop=1&muted=1`;
        }
        if (url.includes('tiktok.com')) return url;
        if (url.includes('youtube.com/shorts') || url.includes('youtu.be')) {
            const id = url.split('/shorts/')[1] || url.split('/').pop();
            return `https://www.youtube.com/embed/${id}`;
        }
        return url;
    };

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }, [slides.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
            if (slides.length > 1) {
                if (e.key === 'ArrowRight') nextSlide();
                if (e.key === 'ArrowLeft') prevSlide();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closeModal, nextSlide, prevSlide, slides.length]);

    // Logic Render nội dung:
    // 1. Nếu type là video VÀ src là link online -> Iframe
    // 2. Nếu type là web -> Iframe Web
    // 3. Còn lại (Ảnh, hoặc Video type nhưng src là ảnh local) -> Render Image Component
    const renderContent = () => {
        if (currentSlide.type === 'video' && !isImageFile(currentSlide.src) && currentSlide.src.startsWith('http')) {
            return (
                <iframe
                    src={getEmbedUrl(currentSlide.src)}
                    className="w-full h-full pointer-events-auto"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            );
        }

        if (currentSlide.type === 'web') {
            return (
                <iframe
                    src={currentSlide.src}
                    className="w-full h-full pointer-events-auto bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    loading="lazy"
                />
            );
        }

        // Fallback về Image cho mọi trường hợp còn lại (bao gồm local image được gắn mác video)
        return (
            <Image 
                src={getAssetPath(currentSlide.src)} 
                alt="" 
                fill 
                className="object-contain" 
                priority 
            />
        );
    };

    return (
        <div className="w-full lg:w-[65%] bg-black relative aspect-video lg:aspect-auto group overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex items-center justify-center bg-zinc-950"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
            
            {slides.length > 1 && (
                <>
                    <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-primary text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 border border-white/10 hover:scale-110">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-primary text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 border border-white/10 hover:scale-110">
                        <ChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 p-2 bg-black/40 rounded-full backdrop-blur-sm border border-white/5">
                        {slides.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-primary w-6' : 'bg-white/30 w-1.5'}`} />
                        ))}
                    </div>
                </>
            )}

            <div className="absolute top-4 right-4 z-10 opacity-50 pointer-events-none">
                <Maximize2 size={16} className="text-white/50" />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-50" />
        </div>
    );
};

export const ProjectModal = () => {
    const { selectedProject, isModalOpen, closeModal } = useStore();
    if (!selectedProject) return null;

    return (
        <AnimatePresence>
            {isModalOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                        className="fixed inset-0 bg-[#050505]/90 backdrop-blur-md z-50 cursor-pointer"
                    />
                    
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                        <motion.div
                            layoutId={`card-${selectedProject.id}`}
                            className="pointer-events-auto bg-[#0A0A0A]/95 border border-zinc-800 w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row ring-1 ring-white/10"
                        >
                            <GalleryContent key={selectedProject.id} project={selectedProject} closeModal={closeModal} />

                            <div className="w-full lg:w-[35%] flex flex-col bg-zinc-900/50 backdrop-blur-xl border-l border-zinc-800/50">
                                <div className="p-6 pb-4 flex justify-between items-start border-b border-zinc-800/50">
                                    <div>
                                        <motion.h3 className="text-2xl font-bold text-white mb-3 leading-tight">{selectedProject.title}</motion.h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProject.tags.map((tag) => (
                                                <Badge key={tag} className="bg-primary/10 border-primary/20 text-primary">{tag}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={closeModal} 
                                        className="p-2 bg-zinc-800/50 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                    <div className="prose prose-invert prose-sm text-zinc-400 leading-relaxed">
                                        {selectedProject.description}
                                    </div>
                                    
                                    <div className="mt-8 space-y-3">
                                        <div className="flex justify-between text-xs font-mono border-b border-zinc-800 pb-2">
                                            <span className="text-zinc-500">CATEGORY</span>
                                            <span className="text-zinc-300 uppercase">{selectedProject.category}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-mono border-b border-zinc-800 pb-2">
                                            <span className="text-zinc-500">TYPE</span>
                                            <span className="text-zinc-300 uppercase">{selectedProject.type}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 pt-4 border-t border-zinc-800/50 bg-black/20 flex flex-col gap-3">
                                    <a
                                        href={selectedProject.url}
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 bg-primary text-black font-bold py-3 rounded-lg hover:bg-white transition-colors uppercase text-sm tracking-wider shadow-[0_0_20px_rgba(255,184,77,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                                    >
                                        {selectedProject.type === 'web' ? <Globe size={18} /> : <ExternalLink size={18} />} 
                                        {selectedProject.type === 'web' ? 'Visit Website' : 'Open Project'}
                                    </a>
                                    {selectedProject.url.includes('github') && (
                                        <a href={selectedProject.url} target="_blank" className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg transition-colors text-sm font-medium">
                                            <Github size={18} /> View Source
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};