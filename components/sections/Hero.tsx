'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlitchText } from '@/components/ui/GlitchText';
import { DownloadBtn } from '@/components/ui/DownloadBtn';
import { resumeData } from '@/data/resume';
import { 
    Github, Linkedin, Mail, Facebook, Youtube, Twitter, 
    LucideIcon, ExternalLink, ChevronDown, 
    Terminal, Cpu, Network, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('@/components/canvas/Hero3D').then(mod => mod.Hero3D), { 
    ssr: false,
    loading: () => <div className="w-full h-full min-h-[500px] flex items-center justify-center text-zinc-800 font-mono text-xs">INITIALIZING_RENDERER...</div>
});

const SOCIAL_ICONS: Record<string, LucideIcon> = {
    github: Github,
    linkedin: Linkedin,
    youtube: Youtube,
    facebook: Facebook,
    twitter: Twitter,
    email: Mail
};

const SECTIONS = [
    { id: 'main', icon: Terminal, label: 'IDENTITY', color: 'text-primary', bg: 'bg-primary' },
    { id: 'skills', icon: Cpu, label: 'CORE_SPECS', color: 'text-emerald-400', bg: 'bg-emerald-400' },
    { id: 'exp', icon: Network, label: 'RUNTIME_LOG', color: 'text-blue-400', bg: 'bg-blue-400' },
];

export const Hero = () => {
    const [activeSection, setActiveSection] = useState('main');

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen opacity-50" />
                <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] opacity-30" />
            </div>

            <div className="container mx-auto px-6 relative z-10 h-full">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0 h-full">
                    
                    <div className="w-full lg:w-1/2 flex gap-8 h-full relative order-2 lg:order-1">
                        <div className="hidden md:flex flex-col gap-6 py-8 border-r border-white/5 pr-6 z-20">
                            {SECTIONS.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className="group relative flex items-center justify-center w-10 h-10 outline-none"
                                >
                                    <div className={cn(
                                        "absolute inset-0 rounded-lg opacity-20 transition-all duration-300 group-hover:opacity-40",
                                        section.bg,
                                        activeSection === section.id ? "opacity-100 blur-[2px]" : ""
                                    )} />
                                    
                                    <div className={cn(
                                        "relative z-10 flex items-center justify-center w-full h-full bg-black/40 border rounded-lg transition-all duration-300 backdrop-blur-sm",
                                        activeSection === section.id 
                                            ? `border-${section.color.split('-')[1]} text-white` 
                                            : "border-white/10 text-zinc-600 group-hover:border-white/20 group-hover:text-zinc-400"
                                    )}>
                                        <section.icon size={18} className={cn(
                                            activeSection === section.id ? section.color : ""
                                        )} />
                                    </div>

                                    {activeSection === section.id && (
                                        <motion.div 
                                            layoutId="active-indicator"
                                            className={cn("absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full", section.bg)}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 flex flex-col justify-center min-h-[400px]">
                            <AnimatePresence mode="wait">
                                {activeSection === 'main' && <MainContent key="main" />}
                                {activeSection === 'skills' && <SkillsContent key="skills" />}
                                {activeSection === 'exp' && <ExperienceContent key="exp" />}
                            </AnimatePresence>
                        </div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.2 }}
                        className="w-full lg:w-1/2 h-[500px] lg:h-[700px] relative order-1 lg:order-2 flex items-center justify-center"
                    >
                         <div className="absolute inset-0 z-10 pointer-events-none select-none">
                            <div className="absolute top-10 right-0 font-mono text-[9px] text-zinc-500/50 flex flex-col items-end gap-1">
                                <span>COORD: 34.0522° N, 118.2437° W</span>
                                <span>ALTITUDE: 1200FT</span>
                            </div>
                        </div>
                        <div className="w-full h-full relative z-0 scale-110 lg:scale-125">
                            <Hero3D />
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500 z-10 opacity-50 mix-blend-screen pointer-events-none">
                <span className="text-[9px] font-mono tracking-[0.3em] uppercase">Scroll</span>
                <ChevronDown className="animate-bounce" size={16} strokeWidth={1} />
            </div>
        </section>
    );
};

const MainContent = () => (
    <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col justify-center"
    >
        <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="font-mono text-[10px] text-zinc-400 tracking-widest uppercase">
                    System::Ready
                </span>
            </div>
        </div>

        <h2 className="text-zinc-500 text-xl md:text-2xl font-light tracking-wide mb-2 font-mono">
            Hello, I am
        </h2>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-6 text-zinc-100 mix-blend-overlay">
            <GlitchText text={resumeData.profile.name.toUpperCase()} />
        </h1>
        
        <div className="flex items-center gap-4 mb-8">
            <span className="text-primary font-mono text-lg md:text-xl">
                {`// ${resumeData.profile.title}`}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        <div className="mb-10 max-w-lg relative pl-6 border-l-[2px] border-l-primary/50">
            <p className="text-zinc-400 text-base leading-relaxed font-light">
                {resumeData.profile.about}
            </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <DownloadBtn href="/Bill_Resume.pdf" text="Access Data" />
            
            <div className="flex items-center gap-4">
                {resumeData.socials.map((social) => {
                    const Icon = SOCIAL_ICONS[social.platform] || ExternalLink;
                    return (
                        <a
                            key={social.platform}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-primary transition-colors duration-300 transform hover:scale-110"
                        >
                            <Icon size={22} strokeWidth={1.5} />
                        </a>
                    );
                })}
            </div>
        </div>
    </motion.div>
);

const SkillsContent = () => (
    <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
    >
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <h3 className="text-2xl font-bold text-emerald-400 font-mono tracking-tight flex items-center gap-3">
                <Cpu size={24} />
                SYSTEM_CAPABILITIES
            </h3>
            <span className="text-[10px] text-zinc-600 font-mono">v.2.4.0</span>
        </div>

        <div className="space-y-8">
            <div>
                <h4 className="text-xs font-mono text-zinc-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                    <Terminal size={12} /> Languages & Core
                </h4>
                <div className="grid grid-cols-3 gap-2">
                    {(resumeData.tech_stack.languages || []).map((tech) => (
                        <div key={tech} className="bg-white/5 border border-white/5 hover:bg-emerald-900/20 p-2 rounded flex items-center justify-center text-xs font-mono text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors cursor-crosshair backdrop-blur-sm">
                            {tech}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-xs font-mono text-zinc-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                    <Network size={12} /> Frameworks & Engines
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    {(resumeData.tech_stack.frameworks || []).map((tech) => (
                        <div key={tech} className="bg-white/5 border border-white/5 hover:bg-blue-900/20 p-2 rounded flex items-center justify-between px-3 text-xs font-mono text-zinc-300 hover:border-blue-500/50 hover:text-blue-400 transition-colors cursor-crosshair group backdrop-blur-sm">
                            {tech}
                            <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full group-hover:bg-blue-400" />
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-xs font-mono text-zinc-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                    <Cpu size={12} /> Tools & Pipeline
                </h4>
                <div className="flex flex-wrap gap-2">
                    {(resumeData.tech_stack.others || []).map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-zinc-400 font-mono hover:bg-white/10 hover:text-zinc-200 transition-colors backdrop-blur-sm">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
);

const ExperienceContent = () => (
    <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
    >
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <h3 className="text-2xl font-bold text-blue-400 font-mono tracking-tight flex items-center gap-3">
                <Network size={24} />
                RUNTIME_LOGS
            </h3>
            <span className="text-[10px] text-zinc-600 font-mono">LATEST</span>
        </div>

        <div className="space-y-6 relative border-l border-white/10 ml-2 pl-6">
            {(resumeData.experience.dev || []).slice(0, 3).map((job, idx) => (
                <div key={idx} className="relative group">
                    <span className="absolute -left-[29px] top-1.5 w-3 h-3 bg-zinc-900 border border-zinc-700 rounded-full group-hover:border-blue-400 group-hover:bg-blue-400/20 transition-colors" />
                    
                    <div className="flex flex-col gap-1 mb-1">
                        <h4 className="text-zinc-200 font-bold leading-none group-hover:text-blue-400 transition-colors">
                            {job.role}
                        </h4>
                        <span className="text-xs font-mono text-primary/70">{job.company}</span>
                    </div>
                    
                    <span className="text-[10px] text-zinc-600 font-mono block mb-2">{job.period}</span>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {job.desc}
                    </p>
                    
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-400/70 font-mono cursor-pointer hover:text-blue-400">
                        <span>Read_More</span> <ChevronRight size={10} />
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
);