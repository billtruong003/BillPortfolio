// components/sections/Feed.tsx
'use client';
import { resumeData } from '@/data/resume';

export const Feed = () => {
    return (
        <section className="py-32 px-6 container mx-auto">
            <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
                <span className="text-primary font-mono">03.</span> Social Feed
            </h2>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {resumeData.feed.map((embedHtml, idx) => (
                    <div 
                        key={idx}
                        className="break-inside-avoid bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors"
                        dangerouslySetInnerHTML={{ __html: embedHtml }} 
                    />
                ))}
            </div>
        </section>
    );
};