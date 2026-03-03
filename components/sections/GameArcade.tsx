'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Joystick, Swords, Puzzle, Crosshair, Wand2, Cpu, Clock, HardDrive, ExternalLink, Play, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { WebGLGame } from '@/types';
import { UnityPlayer } from '@/components/webgl/UnityPlayer';
import { getAssetPath } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

const GENRE_ICONS: Record<string, any> = {
    action: Swords, puzzle: Puzzle, platformer: Joystick, shooter: Crosshair,
    rpg: Wand2, simulation: Cpu, other: Gamepad2,
};
const GENRE_COLORS: Record<string, string> = {
    action: 'text-red-400 border-red-500/30 bg-red-500/10',
    puzzle: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    platformer: 'text-green-400 border-green-500/30 bg-green-500/10',
    shooter: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    rpg: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    simulation: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    other: 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10',
};
const STATUS_STYLES: Record<string, string> = {
    playable: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    demo: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    wip: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    archived: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

interface GameArcadeProps {
    games: WebGLGame[];
    autoPlayGameId?: string | null;
}

export const GameArcade = ({ games, autoPlayGameId }: GameArcadeProps) => {
    const [activeGenre, setActiveGenre] = useState<string>('all');
    const [selectedGame, setSelectedGame] = useState<WebGLGame | null>(() => {
        // Auto-launch game from URL param
        if (autoPlayGameId) {
            return games.find(g => g.id === autoPlayGameId) || null;
        }
        return null;
    });

    const genres = useMemo(() => {
        const genreSet = new Set(games.map(g => g.genre));
        return ['all', ...Array.from(genreSet)];
    }, [games]);

    const filteredGames = useMemo(
        () => activeGenre === 'all' ? games : games.filter(g => g.genre === activeGenre),
        [games, activeGenre]
    );

    // When a game is selected, show fullscreen player
    if (selectedGame) {
        return (
            <UnityPlayer
                game={selectedGame}
                mode="fullpage"
                onClose={() => {
                    setSelectedGame(null);
                    // Clean URL param
                    if (typeof window !== 'undefined') {
                        window.history.replaceState({}, '', '/arcade');
                    }
                }}
            />
        );
    }

    return (
        <section id="arcade" className="py-32 px-6 relative">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/3 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
                                <Gamepad2 size={20} className="text-primary" />
                            </div>
                            <span className="font-mono text-primary text-xs tracking-[0.4em] uppercase">Interactive Lab</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                            Game <span className="text-primary">Arcade</span>
                        </h2>
                        <p className="text-zinc-500 mt-3 max-w-lg text-sm">
                            Playable WebGL builds — chạy trực tiếp trên browser. Click vào game để chơi ngay.
                        </p>
                    </div>

                    {/* Genre filters */}
                    <div className="flex flex-wrap gap-2">
                        {genres.map((genre) => {
                            const Icon = GENRE_ICONS[genre] || Gamepad2;
                            return (
                                <button key={genre} onClick={() => setActiveGenre(genre)}
                                    className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider border rounded-lg transition-all duration-300 ${
                                        activeGenre === genre
                                            ? 'border-primary text-primary bg-primary/10 shadow-[0_0_15px_rgba(255,184,77,0.15)]'
                                            : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 bg-zinc-900/50'
                                    }`}>
                                    {genre !== 'all' && <Icon size={14} />}{genre}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Game grid */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredGames.map((game, idx) => {
                            const GenreIcon = GENRE_ICONS[game.genre] || Gamepad2;
                            return (
                                <motion.div key={game.id} layout
                                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4, delay: idx * 0.08 }}
                                    className="group relative">
                                    <div className="relative bg-zinc-900/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-primary/40 transition-all duration-500 shadow-lg hover:shadow-primary/5">
                                        {/* Thumbnail */}
                                        <div className="relative aspect-video overflow-hidden cursor-pointer" onClick={() => setSelectedGame(game)}>
                                            {game.thumbnail ? (
                                                <Image src={getAssetPath(game.thumbnail)} alt={game.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                                    <Gamepad2 size={48} className="text-zinc-700" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                            {/* Play overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                    className="p-4 bg-primary rounded-full shadow-lg shadow-primary/30">
                                                    <Play size={28} className="text-black ml-0.5" />
                                                </motion.div>
                                            </div>

                                            {/* Badges */}
                                            <div className="absolute top-3 left-3 z-10">
                                                <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full border backdrop-blur-sm ${GENRE_COLORS[game.genre] || GENRE_COLORS.other}`}>
                                                    <GenreIcon size={10} />{game.genre}
                                                </span>
                                            </div>
                                            <div className="absolute top-3 right-3 z-10">
                                                <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full border ${STATUS_STYLES[game.status] || STATUS_STYLES.archived}`}>
                                                    {game.status}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-3 right-3 z-10">
                                                <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-zinc-400 bg-black/60 rounded-full backdrop-blur-sm border border-white/10">
                                                    <HardDrive size={10} />{game.buildSize}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card info */}
                                        <div className="p-5 space-y-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-tight">{game.title}</h3>
                                                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-600 shrink-0">
                                                    <Clock size={10} />
                                                    {new Date(game.releaseDate).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{game.description}</p>
                                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                                                {game.tags.slice(0, 4).map(tag => (
                                                    <Badge key={tag} className="text-[9px] bg-zinc-800/60 border-zinc-700/50">{tag}</Badge>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <button onClick={() => setSelectedGame(game)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-black font-mono text-xs font-bold uppercase tracking-wider rounded-lg border border-primary/30 hover:border-primary transition-all duration-300">
                                                    <Gamepad2 size={14} />Play Now
                                                </button>
                                                {game.externalUrl && (
                                                    <a href={game.externalUrl} target="_blank" rel="noopener noreferrer"
                                                        className="p-2.5 text-zinc-500 hover:text-white border border-white/10 hover:border-white/30 rounded-lg transition-colors">
                                                        <ExternalLink size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>

                {/* Empty state */}
                {filteredGames.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
                        <Gamepad2 size={48} className="mb-4 opacity-30" />
                        <p className="font-mono text-sm">NO_GAMES_FOUND</p>
                    </div>
                )}

                {/* Footer stats */}
                <div className="mt-16 flex items-center justify-center gap-8 text-[10px] font-mono text-zinc-600 border-t border-white/5 pt-8">
                    <span className="flex items-center gap-2"><Gamepad2 size={12} />{games.length} GAMES_LOADED</span>
                    <span className="flex items-center gap-2"><HardDrive size={12} />WEBGL 2.0 REQUIRED</span>
                    <span className="flex items-center gap-2"><Sparkles size={12} />POWERED BY UNITY</span>
                </div>
            </div>
        </section>
    );
};
