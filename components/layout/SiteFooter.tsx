import Link from 'next/link';
import { SITE } from '@/lib/site';
import { resumeData } from '@/data/resume';
import { NAV_LINKS } from '@/lib/nav';

const PLATFORM_LABELS: Record<string, string> = {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    facebook: 'Facebook',
    itch: 'itch.io',
};

export const SiteFooter = () => (
    <footer className="relative z-10 border-t border-white/5 bg-black/60 backdrop-blur-md">
        <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">
            <div>
                <p className="font-mono font-bold text-zinc-100">{SITE.name}</p>
                <p className="mt-2 text-zinc-400">{SITE.title}</p>
                <a href={`mailto:${SITE.email}`} className="mt-4 inline-block text-primary hover:underline underline-offset-4">
                    {SITE.email}
                </a>
            </div>

            <nav aria-label="Footer">
                <ul className="space-y-2">
                    {[...NAV_LINKS, { label: 'Contact', href: '/#contact' }].map((link) => (
                        <li key={link.href}>
                            <Link href={link.href} className="text-zinc-400 hover:text-primary">{link.label}</Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <ul className="space-y-2">
                {resumeData.socials.map((s) => (
                    <li key={s.platform}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-primary">
                            {PLATFORM_LABELS[s.platform] ?? s.platform}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
        <p className="pb-8 text-center text-xs font-mono text-zinc-500">
            © {new Date().getFullYear()} {SITE.author}
        </p>
    </footer>
);
