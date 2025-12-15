'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resumeData } from '@/data/resume';
import { Badge } from '@/components/ui/Badge';
import { Code2, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Experience = () => {
    const [mode, setMode] = useState<'dev' | 'teaching'>('dev');

    const data = mode === 'dev' ? resumeData.experience.dev : resumeData.experience.teaching;

    return (
        <section className="py-32 px-6">
            <div className="container mx-auto max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <h2 className="text-3xl font-bold flex items-center gap-4">
                        <span className="text-primary font-mono">02.</span> 
                        <span className="text-zinc-100">Experience Logs</span>
                    </h2>

                    <div className="flex p-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
                        <button
                            onClick={() => setMode('dev')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-mono transition-all",
                                mode === 'dev' ? "bg-primary text-black font-bold shadow-[0_0_15px_rgba(255,184,77,0.4)]" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <Code2 size={16} /> DEV_OPS
                        </button>
                        <button
                            onClick={() => setMode('teaching')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-mono transition-all",
                                mode === 'teaching' ? "bg-primary text-black font-bold shadow-[0_0_15px_rgba(255,184,77,0.4)]" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <GraduationCap size={16} /> INSTRUCTION
                        </button>
                    </div>
                </div>

                <div className="relative border-l border-white/10 ml-3 md:ml-6 space-y-16">
                    <AnimatePresence mode="wait">
                        {data.map((item, index) => (
                            <motion.div
                                key={`${mode}-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="relative pl-8 md:pl-12 group"
                            >
                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-zinc-900 rounded-full border border-zinc-600 transition-all duration-300 group-hover:bg-primary group-hover:border-primary group-hover:scale-150 group-hover:shadow-[0_0_10px_#FFB84D]" />
                                
                                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-2">
                                    <h3 className="text-xl font-bold text-zinc-100 group-hover:text-primary transition-colors">
                                        {item.role}
                                    </h3>
                                    <span className="font-mono text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                                        {item.period}
                                    </span>
                                </div>
                                
                                <div className="text-primary/80 font-mono text-sm mb-4 tracking-wide">{item.company}</div>
                                
                                <p className="text-zinc-400 leading-relaxed mb-6 text-sm md:text-base max-w-3xl">
                                    {item.desc}
                                </p>

                                {item.achievements && (
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                        {item.achievements.map((ach, i) => (
                                            <li key={i} className="text-xs text-zinc-500 flex gap-3 bg-zinc-900/30 p-2 rounded border border-white/5 hover:border-white/10 transition-colors">
                                                <span className="text-primary mt-0.5">▹</span>
                                                {ach}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {item.skills && (
                                    <div className="flex flex-wrap gap-2">
                                        {item.skills.map((skill) => (
                                            <Badge key={skill} className="bg-primary/5 text-primary/80 border-primary/20">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};