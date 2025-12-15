'use client';
import { motion } from 'framer-motion';
import { Project } from '@/types';
import { useStore } from '@/hooks/useStore';
import { ExternalLink, Github, PlayCircle, Image as ImageIcon, Globe, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { WebThumbnail } from './WebThumbnail';

export const ProjectCard = ({ project }: { project: Project }) => {
    const openModal = useStore((state) => state.openModal);
    const [imgError, setImgError] = useState(false);

    // Hàm lấy thumbnail từ Youtube nếu có
    const getThumbnail = (p: Project) => {
        if (p.type === 'video' && (p.src.includes('youtube') || p.src.includes('youtu.be'))) {
            try {
                let videoId = '';
                if (p.src.includes('/embed/')) {
                    videoId = p.src.split('/embed/')[1]?.split('?')[0];
                } else if (p.src.includes('v=')) {
                    videoId = p.src.split('v=')[1]?.split('&')[0];
                }
                
                if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            } catch {
                return p.src;
            }
        }
        return p.src;
    };

    const thumbnailSrc = getThumbnail(project);

    return (
        <motion.div
            layoutId={`card-${project.id}`}
            whileHover={{ y: -5 }}
            onClick={() => openModal(project)}
            className="group relative bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 rounded-xl overflow-hidden cursor-pointer backdrop-blur-sm transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-amber-500/10"
        >
            {/* IMAGE AREA */}
            <div className="w-full aspect-video relative overflow-hidden bg-zinc-800">
                
                {project.type === 'web' ? (
                    // Web Thumbnail Component (Đã fix lỗi bên dưới)
                    <WebThumbnail url={project.src} fallbackImage={project.src} />
                ) : !imgError ? (
                    // Standard Image
                    <Image
                        src={thumbnailSrc}
                        alt={project.title}
                        fill
                        // FIX: Thêm sizes prop để fix warning
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={() => setImgError(true)}
                        // Cho phép load ảnh từ mọi nguồn đã config
                        unoptimized={thumbnailSrc.includes('placehold.co')} 
                    />
                ) : (
                    // Fallback khi ảnh lỗi (404/500)
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800 text-zinc-600 gap-2">
                        <ImageIcon size={32} />
                        <span className="text-[10px] font-mono">Image Not Found</span>
                    </div>
                )}

                {/* OVERLAY HIỆU ỨNG */}
                {project.type !== 'web' && (
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                )}

                {/* ICON TYPE */}
                {project.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm group-hover:scale-110 transition-transform">
                            <PlayCircle size={32} className="text-white/90" />
                        </div>
                    </div>
                )}
                
                {project.type === 'web' && (
                    <div className="absolute top-2 left-2 z-30">
                         <div className="bg-black/60 rounded-full p-1.5 backdrop-blur-sm">
                            <Globe size={14} className="text-primary" />
                        </div>
                    </div>
                )}

                {/* CATEGORY BADGE */}
                <div className="absolute top-2 right-2 z-30">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur text-[10px] font-mono text-amber-400 rounded border border-amber-500/20 uppercase tracking-wider">
                        {project.category}
                    </span>
                </div>
            </div>

            {/* INFO AREA */}
            <div className="p-4 space-y-3 flex-1 flex flex-col bg-gradient-to-b from-transparent to-black/20">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1 text-base">
                        {project.title}
                    </h3>
                    {project.url.includes('github') ? 
                        <Github size={16} className="text-zinc-500 shrink-0 group-hover:text-zinc-300 transition-colors" /> : 
                        <ExternalLink size={16} className="text-zinc-500 shrink-0 group-hover:text-zinc-300 transition-colors" />
                    }
                </div>
                
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed flex-1">
                    {project.description}
                </p>
                
                <div className="pt-2 flex flex-wrap gap-1.5 border-t border-zinc-800/50 mt-auto">
                    {project.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-zinc-800/60 text-zinc-300 rounded border border-zinc-700/50">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};