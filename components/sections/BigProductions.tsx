'use client';
import { resumeData } from '@/data/resume';
import { useStore } from '@/hooks/useStore';
import Image from 'next/image';
import { getAssetPath } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Rocket, Building2, UserCircle, ArrowUpRight, ArrowDown, Code2 } from 'lucide-react';

export const BigProductions = () => {
    const { openModal } = useStore();
    const productions = resumeData.productions || [];

    const scrollToPortfolio = () => {
        const element = document.getElementById('portfolio');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (productions.length === 0) return null;

    const handleProductClick = (prod: any) => {
        openModal({
            id: Math.random(),
            title: prod.name,
            category: "Key Production",
            type: "image",
            src: prod.modal_img || prod.logo || "",
            url: prod.url,
            tags: [prod.at_company || "Indie"],
            description: prod.story || prod.desc || "No details available.",
        });
    };

    return (
        <section className="py-20 border-b border-white/5 bg-[#080808] relative z-20">
            <div className="container mx-auto px-6">
                <div className="mb-12">
                    <span className="font-mono text-primary text-xs tracking-[0.4em] uppercase mb-2 block">
                        Key Deployments
                    </span>
                    <h2 className="text-3xl font-bold text-zinc-100 mb-4">
                        Impactful Products
                    </h2>
                    <p className="text-zinc-500 text-sm max-w-2xl">
                        Major titles and systems I've architected. Click to view development stories.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {productions.map((prod, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => handleProductClick(prod)}
                            className="group relative bg-zinc-900 border border-white/10 hover:border-primary/50 hover:bg-zinc-800 rounded-xl p-5 cursor-pointer transition-all duration-300 flex flex-col sm:flex-row items-start gap-6 shadow-lg"
                        >
                            <div className="relative w-24 h-24 shrink-0 bg-black rounded-xl border border-white/10 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                                {prod.logo ? (
                                    <Image 
                                        src={getAssetPath(prod.logo)} 
                                        alt={prod.name} 
                                        fill 
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                        <Rocket size={32} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-1">
                                        {prod.name}
                                    </h3>
                                    <ArrowUpRight size={20} className="text-zinc-600 group-hover:text-primary transition-colors" />
                                </div>
                                
                                <p className="text-xs font-mono text-zinc-400 mb-4 uppercase tracking-wider">
                                    {prod.desc}
                                </p>

                                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3 mt-auto">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase font-mono mb-1">
                                            <Building2 size={12} /> Company
                                        </div>
                                        <div className="text-zinc-200 text-sm font-semibold">
                                            {prod.at_company || "Personal"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase font-mono mb-1">
                                            <UserCircle size={12} /> Role
                                        </div>
                                        <div className="text-zinc-200 text-sm font-semibold">
                                            {prod.role || "Developer"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center pt-8 border-t border-white/5"
                >
                    <p className="text-zinc-500 font-mono text-xs md:text-sm text-center max-w-lg mb-6 leading-relaxed">
                        These products represent key industrial milestones. 
                        <br className="hidden md:block"/>
                        For a deeper dive into technical experiments, open-source tools, and shaders, explore the portfolio below.
                    </p>
                    
                    <button 
                        onClick={scrollToPortfolio}
                        className="group flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 rounded-full transition-all duration-300"
                    >
                        <Code2 size={16} className="text-primary group-hover:scale-110 transition-transform"/>
                        <span className="text-xs font-mono text-zinc-300 group-hover:text-white tracking-widest uppercase">
                            View Technical Portfolio
                        </span>
                        <ArrowDown size={14} className="text-zinc-500 group-hover:text-primary group-hover:translate-y-1 transition-all" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
};