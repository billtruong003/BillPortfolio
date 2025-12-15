'use client';
import { resumeData } from '@/data/resume';
import { Quote, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const Testimonials = () => {
    return (
        <section className="py-24 px-6 relative">
            <div className="container mx-auto max-w-6xl">
                 <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
                    <span className="text-primary font-mono">03.</span> 
                    <span className="text-zinc-100">Transmission Logs</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumeData.testimonials.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative p-6 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-xl backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity duration-500">
                                <Quote size={40} className="text-primary transform rotate-180" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-primary/60 uppercase tracking-widest border-b border-white/5 pb-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Incoming_Message_0{idx + 1}
                                    </div>
                                    <p className="text-zinc-300 text-sm leading-relaxed italic">
                                        "{item.quote}"
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                                        <UserCheck size={18} className="text-zinc-400 group-hover:text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-zinc-100 font-bold text-sm">{item.author}</div>
                                        <div className="text-primary text-xs font-mono">{item.role}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};