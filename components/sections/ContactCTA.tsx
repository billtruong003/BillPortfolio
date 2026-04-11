'use client';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github, ArrowUpRight } from 'lucide-react';

const LINKS = [
    { label: 'Email Me', href: 'mailto:truongbill003@gmail.com', icon: Mail, accent: 'hover:border-primary hover:text-primary hover:shadow-primary/10' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/billtruong003/', icon: Linkedin, accent: 'hover:border-blue-400 hover:text-blue-400 hover:shadow-blue-400/10' },
    { label: 'GitHub', href: 'https://github.com/billtruong003', icon: Github, accent: 'hover:border-white hover:text-white hover:shadow-white/10' },
];

export const ContactCTA = () => (
    <section className="py-24 px-6 relative z-20">
        <div className="container mx-auto max-w-3xl text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
            >
                <span className="font-mono text-primary text-xs tracking-[0.4em] uppercase">
                    Open to Opportunities
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-100">
                    Let&apos;s Build Something <span className="text-primary">Together</span>
                </h2>
                <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed">
                    Available for full-time roles, contract work, and remote collaboration.
                    Specialized in Unity development and technical art.
                </p>

                <div className="flex flex-wrap justify-center gap-4 pt-4">
                    {LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            target={link.href.startsWith('mailto') ? undefined : '_blank'}
                            rel="noopener noreferrer"
                            className={`group flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-zinc-300 font-mono text-sm transition-all duration-300 shadow-lg ${link.accent}`}
                        >
                            <link.icon size={18} />
                            <span className="uppercase tracking-wider text-xs font-bold">{link.label}</span>
                            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    ))}
                </div>

                <p className="text-zinc-600 font-mono text-xs pt-4">
                    truongbill003@gmail.com · +84 37 497 6616
                </p>
            </motion.div>
        </div>
    </section>
);
