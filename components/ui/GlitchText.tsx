// components/ui/GlitchText.tsx
'use client';

// The two coloured copies are CSS pseudo-elements fed by data-text, so the text itself is in the page
// once (search engines and screen readers read the heading once, not three times).
export const GlitchText = ({ text, className }: { text: string; className?: string }) => {
    return (
        <span
            data-text={text}
            className={`relative inline-block group ${className ?? ''} before:content-[attr(data-text)] before:absolute before:top-0 before:left-0 before:-z-10 before:w-full before:h-full before:text-primary before:opacity-0 group-hover:before:opacity-70 group-hover:before:translate-x-[2px] before:transition-all before:duration-100 before:select-none after:content-[attr(data-text)] after:absolute after:top-0 after:left-0 after:-z-10 after:w-full after:h-full after:text-red-500 after:opacity-0 group-hover:after:opacity-70 group-hover:after:-translate-x-[2px] after:transition-all after:duration-100 after:delay-75 after:select-none`}
        >
            <span className="relative z-10">{text}</span>
        </span>
    );
};
