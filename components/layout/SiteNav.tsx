'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { SITE } from '@/lib/site';
import { NAV_LINKS } from '@/lib/nav';

export const SiteNav = () => {
    const [open, setOpen] = useState(false);

    return (
        <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/70 backdrop-blur-md">
            <nav aria-label="Main" className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="font-mono font-bold tracking-wider text-zinc-100 hover:text-primary">
                    {SITE.name}
                </Link>

                <ul className="hidden lg:flex items-center gap-7 text-sm text-zinc-300">
                    {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href} className="hover:text-primary transition-colors">{link.label}</Link>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-3">
                    <Link
                        href="/#contact"
                        className="hidden sm:inline-flex px-4 py-2 text-sm font-bold text-black bg-primary rounded-lg hover:bg-white transition-colors"
                    >
                        Hire me
                    </Link>
                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        aria-expanded={open}
                        aria-controls="mobile-nav"
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        className="lg:hidden p-2 text-zinc-300 hover:text-primary"
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </nav>

            {open && (
                <ul id="mobile-nav" className="lg:hidden border-t border-white/5 bg-black/95 px-6 py-4 space-y-1">
                    {[...NAV_LINKS, { label: 'Hire me', href: '/#contact' }].map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="block py-3 text-zinc-200 hover:text-primary"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </header>
    );
};
