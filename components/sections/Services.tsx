'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Boxes, Gauge, Wrench, Globe } from 'lucide-react';
import { SERVICES } from '@/data/services';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getAssetPath } from '@/lib/utils';

const ICONS: Record<string, typeof Boxes> = {
    'unity-xr': Boxes,
    performance: Gauge,
    tools: Wrench,
    'web-ai': Globe,
};

export const SELECT_TOPIC_EVENT = 'contact:select-topic';

const askAbout = (id: string) => {
    window.dispatchEvent(new CustomEvent(SELECT_TOPIC_EVENT, { detail: id }));
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
};

export const Services = () => (
    <section id="services" className="py-24 px-6 relative z-20 scroll-mt-20">
        <div className="container mx-auto max-w-6xl">
            <SectionHeading eyebrow="Services" title="What I can build for you">
                Freelance and contract work, remote or onsite. Each service links to work you can check yourself.
            </SectionHeading>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SERVICES.map((service, idx) => {
                    const Icon = ICONS[service.id] ?? Boxes;
                    return (
                        <motion.article
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.08 }}
                            className="flex flex-col p-6 md:p-8 bg-zinc-900/40 border border-white/10 rounded-xl backdrop-blur-sm hover:border-primary/40 transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                    <Icon size={20} className="text-primary" aria-hidden />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-100">{service.title}</h3>
                            </div>

                            <p className="text-zinc-300 leading-relaxed mb-5">{service.pitch}</p>

                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-6 text-sm text-zinc-400">
                                {service.includes.map((item) => (
                                    <li key={item} className="flex gap-2">
                                        <span className="text-primary" aria-hidden>▹</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 pt-4 border-t border-white/5">
                                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">See</span>
                                {service.proof.map((p) => {
                                    const external = p.href.startsWith('http');
                                    const className = 'inline-flex items-center gap-1 text-sm text-zinc-300 hover:text-primary underline-offset-4 hover:underline focus-visible:text-primary';
                                    return external ? (
                                        <a key={p.label} href={p.href} target="_blank" rel="noopener noreferrer" className={className}>
                                            {p.label} <ArrowUpRight size={14} aria-hidden />
                                        </a>
                                    ) : (
                                        <Link key={p.label} href={p.href} className={className}>
                                            {p.label}
                                        </Link>
                                    );
                                })}
                                <button
                                    type="button"
                                    onClick={() => askAbout(service.id)}
                                    className="ml-auto px-4 py-2 text-sm font-bold text-black bg-primary rounded-lg hover:bg-white transition-colors"
                                >
                                    Ask about this
                                </button>
                            </div>
                        </motion.article>
                    );
                })}
            </div>

            <p className="mt-8 text-sm text-zinc-500">
                Hiring for a full-time Unity role instead?{' '}
                <button type="button" onClick={() => askAbout('full-time')} className="text-primary hover:underline underline-offset-4">
                    Tell me about the role
                </button>
                {' '}or{' '}
                <a href={getAssetPath('/Bill_Resume.pdf')} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4">
                    download my CV
                </a>.
            </p>
        </div>
    </section>
);
