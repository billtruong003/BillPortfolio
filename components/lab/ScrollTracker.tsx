'use client';
import { useEffect, useRef } from 'react';

interface ScrollTrackerProps {
    slug: string;
    readingTime: number;
}

export const ScrollTracker = ({ slug, readingTime }: ScrollTrackerProps) => {
    const startTime = useRef(Date.now());
    const sentDepths = useRef(new Set<number>());
    const sentComplete = useRef(false);

    useEffect(() => {
        const gasUrl = process.env.NEXT_PUBLIC_GAS_URL;
        if (!gasUrl) return;
        if (navigator.doNotTrack === '1') return;

        const sessionKey = `lab_viewed_${slug}`;
        if (!sessionStorage.getItem(sessionKey)) {
            sessionStorage.setItem(sessionKey, '1');
            send(gasUrl, { type: 'post_view', slug, path: window.location.pathname });
        }

        const checkScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;

            const depth = Math.round((scrollTop / docHeight) * 100);
            for (const threshold of [25, 50, 75, 100]) {
                if (depth >= threshold && !sentDepths.current.has(threshold)) {
                    sentDepths.current.add(threshold);
                    send(gasUrl, { type: 'post_scroll', slug, path: window.location.pathname, scrollDepth: threshold });
                }
            }
        };

        const checkReadComplete = () => {
            if (sentComplete.current) return;
            const elapsed = (Date.now() - startTime.current) / 1000;
            const threshold = readingTime * 60 * 0.8;
            if (elapsed >= threshold) {
                sentComplete.current = true;
                send(gasUrl, { type: 'post_read_complete', slug, path: window.location.pathname, readTime: Math.round(elapsed) });
            }
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

function send(url: string, data: Record<string, any>) {
    const payload = { ...data, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (navigator.sendBeacon) {
        navigator.sendBeacon(url, blob);
    } else {
        fetch(url, { method: 'POST', body: blob, keepalive: true, mode: 'no-cors' }).catch(() => {});
    }
}
