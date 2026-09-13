import Script from 'next/script';

/**
 * Cloudflare Web Analytics beacon: page views and Core Web Vitals, no cookies, no consent banner.
 * Renders nothing until NEXT_PUBLIC_CF_BEACON_TOKEN is set, so local dev and forks stay clean.
 *
 * Custom events (game_play, cv_download, post_read_complete) do not go through this — Cloudflare
 * Web Analytics has no custom-event API. See lib/analytics.ts.
 */
const BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export const Analytics = () => {
    if (!BEACON_TOKEN) return null;

    return (
        <Script
            id="cf-beacon"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={JSON.stringify({ token: BEACON_TOKEN })}
        />
    );
};
