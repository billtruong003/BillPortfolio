// components/ui/Badge.tsx
import { cn } from "@/lib/utils";

export const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={cn(
        "px-2 py-0.5 text-[10px] md:text-xs font-mono border border-white/10 bg-white/5 text-zinc-300 rounded tracking-tight backdrop-blur-sm",
        className
    )}>
        {children}
    </span>
);