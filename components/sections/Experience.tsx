// components/sections/Experience.tsx
import { resumeData } from '@/data/resume';

export const Experience = () => {
    return (
        <section className="py-32 px-6 bg-zinc-900/20">
            <div className="container mx-auto max-w-4xl">
                <h2 className="text-3xl font-bold mb-16 flex items-center gap-4">
                    <span className="text-primary font-mono">02.</span> Experience Log
                </h2>

                <div className="relative border-l border-zinc-800 ml-3 md:ml-6 space-y-16">
                    {resumeData.experience.dev.map((item, index) => (
                        <div key={index} className="relative pl-8 md:pl-12 group">
                            <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-zinc-800 rounded-full border border-zinc-600 transition-colors duration-300 group-hover:bg-primary group-hover:border-primary group-hover:shadow-[0_0_10px_#FFB84D]" />
                            
                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4">
                                <h3 className="text-xl font-bold text-zinc-100 group-hover:text-primary transition-colors">
                                    {item.role}
                                </h3>
                                <span className="font-mono text-sm text-zinc-500">{item.period}</span>
                            </div>
                            
                            <div className="text-primary/80 font-mono text-sm mb-4">{item.company}</div>
                            
                            <p className="text-zinc-400 leading-relaxed mb-4 text-sm md:text-base">
                                {item.desc}
                            </p>

                            {/* FIX: Thêm type cho ach và i */}
                            {item.achievements && (
                                <ul className="space-y-2 mb-4">
                                    {item.achievements.map((ach: string, i: number) => (
                                        <li key={i} className="text-sm text-zinc-500 flex gap-3">
                                            <span className="text-primary">▹</span>
                                            {ach}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* FIX: Thêm type cho skill */}
                            {item.skills && (
                                <div className="flex flex-wrap gap-2">
                                    {item.skills.map((skill: string) => (
                                        <span key={skill} className="px-2 py-1 text-[10px] border border-zinc-800 rounded bg-zinc-900/50 text-zinc-400 font-mono">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};