"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Youtube, Eye, Users, Video, RefreshCw, LogOut, ExternalLink,
    Globe, Gamepad2, Code2, TrendingUp, Clock, Shield,
    Activity, BarChart3, Zap, ArrowUpRight
} from "lucide-react";
import { resumeData } from "@/data/resume";

interface ChannelData {
    id: string;
    title: string;
    handle: string;
    thumbnail: string;
    subscribers: string;
    views: string;
    videos: string;
}

interface DashboardProps {
    onLogout: () => void;
}

const formatNum = (n: string | number): string => {
    const num = typeof n === "string" ? parseInt(n, 10) : n;
    if (isNaN(num)) return "—";
    return num.toLocaleString();
};

const formatCompact = (n: string | number): string => {
    const num = typeof n === "string" ? parseInt(n, 10) : n;
    if (isNaN(num)) return "—";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
};

const CHANNEL_IDS = [
    { id: "UCdRe_4FG7JhOERlfcyeNhnw", handle: "@BillTheDev", color: "primary" },
    { id: "UCxxx_BillVRGamer", handle: "@BillVRGamer", color: "red-400" },
];

const StatCell = ({ icon, label, value, compact }: { icon: React.ReactNode; label: string; value: string; compact: string }) => (
    <div className="p-4 text-center group hover:bg-white/5 transition-colors">
        <div className="text-zinc-500 mx-auto w-fit mb-2">{icon}</div>
        <div className="text-xl font-bold text-white tabular-nums" title={value}>{compact}</div>
        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mt-1">{label}</div>
    </div>
);

const MetricCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
    <motion.div
        whileHover={{ y: -2 }}
        className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-white/20 transition-colors"
    >
        <div className={color}>{icon}</div>
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{label}</span>
    </motion.div>
);

const QuickLink = ({ href, label, desc, icon, external }: { href: string; label: string; desc: string; icon: React.ReactNode; external?: boolean }) => (
    <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="group flex items-center gap-4 p-4 bg-zinc-900/40 border border-white/5 rounded-xl hover:border-primary/30 hover:bg-white/5 transition-all"
    >
        <div className="p-2 bg-white/5 rounded-lg text-zinc-400 group-hover:text-primary transition-colors">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-zinc-200 group-hover:text-primary transition-colors">{label}</div>
            <div className="text-[10px] font-mono text-zinc-600">{desc}</div>
        </div>
        <ArrowUpRight size={14} className="text-zinc-700 group-hover:text-primary transition-colors" />
    </a>
);

export const AdminDashboard = ({ onLogout }: DashboardProps) => {
    const [channels, setChannels] = useState<ChannelData[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchYouTubeData = useCallback(async () => {
        setLoading(true);
        try {
            const ids = CHANNEL_IDS.map(c => c.id).filter(id => !id.includes("xxx"));
            const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

            if (ids.length === 0 || !apiKey) {
                setLoading(false);
                return;
            }

            const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${ids.join(",")}&key=${apiKey}`;
            const res = await fetch(url);

            if (res.ok) {
                const data = await res.json();
                const items = data.items || [];
                const parsed: ChannelData[] = items.map((item: any) => ({
                    id: item.id,
                    title: item.snippet.title,
                    handle: item.snippet.customUrl || "",
                    thumbnail: item.snippet.thumbnails?.medium?.url || "",
                    subscribers: item.statistics.subscriberCount || "0",
                    views: item.statistics.viewCount || "0",
                    videos: item.statistics.videoCount || "0",
                }));
                setChannels(parsed);
                setLastRefresh(new Date());
            }
        } catch {
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchYouTubeData();
    }, [fetchYouTubeData]);

    const portfolioStats = {
        totalProjects: resumeData.portfolio.length,
        totalCompanies: (resumeData.companies || []).length,
        totalProductions: (resumeData.productions || []).length,
        totalTestimonials: resumeData.testimonials.length,
        totalSkills: resumeData.tech_stack.languages.length + resumeData.tech_stack.frameworks.length,
        totalCerts: resumeData.certifications.length,
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3">
                    <Shield size={18} className="text-primary" />
                    <span className="font-mono text-sm text-zinc-300 tracking-widest uppercase">Mission Control</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono rounded-full border border-emerald-500/20">
                        AUTHENTICATED
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    {lastRefresh && (
                        <span className="text-[10px] font-mono text-zinc-600">
                            Last sync: {lastRefresh.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={fetchYouTubeData}
                        disabled={loading}
                        className="p-2 text-zinc-500 hover:text-primary transition-colors rounded-lg hover:bg-white/5 disabled:opacity-30"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-zinc-500 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg transition-colors"
                    >
                        <LogOut size={14} />
                        LOGOUT
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Youtube size={20} className="text-red-500" />
                        <h2 className="text-xl font-bold font-mono">YouTube Analytics</h2>
                        <span className="text-[10px] font-mono text-zinc-600">CLIENT_SYNCED</span>
                    </div>

                    {channels.length === 0 && !loading ? (
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-8 text-center">
                            <Youtube size={32} className="text-zinc-700 mx-auto mb-3" />
                            <p className="text-sm text-zinc-500 font-mono">No YouTube data available.</p>
                            <p className="text-xs text-zinc-600 mt-2">
                                Set <code className="text-primary">NEXT_PUBLIC_YOUTUBE_API_KEY</code> in Secrets
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {channels.map((channel, idx) => (
                                <motion.div
                                    key={channel.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-zinc-900/60 border border-white/10 rounded-xl overflow-hidden"
                                >
                                    <div className="flex items-center gap-4 p-5 border-b border-white/5">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                                            {channel.thumbnail ? (
                                                <img src={channel.thumbnail} alt={channel.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Youtube size={20} className="text-zinc-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-white truncate">{channel.title}</h3>
                                            <span className="text-xs font-mono text-zinc-500">{channel.handle}</span>
                                        </div>
                                        <a
                                            href={`https://www.youtube.com/${channel.handle}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>

                                    <div className="grid grid-cols-3 divide-x divide-white/5">
                                        <StatCell
                                            icon={<Users size={16} />}
                                            label="Subscribers"
                                            value={formatNum(channel.subscribers)}
                                            compact={formatCompact(channel.subscribers)}
                                        />
                                        <StatCell
                                            icon={<Eye size={16} />}
                                            label="Total Views"
                                            value={formatNum(channel.views)}
                                            compact={formatCompact(channel.views)}
                                        />
                                        <StatCell
                                            icon={<Video size={16} />}
                                            label="Videos"
                                            value={formatNum(channel.videos)}
                                            compact={formatCompact(channel.videos)}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 size={20} className="text-primary" />
                        <h2 className="text-xl font-bold font-mono">Portfolio Overview</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <MetricCard icon={<Code2 size={18} />} label="Projects" value={portfolioStats.totalProjects} color="text-primary" />
                        <MetricCard icon={<Globe size={18} />} label="Companies" value={portfolioStats.totalCompanies} color="text-blue-400" />
                        <MetricCard icon={<Zap size={18} />} label="Productions" value={portfolioStats.totalProductions} color="text-emerald-400" />
                        <MetricCard icon={<Users size={18} />} label="Testimonials" value={portfolioStats.totalTestimonials} color="text-purple-400" />
                        <MetricCard icon={<Activity size={18} />} label="Tech Stack" value={portfolioStats.totalSkills} color="text-cyan-400" />
                        <MetricCard icon={<Shield size={18} />} label="Certs" value={portfolioStats.totalCerts} color="text-amber-400" />
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Zap size={20} className="text-emerald-400" />
                        <h2 className="text-xl font-bold font-mono">Quick Actions</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <QuickLink href="/" label="View Portfolio" desc="Main public site" icon={<Globe size={18} />} />
                        <QuickLink href="/arcade" label="Game Arcade" desc="WebGL game library" icon={<Gamepad2 size={18} />} />
                        <QuickLink href="https://github.com/billtruong003" label="GitHub Profile" desc="Open source repos" icon={<Code2 size={18} />} external />
                        <QuickLink href="https://www.youtube.com/@BillTheDev" label="BillTheDev Channel" desc="Dev tutorials" icon={<Youtube size={18} />} external />
                        <QuickLink href="https://www.youtube.com/@BillVRGamer" label="BillVRGamer Channel" desc="VR gaming content" icon={<Youtube size={18} />} external />
                        <QuickLink href="https://search.google.com/search-console" label="Search Console" desc="Google indexing & SEO" icon={<TrendingUp size={18} />} external />
                    </div>
                </section>

                <div className="pt-8 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-700">
                    <span>CMD_CENTER v1.0 • CLIENT-SIDE SECURED</span>
                    <span className="flex items-center gap-2">
                        <Clock size={10} />
                        {new Date().toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </span>
                </div>
            </div>
        </div>
    );
};