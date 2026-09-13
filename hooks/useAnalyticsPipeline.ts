'use client';

import { useEffect } from 'react';
import { campaignParams, trackOnce } from '@/lib/analytics';

/**
 * Sends one page_view with campaign attribution per browser tab.
 *
 * Deliberately collects no IP and no user agent: the earlier version called ipwho.is on every
 * visit, which is what got the domain flagged as suspicious. Do Not Track is honoured in
 * lib/analytics.ts.
 */
export const useAnalyticsPipeline = () => {
    useEffect(() => {
        trackOnce('analytics_v3', 'page_view', campaignParams());
    }, []);
};
