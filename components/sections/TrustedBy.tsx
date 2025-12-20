'use client';
import { resumeData } from '@/data/resume';
import { useStore } from '@/hooks/useStore';
import Image from 'next/image';
import { getAssetPath } from '@/lib/utils';
import { motion } from 'framer-motion';

export const TrustedBy = () => {
    const { openModal } = useStore();
    const companies = resumeData.companies || [];

    if (companies.length === 0) return null;

    const handleCompanyClick = (company: any) => {
        openModal({
            id: Math.random(),
            title: `Working at ${company.name}`,
            category: "Professional Experience",
            type: "image",
            src: company.modal_img || company.logo || "",
            url: company.url,
            tags: [company.role || "Employee", company.name],
            description: company.story || "No details available.",
            gallery: company.gallery
        });
    };

    return (
        <section className="py-20 border-t border-white/5 bg-black relative z-20">
            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center mb-16">
                    <span className="font-mono text-primary text-xs tracking-[0.4em] uppercase mb-4">
                        Professional Journey
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-zinc-100 max-w-2xl">
                        Proudly collaborated with
                    </h2>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-12">
                    {companies.map((company, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => handleCompanyClick(company)}
                            className="group cursor-pointer relative"
                        >
                            <div className="relative w-36 h-20 md:w-44 md:h-24 transition-transform duration-300 group-hover:scale-110 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                {company.logo ? (
                                    <Image 
                                        src={getAssetPath(company.logo)} 
                                        alt={company.name} 
                                        fill 
                                        className="object-contain" 
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center border border-white/10 rounded bg-zinc-900">
                                        <span className="text-lg font-bold font-mono text-zinc-300">
                                            {company.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded border border-white/10">
                                    {company.role}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};