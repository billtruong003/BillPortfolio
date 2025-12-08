// components/sections/Hero.tsx
'use client';
import { motion } from 'framer-motion';
import { GlitchText } from '@/components/ui/GlitchText';
import { resumeData } from '@/data/resume';
import { Github, Linkedin, Mail, ArrowDown, LucideIcon, ExternalLink } from 'lucide-react';

// Định nghĩa kiểu chính xác cho map icon
const SOCIAL_ICONS: Record<string, LucideIcon> = {
    github: Github,
    linkedin: Linkedin,
    email: Mail
};

export const Hero = () => {
    return (
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 relative overflow-hidden">
            <motion.div 
                initial="hidden" 
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                className="max-w-5xl mx-auto w-full z-10"
            >
                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                    <span className="font-mono text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
                        {"// System_Ready"}
                    </span>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-6 text-white mix-blend-difference">
                        <GlitchText text={resumeData.profile.name.toUpperCase()} />
                    </h1>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
                    <h2 className="text-xl md:text-3xl text-zinc-400 font-light mb-8 flex items-center gap-3">
                        {resumeData.profile.title}
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#FFB84D]" />
                    </h2>
                </motion.div>

                <motion.p 
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    className="max-w-xl text-zinc-500 text-lg leading-relaxed mb-12 border-l border-white/10 pl-6 backdrop-blur-sm"
                >
                    {resumeData.profile.about}
                </motion.p>

                <motion.div 
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                    className="flex flex-wrap gap-4"
                >
                    {resumeData.socials.slice(0, 4).map((social) => {
                        const Icon = SOCIAL_ICONS[social.platform] || ExternalLink;
                        return (
                            <a
                                key={social.platform}
                                href={social.url}
                                target="_blank"
                                className="group relative px-6 py-3 bg-white/5 border border-white/10 overflow-hidden rounded-sm transition-colors hover:border-primary/50"
                            >
                                <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <div className="relative flex items-center gap-2 text-zinc-300 group-hover:text-primary">
                                    <Icon size={18} />
                                    <span className="font-mono text-xs uppercase tracking-wider">{social.platform}</span>
                                </div>
                            </a>
                        );
                    })}
                </motion.div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 text-zinc-600 animate-bounce"
            >
                <ArrowDown size={20} />
            </motion.div>
        </section>
    );
};