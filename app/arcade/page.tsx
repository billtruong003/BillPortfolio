'use client';

import { useState, useEffect } from 'react';
import { GameArcade } from '@/components/sections/GameArcade';
import { WebGLGame, WebGLGameRegistry } from '@/types';
import { ArrowLeft, Gamepad2, Loader2 } from 'lucide-react';
import { getAssetPath } from '@/lib/utils';
import dynamic from 'next/dynamic';

const ParticleBackground = dynamic(
    () => import('@/components/canvas/ParticleBackground').then(mod => mod.ParticleBackground),
    { ssr: false }
);

export default function ArcadePage() {
    const [games, setGames] = useState<WebGLGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [autoPlayGameId, setAutoPlayGameId] = useState<string | null>(null);

    useEffect(() => {
        // Check for ?game= query param
        const params = new URLSearchParams(window.location.search);
        const gameParam = params.get('game');
        if (gameParam) setAutoPlayGameId(gameParam);

        // Load registry.json from public folder
        fetch(getAssetPath('/webgl-games/registry.json'))
            .then(res => {
                if (!res.ok) throw new Error('Registry not found');
                return res.json();
            })
            .then((data: WebGLGameRegistry) => {
                setGames(data.games || []);
                setLoading(false);
            })
            .catch(() => {
                // No games registered yet - that's OK
                setGames([]);
                setLoading(false);
            });
    }, []);

    return (
        <main className="relative min-h-screen bg-[#050505]">
            {/* Particle background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ParticleBackground />
            </div>

            <div className="relative z-10">
                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/60 backdrop-blur-md border-b border-white/5">
                    <a href="/" className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors font-mono text-sm">
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">BACK_TO_BASE</span>
                    </a>
                    <div className="flex items-center gap-3">
                        <Gamepad2 size={18} className="text-primary" />
                        <span className="font-mono text-sm text-zinc-300 tracking-widest uppercase">Game Arcade</span>
                        {games.length > 0 && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-mono rounded-full border border-primary/20">
                                {games.length}
                            </span>
                        )}
                    </div>
                    <div className="w-24" /> {/* Spacer */}
                </nav>

                {/* Content */}
                <div className="pt-16">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                            <Loader2 className="animate-spin text-primary" size={32} />
                            <span className="font-mono text-xs text-zinc-500 tracking-widest">LOADING_GAME_REGISTRY...</span>
                        </div>
                    ) : games.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
                            <Gamepad2 size={64} className="text-zinc-800" />
                            <div>
                                <h2 className="text-2xl font-bold text-zinc-300 mb-2">No games deployed yet</h2>
                                <p className="text-zinc-600 text-sm max-w-md mx-auto mb-6">
                                    Chưa có game nào trong registry. Để thêm game, build Unity WebGL rồi chạy:
                                </p>
                                <code className="px-4 py-2 bg-zinc-900 text-primary font-mono text-sm rounded border border-white/10">
                                    node scripts/add-game.mjs your-game-id --title &quot;Game Name&quot;
                                </code>
                            </div>
                            <a href="/" className="mt-4 px-6 py-3 bg-zinc-900 text-zinc-300 font-mono text-xs uppercase tracking-wider rounded border border-white/10 hover:border-primary/50 transition-colors">
                                ← Return to Portfolio
                            </a>
                        </div>
                    ) : (
                        <GameArcade games={games} autoPlayGameId={autoPlayGameId} />
                    )}
                </div>

                {/* Footer */}
                <footer className="relative z-10 py-12 text-center border-t border-white/5 bg-black/40 backdrop-blur-md">
                    <p className="text-zinc-600 font-mono text-xs">
                        © {new Date().getFullYear()} Bill The Dev. <br className="md:hidden"/> Powered by Unity WebGL.
                    </p>
                </footer>
            </div>
        </main>
    );
}
