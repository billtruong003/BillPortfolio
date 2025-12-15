'use client';
import { resumeData } from '@/data/resume';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const Certifications = () => {
    return (
        <section className="py-12 px-6 border-y border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="container mx-auto">
                <div className="flex flex-col items-center text-center mb-10">
                    <span className="font-mono text-primary text-xs tracking-[0.3em] uppercase mb-2">Verified Credentials</span>
                    <h3 className="text-xl text-zinc-300 font-bold">Security Clearances & Certificates</h3>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                    {resumeData.certifications.map((cert, idx) => (
                        <a
                            key={idx}
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center gap-4 p-4 bg-zinc-900/50 border border-white/5 rounded-lg hover:bg-white/5 hover:border-primary/30 transition-all duration-300 min-w-[300px]"
                        >
                            <div className="p-3 bg-zinc-950 rounded border border-white/10 text-emerald-500 group-hover:text-primary transition-colors">
                                <ShieldCheck size={20} />
                            </div>
                            
                            <div className="flex-1 text-left">
                                <div className="text-zinc-200 font-bold text-sm group-hover:text-primary transition-colors">
                                    {cert.name}
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-zinc-500 text-xs font-mono">{cert.issuer}</span>
                                    <span className="text-zinc-600 text-[10px] font-mono border border-white/5 px-1.5 rounded bg-black/40">
                                        {cert.date}
                                    </span>
                                </div>
                            </div>

                            <ExternalLink size={14} className="text-zinc-700 group-hover:text-zinc-400 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all" />
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};