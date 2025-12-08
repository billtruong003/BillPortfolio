'use client';
import { motion } from 'framer-motion';
import { Project } from '@/types';
import { useStore } from '@/hooks/useStore';
import { ExternalLink, Github, PlayCircle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export const ProjectCard = ({ project }: { project: Project }) => {
    const openModal = useStore((state) => state.openModal);
    const [imgError, setImgError] = useState(false);

    const getThumbnail = (p: Project) => {
        // Logic an toàn hơn cho Youtube
        if (p.type === 'video' && (p.src.includes('youtube') || p.src.includes('youtu.be'))) {
            try {
                let videoId = '';
                if (p.src.includes('/embed/')) {
                    videoId = p.src.split('/embed/')[1]?.split('?')[0];
                } else if (p.src.includes('v=')) {
                    videoId = p.src.split('v=')[1]?.split('&')[0];
                }
                
                if (videoId) {
                    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }
            } catch (e) {
                console.error("Error parsing youtube url", e);
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
            className="group relative bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 rounded-xl overflow-hidden cursor-pointer backdrop-blur-sm transition-all duration-300 flex flex-col h-full"
        >
            {/* Thêm class aspect-video-fix để đảm bảo luôn có chiều cao */}
            <div className="w-full aspect-video relative overflow-hidden bg-zinc-800 aspect-video-fix">
                {!imgError ? (
                    <Image
                        src={thumbnailSrc}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    // Fallback khi ảnh lỗi
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-600">
                        <ImageIcon size={40} />
                    </div>
                )}

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

                {project.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm group-hover:scale-110 transition-transform">
                            <PlayCircle size={32} className="text-white/90" />
                        </div>
                    </div>
                )}

                <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur text-xs font-mono text-amber-400 rounded border border-amber-500/20">
                        {project.category}
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                        {project.title}
                    </h3>
                    {project.url.includes('github') ? <Github size={16} className="text-zinc-500 shrink-0" /> : <ExternalLink size={16} className="text-zinc-500 shrink-0" />}
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed flex-1">
                    {project.description}
                </p>
                <div className="pt-2 flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-zinc-800/80 text-zinc-300 rounded border border-zinc-700">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};