import Script from 'next/script';

/**
 * Cookieless analytics, so no consent banner.
 * - Umami: page views, referrers, countries, devices and the custom events in lib/analytics.ts.
 *   data-domains keeps localhost and preview builds out of the numbers.
 * - Cloudflare Web Analytics: optional, rendered only when NEXT_PUBLIC_CF_BEACON_TOKEN is set.
 */
const UMAMI_WEBSITE_ID = '8ce07ac3-2823-4a2a-bdc4-39ef3389ca48';
const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export const Analytics = () => (
    <>
        <Script
            id="umami"
            src="https://cloud.umami.is/script.js"
            strategy="afterInteractive"
            data-website-id={UMAMI_WEBSITE_ID}
            data-domains="www.billthedev.com,billthedev.com"
        />
        {CF_BEACON_TOKEN && (
            <Script
                id="cf-beacon"
                src="https://static.cloudflareinsights.com/beacon.min.js"
                strategy="afterInteractive"
                data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN })}
            />
        )}
    </>
);
