"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Youtube, Eye, Users, Video, ExternalLink, Loader2, Gamepad2, Code2 } from "lucide-react";
import { fetchYouTubeStats } from "@/app/actions/youtube";

interface ChannelStats {
    title: string;
    customUrl: string;
    thumbnail: string;
    subscriberCount: string;
    viewCount: string;
    videoCount: string;
    description: string;
}

interface ChannelConfig {
    id: string;
    handle: string;
    fallbackTitle: string;
    icon: React.ReactNode;
    accent: string;
    accentBg: string;
    label: string;
}

const CHANNELS: ChannelConfig[] = [
    {
        id: "UCdRe_4FG7JhOERlfcyeNhnw",
        handle: "@BillTheDev",
        fallbackTitle: "Bill The Dev",
        icon: <Code2 size={16} />,
        accent: "text-primary",
        accentBg: "bg-primary/10 border-primary/30",
        label: "Unity Dev & Shader Tutorials",
    },
    {
        id: "UCodHIrwfVJfHen6ljDfFbzA",
        handle: "@BillVRGamer",
        fallbackTitle: "Bill VR Gamer",
        icon: <Gamepad2 size={16} />,
        accent: "text-red-400",
        accentBg: "bg-red-500/10 border-red-500/30",
        label: "VR Gaming & Reviews",
    },
];

const formatCount = (num: string | number): string => {
    const n = typeof num === "string" ? parseInt(num, 10) : num;
    if (isNaN(n)) return "—";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return n.toString();
};

const StatBox = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) => (
    <div className="flex flex-col items-center gap-1 py-2 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
        <div className={`${accent} opacity-60`}>{icon}</div>
        <span className="text-sm font-bold text-white tabular-nums">{value}</span>
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{label}</span>
    </div>
);

const ChannelCard = ({ config, stats, loading }: { config: ChannelConfig; stats: ChannelStats | null; loading: boolean }) => {
    const url = `https://www.youtube.com/${config.handle}`;

    return (
        <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="group relative flex flex-col bg-zinc-900/60 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl"
        >
            <div className={`h-20 relative overflow-hidden ${config.accent === "text-primary" ? "bg-gradient-to-r from-amber-900/40 to-orange-900/20" : "bg-gradient-to-r from-red-900/40 to-pink-900/20"}`}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)" }} />

                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-full backdrop-blur-sm border border-white/10">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                    <span className="text-[9px] font-mono text-zinc-300 tracking-wider">LIVE_DATA</span>
                </div>
            </div>

            <div className="relative -mt-8 px-5">
                <div className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-zinc-800 ${config.accent === "text-primary" ? "border-primary/50" : "border-red-500/50"} shadow-lg`}>
                    {stats?.thumbnail ? (
                        <img src={stats.thumbnail} alt={stats.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Youtube size={24} className="text-zinc-600" />
                        </div>
                    )}
                </div>
            </div>

            <div className="px-5 pt-3 pb-5 flex-1 flex flex-col gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-lg font-bold text-white group-hover:${config.accent} transition-colors`}>
                            {stats?.title || config.fallbackTitle}
                        </h3>
                        <ExternalLink size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono tracking-wider rounded-full border ${config.accentBg} ${config.accent}`}>
                            {config.icon}
                            {config.handle}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{config.label}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-auto pt-4 border-t border-white/5">
                    {loading ? (
                        <div className="col-span-3 flex items-center justify-center py-2">
                            <Loader2 className="animate-spin text-zinc-600" size={16} />
                            <span className="text-[10px] font-mono text-zinc-600 ml-2">FETCHING...</span>
                        </div>
                    ) : (
                        <>
                            <StatBox icon={<Users size={12} />} label="Subs" value={formatCount(stats?.subscriberCount || "0")} accent={config.accent} />
                            <StatBox icon={<Eye size={12} />} label="Views" value={formatCount(stats?.viewCount || "0")} accent={config.accent} />
                            <StatBox icon={<Video size={12} />} label="Videos" value={formatCount(stats?.videoCount || "0")} accent={config.accent} />
                        </>
                    )}
                </div>
            </div>
        </motion.a>
    );
};

export const YouTubeChannels = () => {
    const [statsMap, setStatsMap] = useState<Record<string, ChannelStats>>({});
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        try {
            const channelIds = CHANNELS.map(c => c.id);
            const items = await fetchYouTubeStats(channelIds);

            if (!items || items.length === 0) {
                setLoading(false);
                return;
            }

            const map: Record<string, ChannelStats> = {};
            for (const item of items) {
                map[item.id] = {
                    title: item.snippet.title,
                    customUrl: item.snippet.customUrl || "",
                    thumbnail: item.snippet.thumbnails?.medium?.url || "",
                    subscriberCount: item.statistics.subscriberCount || "0",
                    viewCount: item.statistics.viewCount || "0",
                    videoCount: item.statistics.videoCount || "0",
                    description: item.snippet.description || "",
                };
            }
            setStatsMap(map);
        } catch {
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    return (
        <section className="py-20 px-6 border-y border-white/5 bg-[#080808] relative z-20">
            <div className="container mx-auto max-w-4xl">
                <div className="flex flex-col items-center text-center mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <Youtube size={20} className="text-red-500" />
                        </div>
                        <span className="font-mono text-red-400 text-xs tracking-[0.4em] uppercase">Content Channels</span>
                    </div>
                    <h2 className="text-3xl font-bold text-zinc-100 mb-2">
                        YouTube <span className="text-red-400">Presence</span>
                    </h2>
                    <p className="text-zinc-500 text-sm max-w-md">
                        Real-time stats from my channels. Subscribe to stay updated on dev content and VR gaming.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {CHANNELS.map((config) => (
                        <ChannelCard
                            key={config.id}
                            config={config}
                            stats={statsMap[config.id] || null}
                            loading={loading}
                        />
                    ))}
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-700">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500/50 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500/50"></span>
                    </span>
                    DATA_REFRESHES_EVERY_5_MIN • SECURE_SERVER_ACTION
                </div>
            </div>
        </section>
    );
};