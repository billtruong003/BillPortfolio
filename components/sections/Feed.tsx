'use client';
import { resumeData } from '@/data/resume';

export const Feed = () => {
    // Clean Code: Return null ngay lập tức nếu không có dữ liệu, tránh render section rỗng hoặc gây crash
    if (!resumeData.feed || resumeData.feed.length === 0) return null;

    return (
        <section className="py-32 px-6 container mx-auto">
            <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
                <span className="text-primary font-mono">04.</span> 
                <span className="text-zinc-100">Social Feed</span>
            </h2>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {resumeData.feed.map((embedHtml, idx) => (
                    <div 
                        key={idx}
                        className="break-inside-avoid bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
                        dangerouslySetInnerHTML={{ __html: embedHtml }} 
                    />
                ))}
            </div>
        </section>
    );
};