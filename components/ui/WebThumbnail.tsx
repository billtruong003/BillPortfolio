'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Globe, AlertTriangle } from 'lucide-react';

interface WebThumbnailProps {
    url: string;
    fallbackImage?: string; // Cho phép truyền ảnh dự phòng nếu web chưa live
}

export const WebThumbnail = ({ url, fallbackImage }: WebThumbnailProps) => {
    const [error, setError] = useState(false);
    
    if (!url) return null;

    // Sử dụng Microlink API để chụp ảnh web
    const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1280&viewport.height=720`;

    // Nếu lỗi load từ Microlink
    if (error) {
        // Nếu có ảnh fallback (ví dụ og-image.png) thì hiển thị
        if (fallbackImage && fallbackImage !== url && !fallbackImage.includes('http')) {
             return (
                <div className="relative w-full h-full bg-zinc-900">
                    <Image 
                         src={fallbackImage}
                         alt="Fallback"
                         fill
                         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                         className="object-cover"
                    />
                </div>
             );
        }

        // Nếu không thì hiển thị Icon báo lỗi nhẹ nhàng
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
                // FIX: Thêm sizes
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                onError={() => setError(true)}
                unoptimized // Bắt buộc với API bên ngoài
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            
            {/* Loading Indicator (Ẩn khi load xong - NextJS Image tự xử lý, nhưng ta thêm bg để đỡ chớp) */}
            <div className="absolute inset-0 -z-10 bg-zinc-800 animate-pulse" />
        </div>
    );
};