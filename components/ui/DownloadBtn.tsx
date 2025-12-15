'use client';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface DownloadBtnProps {
    href: string;
    text?: string;
}

export const DownloadBtn = ({ href, text = "Download CV" }: DownloadBtnProps) => {
    return (
        <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 overflow-hidden border border-zinc-700 hover:border-primary transition-colors duration-300"
        >
            <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 font-mono font-bold tracking-wider text-zinc-300 group-hover:text-primary uppercase flex items-center gap-2">
                <Download size={18} className="group-hover:animate-bounce" />
                {text}
            </span>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 left-0 w-2 h-2 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.a>
    );
};