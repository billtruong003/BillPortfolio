'use client';
import { useEffect, useRef } from 'react';
import { track, trackOnce } from '@/lib/analytics';

const DEPTH_MARKS = [25, 50, 75, 100] as const;

/** Reports how far down a post the reader got, and whether they stayed long enough to have read it. */
export const ScrollTracker = ({ slug, readingTime }: { slug: string; readingTime: number }) => {
    const startTime = useRef(Date.now());
    const sentDepths = useRef(new Set<number>());
    const sentComplete = useRef(false);

    useEffect(() => {
        trackOnce(`lab_viewed_${slug}`, 'post_view', { slug });

        const checkScroll = () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;

            const depth = Math.round((window.scrollY / docHeight) * 100);
            for (const mark of DEPTH_MARKS) {
                if (depth >= mark && !sentDepths.current.has(mark)) {
                    sentDepths.current.add(mark);
                    track('post_scroll', { slug, scrollDepth: mark });
                }
            }
        };

        const checkReadComplete = () => {
            if (sentComplete.current) return;

            const elapsed = (Date.now() - startTime.current) / 1000;
            if (elapsed < readingTime * 60 * 0.8) return;

            sentComplete.current = true;
            track('post_read_complete', { slug, readTime: Math.round(elapsed) });
        };

        window.addEventListener('scroll', checkScroll, { passive: true });
        const timer = setInterval(checkReadComplete, 5000);

        return () => {
            window.removeEventListener('scroll', checkScroll);
            clearInterval(timer);
        };
    }, [slug, readingTime]);

    return null;
};
