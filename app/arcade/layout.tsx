import type { Metadata } from 'next';
import { SITE, absoluteUrl } from '@/lib/site';

// The arcade page is a client component, so its own title and description live here (without them it
// carried the home page's title).
const TITLE = 'Game Lab: playable web games';
const DESCRIPTION = 'Play Bill Truong\'s Unity and web game builds in the browser: work samples, game jam entries and build-along projects.';

export const metadata: Metadata = {
    title: `${TITLE} | ${SITE.siteName}`,
    description: DESCRIPTION,
    alternates: { canonical: absoluteUrl('/arcade/') },
    openGraph: { type: 'website', url: absoluteUrl('/arcade/'), siteName: SITE.siteName, title: TITLE, description: DESCRIPTION },
};

export default function ArcadeLayout({ children }: { children: React.ReactNode }) {
    return children;
}
