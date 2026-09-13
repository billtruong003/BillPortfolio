import Link from 'next/link';
import { FlaskConical, Gamepad2, Home } from 'lucide-react';

export const metadata = {
    title: '404 | Bill The Dev',
};

const LINKS = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/lab', label: 'Dev Lab', icon: FlaskConical },
    { href: '/arcade', label: 'Arcade', icon: Gamepad2 },
];

export default function NotFound() {
    return (
        <main className="relative min-h-screen w-full bg-[#050505] flex items-center justify-center px-6">
            <div className="text-center max-w-lg">
                <span className="font-mono text-primary text-xs tracking-[0.4em] uppercase">Error 404</span>
                <h1 className="mt-4 text-7xl md:text-8xl font-black text-zinc-100 tracking-tight">
                    LOST<span className="text-primary">_</span>SIGNAL
                </h1>
                <p className="mt-6 text-zinc-400 leading-relaxed">
                    Trang này không tồn tại hoặc đã được chuyển đi nơi khác.
                </p>
                <nav className="mt-10 flex flex-wrap items-center justify-center gap-3">
                    {LINKS.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900/60 border border-zinc-800 hover:border-primary/50 hover:text-primary text-zinc-300 rounded-lg font-mono text-xs uppercase tracking-wider transition-colors"
                        >
                            <Icon size={14} />
                            {label}
                        </Link>
                    ))}
                </nav>
            </div>
        </main>
    );
}
