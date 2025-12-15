'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Globe } from 'lucide-react';
import { getAssetPath } from '@/lib/utils';

interface WebThumbnailProps {
    url: string;
    fallbackImage?: string;
}

export const WebThumbnail = ({ url, fallbackImage }: WebThumbnailProps) => {
    const [error, setError] = useState(false);
    
    if (!url) return null;

    const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1280&viewport.height=720`;

    if (error) {
        if (fallbackImage && fallbackImage !== url && !fallbackImage.includes('http')) {
             return (
                <div className="relative w-full h-full bg-zinc-900">
                    <Image 
                         src={getAssetPath(fallbackImage)}
                         alt="Fallback"
                         fill
                         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                         className="object-cover"
                    />
                </div>
             );
        }

        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800/50 text-zinc-600 gap-2 border-b border-zinc-700">
                <div className="p-3 bg-zinc-900 rounded-full">
                    <Globe size={24} className="opacity-50" />
                </div>
                <div className="text-center px-4">
                    <p className="text-[10px] font-mono uppercase tracking-widest opacity-70">Preview Unavailable</p>
                    <p className="text-[9px] opacity-40 truncate max-w-[150px] mx-auto mt-1">{url}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-zinc-900 group">
            <Image 
                src={screenshotUrl}
                alt={`Preview of ${url}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                onError={() => setError(true)}
                unoptimized
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            <div className="absolute inset-0 -z-10 bg-zinc-800 animate-pulse" />
        </div>
    );
};