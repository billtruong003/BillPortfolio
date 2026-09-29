/**
 * Custom events for Umami (components/logic/Analytics.tsx loads the script). Page views are
 * tracked by Umami on its own. A no-op until the script has loaded, or when the visitor blocks it.
 */
declare global {
    interface Window {
        umami?: { track: (event: string, data?: Record<string, string | number>) => void };
    }
}

export type AnalyticsEvent = 'game_play' | 'cv_download' | 'contact_submit' | 'post_read_complete';

export function track(event: AnalyticsEvent, data?: Record<string, string | number>): void {
    window.umami?.track(event, data);
}
