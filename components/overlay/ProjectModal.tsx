'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/hooks/useStore';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Image from 'next/image';
import { Project } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import { getAssetPath } from '@/lib/utils';

const GalleryContent = ({ project, closeModal }: { project: Project; closeModal: () => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Logic: Nếu có mảng gallery thì dùng, không thì tạo mảng 1 phần tử từ src chính
    const slides = project.gallery && project.gallery.length > 0 
        ? project.gallery 
        : [{ type: project.type, src: project.src }];
        
    const currentSlide = slides[currentIndex];

    // Helper check định dạng file
    const isImageFile = (src: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(src);
    const isVideoFile = (src: string) => /\.(mp4|webm|ogg)$/i.test(src);

    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        if (url.includes('vimeo.com')) {
            const id = url.split('/').pop();
            return `https://player.vimeo.com/video/${id}?autoplay=1&loop=1&muted=1`;
        }
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const id = url.split('/shorts/')[1] || url.split('v=')[1] || url.split('/').pop();
            return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
        }
        return url;
    };

    const nextSlide = useCallback(() => setCurrentIndex((prev) => (prev + 1) % slides.length), [slides.length]);
    const prevSlide = useCallback(() => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1)), [slides.length]);

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

    const renderContent = () => {
        const src = currentSlide.src;
        // Ưu tiên check loại file dựa trên đuôi mở rộng trước, sau đó mới check type khai báo
        
        // 1. Raw HTML (Iframe string từ Feed)
        if (src.includes('<iframe') || src.includes('<blockquote') || src.includes('<div')) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900 overflow-hidden relative">
                    <div 
                        className="w-full h-full flex items-center justify-center p-0 md:p-4 pointer-events-auto overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: src }} 
                    />
                </div>
            );
        }

        // 2. Local Video File (.mp4, .webm) -> Dùng thẻ Video native
        if (isVideoFile(src)) {
            return (
                <div className="w-full h-full bg-black flex items-center justify-center">
                    <video 
                        src={getAssetPath(src)} 
                        className="w-full h-full object-contain" 
                        controls 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                    />
                </div>
            );
        }

        // 3. Online Video Embed (Youtube/Vimeo) -> Dùng Iframe
        if ((currentSlide.type === 'video' && src.startsWith('http')) || src.includes('youtube') || src.includes('vimeo')) {
            return (
                <iframe
                    src={getEmbedUrl(src)}
                    className="w-full h-full pointer-events-auto bg-black"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            );
        }

        // 4. Website URL -> Dùng Iframe
        if (currentSlide.type === 'web' && src.startsWith('http')) {
            return (
                <iframe
                    src={src}
                    className="w-full h-full pointer-events-auto bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    loading="lazy"
                />
            );
        }

        // 5. Mặc định: Image
        return (
            <Image 
                src={getAssetPath(src)} 
                alt="" 
                fill 
                className={src.includes('/logos/') ? "object-contain p-12" : "object-cover"} 
                priority 
                unoptimized 
            />
        );
    };

    return (
        <div className="w-full lg:w-[65%] bg-black relative aspect-square lg:aspect-auto group overflow-hidden bg-zinc-950 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 w-full h-full"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
            
            {/* Navigation Buttons (Chỉ hiện khi có > 1 slide) */}
            {slides.length > 1 && (
                <>
                    <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-primary text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110 border border-white/10">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-primary text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110 border border-white/10">
                        <ChevronRight size={24} />
                    </button>
                    
                    {/* Pagination Dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {slides.map((_, idx) => (
                            <button 
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-primary w-8' : 'bg-white/30 w-1.5 hover:bg-white/60'}`} 
                            />
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
                        className="fixed inset-0 bg-[#050505]/95 backdrop-blur-md z-50 cursor-pointer"
                    />
                    
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 pointer-events-none">
                        <motion.div
                            layoutId={`card-${selectedProject.id}`}
                            className="pointer-events-auto bg-[#0A0A0A] border border-zinc-800 w-full max-w-6xl h-[90vh] lg:h-[85vh] overflow-hidden rounded-xl shadow-2xl flex flex-col lg:flex-row"
                        >
                            <GalleryContent key={selectedProject.id} project={selectedProject} closeModal={closeModal} />

                            <div className="w-full lg:w-[35%] flex flex-col bg-zinc-900/50 h-full">
                                <div className="p-6 pb-4 flex justify-between items-start border-b border-zinc-800/50 bg-zinc-900/80">
                                    <div>
                                        <motion.h3 className="text-xl font-bold text-white mb-2 leading-tight">{selectedProject.title}</motion.h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProject.tags.map((tag) => (
                                                <Badge key={tag} className="bg-primary/5 border-primary/20 text-primary/80">{tag}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                    <div className="prose prose-invert prose-sm text-zinc-400 leading-relaxed">
                                        {selectedProject.description}
                                    </div>
                                </div>

                                {selectedProject.url && (
                                    <div className="p-6 pt-4 border-t border-zinc-800/50 bg-black/20">
                                        <a
                                            href={selectedProject.url}
                                            target="_blank"
                                            className="flex items-center justify-center gap-2 bg-primary text-black font-bold py-3 rounded hover:bg-white transition-colors uppercase text-xs tracking-widest shadow-lg shadow-primary/10"
                                        >
                                            <ExternalLink size={16} /> Open Resource
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};