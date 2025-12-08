'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/hooks/useStore';
import { X, ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Image from 'next/image';
import { Project } from '@/types';
import { useState } from 'react';

const GalleryContent = ({ project }: { project: Project }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = project.gallery ?? [{ type: project.type, src: project.src }];
    const currentSlide = slides[currentIndex];

    // Auto convert Vimeo, TikTok, YouTube shorts → proper embed
    const getEmbedUrl = (url: string) => {
        if (url.includes('vimeo.com')) {
            const id = url.split('/').pop();
            return `https://player.vimeo.com/video/${id}?autoplay=1&loop=1&muted=1`;
        }
        if (url.includes('tiktok.com')) {
            return url.includes('embed') ? url : url.replace('tiktok.com', 'tiktok.com/embed/v2').split('?')[0];
        }
        if (url.includes('youtube.com/shorts') || url.includes('youtu.be')) {
            const id = url.split('/shorts/')[1] || url.split('/').pop();
            return `https://www.youtube.com/embed/${id}`;
        }
        return url; // already embed-ready
    };

    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    return (
        <div className="w-full md:w-2/3 bg-black relative aspect-video md:aspect-auto group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-zinc-900"
                >
                    {currentSlide.type === 'video' ? (
                        <iframe
                            src={getEmbedUrl(currentSlide.src)}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <Image src={currentSlide.src} alt="" fill className="object-contain" priority />
                    )}
                </motion.div>
            </AnimatePresence>

            {slides.length > 1 && (
                <>
                    <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-primary text-white rounded-full backdrop-blur opacity-0 group-hover:opacity-100 transition z-10">
                        <ChevronLeft size={28} />
                    </button>
                    <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-primary text-white rounded-full backdrop-blur opacity-0 group-hover:opacity-100 transition z-10">
                        <ChevronRight size={28} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {slides.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-primary w-8' : 'bg-white/40'}`} />
                        ))}
                    </div>
                </>
            )}
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
                        className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 cursor-pointer"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            layoutId={`card-${selectedProject.id}`}
                            className="bg-[#0A0A0A] border border-zinc-800 w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-xl shadow-2xl flex flex-col md:flex-row pointer-events-auto"
                        >
                            <GalleryContent key={selectedProject.id} project={selectedProject} />
                            <div className="w-full md:w-1/3 p-8 flex flex-col bg-gradient-to-b from-[#0F0F0F] to-[#0A0A0A] border-l border-zinc-800">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <motion.h3 className="text-2xl md:text-3xl font-bold mb-3">{selectedProject.title}</motion.h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProject.tags.map((tag) => (
                                                <Badge key={tag}>{tag}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={closeModal} className="p-2 hover:bg-zinc-800 rounded-full transition">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="prose prose-invert text-zinc-400 text-sm leading-relaxed flex-1 overflow-y-auto pr-2">
                                    {selectedProject.description}
                                </div>

                                <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-zinc-800">
                                    <a
                                        href={selectedProject.url}
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 bg-primary hover:bg-white text-black font-bold py-3.5 rounded uppercase tracking-wider transition"
                                    >
                                        <ExternalLink size={18} /> View Project
                                    </a>
                                    {selectedProject.url.includes('github') && (
                                        <a href={selectedProject.url} target="_blank" className="flex items-center justify-center gap-2 border border-zinc-700 hover:border-primary py-3 rounded transition">
                                            <Github size={20} /> Source Code
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