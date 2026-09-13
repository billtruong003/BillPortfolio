/**
 * One place for every custom analytics event on the site.
 *
 * Two sinks, on purpose:
 * - Cloudflare Web Analytics (components/logic/Analytics.tsx) handles page views and Core Web
 *   Vitals on its own. It has no custom-event API, so nothing here talks to it.
 * - The Google Apps Script endpoint (NEXT_PUBLIC_GAS_URL) receives the custom events below.
 *
 * Everything is best-effort: no endpoint configured, Do Not Track on, or a network failure all
 * end as a silent no-op. Analytics must never break a page.
 */

export type AnalyticsEvent =
    | 'page_view'
    | 'post_view'
    | 'post_scroll'
    | 'post_read_complete'
    | 'game_play'
    | 'cv_download';

const ENDPOINT = process.env.NEXT_PUBLIC_GAS_URL;

function isOptedOut(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
    const dnt = navigator.doNotTrack ?? (window as unknown as { doNotTrack?: string }).doNotTrack;
    return dnt === '1' || dnt === 'yes';
}

/** Fire and forget. Extra fields are merged into the payload. */
export function track(type: AnalyticsEvent, props: Record<string, unknown> = {}): void {
    if (!ENDPOINT || isOptedOut()) return;

    const payload = {
        type,
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
        ...props,
    };

    try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        if (navigator.sendBeacon) {
            navigator.sendBeacon(ENDPOINT, blob);
        } else {
            fetch(ENDPOINT, { method: 'POST', body: blob, keepalive: true, mode: 'no-cors' }).catch(() => {});
        }
    } catch {
        // Silent by design.
    }
}

/**
 * Send an event at most once per browser tab. Used for things that would otherwise repeat on
 * every re-render or re-mount (a post view, starting the same game twice).
 */
export function trackOnce(key: string, type: AnalyticsEvent, props: Record<string, unknown> = {}): void {
    if (!ENDPOINT || isOptedOut()) return;

    try {
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, '1');
    } catch {
        // Private mode with storage blocked: fall through and just send it.
    }

    track(type, props);
}

/** Campaign attribution for the first page view of a session. */
export function campaignParams(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get('utm_source') || params.get('source') || 'Direct',
        utm_medium: params.get('utm_medium') || 'None',
        utm_campaign: params.get('utm_campaign') || params.get('ref') || 'None',
        referrer: document.referrer ? new URL(document.referrer).hostname : 'Direct',
    };
}
