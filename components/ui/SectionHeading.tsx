import { cn } from '@/lib/utils';

interface SectionHeadingProps {
    eyebrow: string;
    title: string;
    children?: React.ReactNode;
    align?: 'left' | 'center';
    className?: string;
}

export const SectionHeading = ({ eyebrow, title, children, align = 'left', className }: SectionHeadingProps) => (
    <div className={cn('mb-12 max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
        <span className="font-mono text-primary text-xs tracking-[0.3em] uppercase">{eyebrow}</span>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-zinc-100">{title}</h2>
        {children && <p className="mt-4 text-zinc-400 leading-relaxed">{children}</p>}
    </div>
);
