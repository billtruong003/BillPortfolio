'use client';
import { useState, useRef, useEffect, forwardRef } from 'react';
import { resumeData } from '@/data/resume';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { SciFiLoadBtn } from '@/components/ui/SciFiLoadBtn';
import { Loader2 } from 'lucide-react';

const INITIAL_COUNT = 6;
const LOAD_INCREMENT = 4;

// FIX LỖI REF: Dùng forwardRef để Framer Motion có thể tương tác với DOM element
const FeedItem = forwardRef<HTMLDivElement, { html: string; index: number }>(({ html, index }, ref) => {
    // Logic: Chỉ bắt đầu render iframe khi item này vào viewport
    const localRef = useRef(null);
    const isInView = useInView(localRef, { once: true, margin: "100px" });
    const [shouldLoad, setShouldLoad] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isInView) {
            // OPTIMIZATION: Delay loading dựa theo index.
            // Ví dụ: Item 0 load ngay, Item 1 load sau 300ms, Item 2 load sau 600ms...
            // Giúp browser không bị "nghẹn" request mạng.
            const timeout = setTimeout(() => {
                setShouldLoad(true);
            }, (index % 3) * 300); // Reset delay mỗi 3 items để user không phải chờ quá lâu

            return () => clearTimeout(timeout);
        }
    }, [isInView, index]);

    return (
        <motion.div
            ref={ref} // Ref từ forwardRef (cho Framer Motion)
            layout
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="break-inside-avoid mb-6 bg-zinc-900/40 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-primary/30 transition-all shadow-lg relative min-h-[350px]"
        >
            {/* Div rỗng này dùng để check InView, tránh xung đột ref */}
            <div ref={localRef} className="absolute top-0 w-full h-full pointer-events-none" />

            {/* Skeleton Loading State */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-primary/40" size={24} />
                        <span className="text-[10px] font-mono text-zinc-600 animate-pulse tracking-widest">
                            DECRYPTING_SIGNAL...
                        </span>
                    </div>
                </div>
            )}
            
            {/* Chỉ render HTML thật sự khi đã đến lượt (shouldLoad = true) */}
            {shouldLoad ? (
                <div 
                    className={`transition-opacity duration-700 w-full ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    dangerouslySetInnerHTML={{ __html: html }}
                    onLoadCapture={() => setIsLoaded(true)} 
                />
            ) : null}

            {/* Fallback an toàn: Nếu iframe bị chặn hoặc load quá lâu, tự động tắt loading sau 3s */}
            {shouldLoad && !isLoaded && (
                <motion.div 
                    onViewportEnter={() => setTimeout(() => setIsLoaded(true), 3000)} 
                    className="absolute w-px h-px opacity-0"
                />
            )}
        </motion.div>
    );
});

// Bắt buộc đặt displayName khi dùng forwardRef để tránh warning của React
FeedItem.displayName = 'FeedItem';

export const Feed = () => {
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

    if (!resumeData.feed || resumeData.feed.length === 0) return null;

    const visibleFeed = resumeData.feed.slice(0, visibleCount);
    const hasMore = visibleCount < resumeData.feed.length;

    const handleLoadMore = () => {
        setVisibleCount(prev => Math.min(prev + LOAD_INCREMENT, resumeData.feed.length));
    };

    return (
        <section className="py-24 px-6 container mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-4">
                        <span className="text-primary font-mono">04.</span> 
                        <span className="text-zinc-100">Social Transmissions</span>
                    </h2>
                    <p className="text-zinc-500 text-sm mt-2 max-w-lg font-light">
                        Archived communications from external networks.
                    </p>
                </div>
                
                <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[10px] text-zinc-400">
                        DISPLAYING: [{visibleFeed.length}/{resumeData.feed.length}]
                    </span>
                </div>
            </div>

            {/* Layout Masonry sử dụng CSS Columns */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {/* FIX LỖI ANIMATE PRESENCE: Dùng mode='popLayout' cho list items thay vì 'wait' */}
                <AnimatePresence mode='popLayout'>
                    {visibleFeed.map((embedHtml, idx) => (
                        <FeedItem key={`feed-${idx}`} html={embedHtml} index={idx} />
                    ))}
                </AnimatePresence>
            </div>

            {hasMore && (
                <div className="pt-10 relative z-10 flex justify-center">
                     <div className="absolute inset-x-0 -top-20 h-20 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
                     <SciFiLoadBtn onClick={handleLoadMore} label="LOAD_ARCHIVED_LOGS" />
                </div>
            )}
        </section>
    );
};