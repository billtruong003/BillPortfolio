'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlitchText } from '@/components/ui/GlitchText';
import { DownloadBtn } from '@/components/ui/DownloadBtn';
import { resumeData } from '@/data/resume';
import { Github, Linkedin, Mail, Facebook, Youtube, Twitter, LucideIcon, ExternalLink, ChevronDown, Gamepad2, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('@/components/canvas/Hero3D').then(mod => mod.Hero3D), {
    ssr: false,
    loading: () => <div className="w-full h-full" />,
});

const SOCIAL_ICONS: Record<string, LucideIcon> = {
    github: Github,
    linkedin: Linkedin,
    youtube: Youtube,
    facebook: Facebook,
    twitter: Twitter,
    email: Mail,
};

export const Hero = () => (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen opacity-50" />
            <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] opacity-30" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full lg:w-1/2 flex flex-col justify-center"
                >
                    <div className="flex items-center gap-2 mb-8 self-start px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 motion-reduce:animate-none" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                        </span>
                        <span className="font-mono text-xs text-zinc-300">Taking on freelance projects</span>
                    </div>

                    <p className="text-zinc-400 text-xl md:text-2xl font-light tracking-wide mb-2 font-mono">Hello, I am</p>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-6 text-zinc-100">
                        <GlitchText text={resumeData.profile.name.toUpperCase()} />
                    </h1>

                    <p className="text-primary font-mono text-lg md:text-xl mb-8">{resumeData.profile.title}</p>

                    <p className="mb-10 max-w-lg pl-6 border-l-2 border-primary/50 text-zinc-300 text-base md:text-lg leading-relaxed">
                        I make games in Unity: gameplay systems, multiplayer, VR and shaders, tuned to run well on phones and Quest.
                        I also build the web apps, automation and AI agents around them.
                    </p>

                    <div className="flex flex-wrap gap-4 items-center mb-8">
                        <Link
                            href="/#contact"
                            className="inline-flex items-center gap-2 px-8 py-4 font-mono font-bold tracking-wider uppercase text-black bg-primary border border-primary hover:bg-white hover:border-white transition-colors"
                        >
                            Start a project <ArrowRight size={18} aria-hidden />
                        </Link>
                        <Link
                            href="/arcade"
                            className="inline-flex items-center gap-2 px-8 py-4 font-mono font-bold tracking-wider uppercase text-zinc-200 border border-zinc-700 hover:border-primary hover:text-primary transition-colors"
                        >
                            <Gamepad2 size={18} aria-hidden /> Play my games
                        </Link>
                        <DownloadBtn href="/Bill_Resume.pdf" text="Download CV" />
                    </div>

                    <div className="flex items-center gap-4">
                        {resumeData.socials.map((social) => {
                            const Icon = SOCIAL_ICONS[social.platform] || ExternalLink;
                            return (
                                <a
                                    key={social.platform}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${social.platform} profile`}
                                    className="text-zinc-400 hover:text-primary transition-colors"
                                >
                                    <Icon size={22} strokeWidth={1.5} />
                                </a>
                            );
                        })}
                    </div>
                </motion.div>

                {/* On phones the model is decoration only, so it must not swallow vertical swipes. */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    className="w-full lg:w-1/2 h-[40vh] min-h-[260px] lg:h-[700px] relative flex items-center justify-center pointer-events-none lg:pointer-events-auto"
                    aria-hidden
                >
                    <div className="w-full h-full scale-110 lg:scale-125">
                        <Hero3D />
                    </div>
                </motion.div>
            </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-zinc-500 z-10 pointer-events-none">
            <ChevronDown className="animate-bounce motion-reduce:animate-none" size={16} strokeWidth={1} />
        </div>
    </section>
);
