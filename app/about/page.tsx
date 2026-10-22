import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SiteNav } from '@/components/layout/SiteNav';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Experience } from '@/components/sections/Experience';
import { JsonLd } from '@/components/logic/JsonLd';
import { SITE, absoluteUrl } from '@/lib/site';
import { graph, person, PERSON_ID, PORTFOLIO_SITE_ID, STUDIO_URL } from '@/lib/schema';
import resume from '@/data/resume.json';

const TITLE = `About ${resume.profile.name} (Trương Ngọc Châu)`;
const DESCRIPTION = `${resume.profile.name} (Trương Ngọc Châu) is a Unity engineer in Ho Chi Minh City and the founder of Bill The Dev, a one-man indie game studio. Games, VR, web and AI work.`;

export const metadata: Metadata = {
    title: `${TITLE} | ${SITE.siteName}`,
    description: DESCRIPTION,
    alternates: { canonical: absoluteUrl('/about/') },
    openGraph: { type: 'profile', url: absoluteUrl('/about/'), siteName: SITE.siteName, title: TITLE, description: DESCRIPTION },
};

// One page about one person, as Google expects for ProfilePage markup.
const profilePage = {
    '@type': 'ProfilePage',
    '@id': `${absoluteUrl('/about/')}#page`,
    url: absoluteUrl('/about/'),
    name: TITLE,
    isPartOf: { '@id': PORTFOLIO_SITE_ID },
    mainEntity: { '@id': PERSON_ID },
};

export default function AboutPage() {
    return (
        <main className="relative min-h-screen w-full bg-[#050505]">
            <JsonLd data={graph(profilePage, person)} />
            <SiteNav />
            <section className="pt-32 pb-12 px-6">
                <div className="container mx-auto max-w-4xl flex flex-col gap-6">
                    <span className="font-mono text-primary text-xs tracking-[0.4em] uppercase">About</span>
                    <h1 className="text-4xl md:text-6xl font-black text-zinc-100 tracking-tight">
                        {resume.profile.name} <span className="text-zinc-500">(Trương Ngọc Châu)</span>
                    </h1>
                    <p className="text-zinc-300 text-lg leading-relaxed max-w-3xl">{resume.profile.about}</p>
                    <p className="text-zinc-300 text-lg leading-relaxed max-w-3xl">
                        I also run <a href={STUDIO_URL} className="text-primary underline underline-offset-4">Bill The Dev</a>,
                        a one-man game studio in {resume.profile.location}: free puzzle games for Android and{' '}
                        <a href="https://play.billthedevstudio.com/slam-cards/" className="text-primary underline underline-offset-4">Flip Flop Slam</a>,
                        a party game you play in the browser with friends.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                        <a href={STUDIO_URL} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary font-mono text-sm hover:bg-primary hover:text-black transition-colors">
                            Bill The Dev studio <ArrowUpRight size={14} />
                        </a>
                        <Link href="/#contact" className="inline-flex items-center px-4 py-2 rounded-full border border-white/15 text-zinc-200 font-mono text-sm hover:border-primary hover:text-primary transition-colors">
                            Contact
                        </Link>
                    </div>
                </div>
            </section>
            <Experience />
            <SiteFooter />
        </main>
    );
}
