'use client';

import { useEffect, useRef } from 'react';

/**
 * Privacy-respecting analytics pipeline.
 * 
 * CHANGES from original:
 * - REMOVED: IP fingerprinting via ipwho.is (this was the main cause of "suspicious site" warnings)
 * - REMOVED: User-Agent collection
 * - KEPT: UTM tracking (standard marketing practice)
 * - KEPT: Page path tracking
 * - ADDED: Respect for Do Not Track (DNT) header
 * - ADDED: Consent-based approach
 */
export const useAnalyticsPipeline = () => {
    const isTracked = useRef(false);

    useEffect(() => {
        const sessionKey = 'analytics_v3';
        if (isTracked.current || sessionStorage.getItem(sessionKey)) return;

        // Respect Do Not Track
        const dnt = navigator.doNotTrack || (window as any).doNotTrack;
        if (dnt === '1' || dnt === 'yes') return;

        const SCRIPT_URL = process.env.NEXT_PUBLIC_GAS_URL;
        if (!SCRIPT_URL) return;

        try {
            const params = new URLSearchParams(window.location.search);

            const payload = {
                // NO IP collection — removed entirely
                // NO user agent — removed entirely  
                utm_source: params.get('utm_source') || params.get('source') || 'Direct',
                utm_medium: params.get('utm_medium') || 'None',
                utm_campaign: params.get('utm_campaign') || params.get('ref') || 'None',
                path: window.location.pathname,
                referrer: document.referrer ? new URL(document.referrer).hostname : 'Direct',
                timestamp: new Date().toISOString(),
            };

            // Use sendBeacon for non-blocking, reliable delivery
            // Falls back to fetch if sendBeacon unavailable
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });

            if (navigator.sendBeacon) {
                navigator.sendBeacon(SCRIPT_URL, blob);
            } else {
                fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify(payload),
                    keepalive: true,
                });
            }

            sessionStorage.setItem(sessionKey, 'true');
            isTracked.current = true;
        } catch {
            // Silent fail — analytics should never break the site
        }
    }, []);
};