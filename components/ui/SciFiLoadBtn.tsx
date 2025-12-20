'use client';
import { motion } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';

interface SciFiLoadBtnProps {
    onClick: () => void;
    isLoading?: boolean;
    label?: string;
}

export const SciFiLoadBtn = ({ onClick, isLoading = false, label = "INITIALIZE_ADDITIONAL_DATA" }: SciFiLoadBtnProps) => {
    return (
        <div className="flex justify-center mt-12 w-full">
            <motion.button
                onClick={onClick}
                whileHover={{ scale: 1.02, letterSpacing: "0.2em" }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-8 py-4 bg-black/40 border border-primary/30 hover:border-primary text-primary font-mono text-xs md:text-sm tracking-[0.15em] uppercase transition-all duration-300 overflow-hidden"
            >
                <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                
                <span className="relative z-10 flex items-center gap-3">
                    {isLoading ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                        <>
                            <span className="text-primary/50 group-hover:text-primary transition-colors">{`>>`}</span>
                            {label}
                            <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                        </>
                    )}
                </span>

                <div className="absolute top-0 left-0 w-2 h-[1px] bg-primary" />
                <div className="absolute top-0 right-0 w-2 h-[1px] bg-primary" />
                <div className="absolute bottom-0 left-0 w-2 h-[1px] bg-primary" />
                <div className="absolute bottom-0 right-0 w-2 h-[1px] bg-primary" />
            </motion.button>
        </div>
    );
};