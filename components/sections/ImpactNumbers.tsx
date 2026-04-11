'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, Rocket, GitBranch, Layers } from 'lucide-react';

const CHANNEL_IDS = ['UCdRe_4FG7JhOERlfcyeNhnw', 'UCodHIrwfVJfHen6ljDfFbzA', 'UC9E61azlbreSfShsGuSSDnw'];

function formatViews(n: number): string {
    if (n >= 1_000_000) {
        const val = n / 1_000_000;
        return val % 1 === 0 ? `${val}M` : `${val.toFixed(1)}M`;
    }
    if (n >= 1_000) {
        const val = n / 1_000;
        return val % 1 === 0 ? `${val}K` : `${val.toFixed(1)}K`;
    }
    return n.toString();
}

export const ImpactNumbers = () => {
    const [totalViews, setTotalViews] = useState<string | null>(null);

    const fetchViews = useCallback(async () => {
        try {
            const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
            if (!apiKey) return;

            const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_IDS.join(',')}&key=${apiKey}`;
            const res = await fetch(url);
            if (!res.ok) return;

            const data = await res.json();
            const total = (data.items || []).reduce(
                (sum: number, item: any) => sum + parseInt(item.statistics.viewCount || '0', 10),
                0
            );
            if (total > 0) setTotalViews(formatViews(total));
        } catch { /* silent */ }
    }, []);

    useEffect(() => { fetchViews(); }, [fetchViews]);

    const stats = [
        { value: totalViews || '—', label: 'YouTube Views', sub: 'Across 3 Channels', icon: Eye },
        { value: '8+', label: 'Open Source', sub: 'GitHub Repositories', icon: GitBranch },
        { value: '6', label: 'Shipped Titles', sub: 'Mobile · VR · WebGL', icon: Rocket },
        { value: '3-in-1', label: 'Code · Shaders · Tools', sub: 'Rare Skill Combo', icon: Layers },
    ];

    return (
        <section className="relative z-20 py-10 border-y border-white/5 bg-black/60 backdrop-blur-md">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group text-center py-4 px-2 rounded-xl border border-transparent hover:border-primary/20 hover:bg-white/[0.02] transition-all duration-300"
                        >
                            <div className="flex justify-center mb-3">
                                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                    <stat.icon size={16} className="text-primary" />
                                </div>
                            </div>
                            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-primary mb-1 font-mono tracking-tighter leading-none">
                                {stat.value}
                            </div>
                            <div className="text-xs md:text-sm font-bold text-zinc-200 uppercase tracking-wider mb-1">
                                {stat.label}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                                {stat.sub}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
