'use client';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';

/** Sends post_read_complete once, when the reader scrolls through 90% of the post. */
export const ReadTracker = ({ slug }: { slug: string }) => {
    useEffect(() => {
        const onScroll = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollable <= 0 || window.scrollY / scrollable < 0.9) return;
            track('post_read_complete', { slug });
            window.removeEventListener('scroll', onScroll);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [slug]);

    return null;
};
