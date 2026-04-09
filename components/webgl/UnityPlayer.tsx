'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize, Minimize, Volume2, VolumeX, RefreshCw, Loader2, AlertTriangle, X, Gamepad2, Info } from 'lucide-react';
import { WebGLGame } from '@/types';
import { getAssetPath } from '@/lib/utils';

interface UnityPlayerProps {
    game: WebGLGame;
    onClose?: () => void;
    mode?: 'fullpage' | 'embedded';
}

type LoadState = 'idle' | 'loading-script' | 'loading-data' | 'ready' | 'error';

export const UnityPlayer = ({ game, onClose, mode = 'fullpage' }: UnityPlayerProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const unityInstanceRef = useRef<any>(null);

    const [loadState, setLoadState] = useState<LoadState>('idle');
    const [progress, setProgress] = useState(0);
    const[errorMsg, setErrorMsg] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const[isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showInfo, setShowInfo] = useState(false);
    const[canvasSize, setCanvasSize] = useState({ width: '100%', height: '100%' });

    const getExt = useCallback(() => {
        switch (game.build.compression) {
            case 'gzip': return '.gz';
            case 'brotli': return '.br';
            case 'none': return '';
            default: return '';
        }
    }, [game.build.compression]);

    const calculateAspectRatio = useCallback(() => {
        if (!game.display?.fixedRatio || !containerRef.current) {
            setCanvasSize({ width: '100%', height: '100%' });
            return;
        }

        const targetRatio = game.display.ratioWidth / game.display.ratioHeight;
        const winW = containerRef.current.clientWidth;
        const winH = containerRef.current.clientHeight;
        const winRatio = winW / winH;

        if (winRatio > targetRatio) {
            setCanvasSize({
                width: `${Math.floor(winH * targetRatio)}px`,
                height: `${winH}px`
            });
        } else {
            setCanvasSize({
                width: `${winW}px`,
                height: `${Math.floor(winW / targetRatio)}px`
            });
        }
    }, [game.display]);

    useEffect(() => {
        const currentContainer = containerRef.current;
        if (!currentContainer) return;

        const observer = new ResizeObserver(() => calculateAspectRatio());
        observer.observe(currentContainer);

        const handleOrientationChange = () => setTimeout(calculateAspectRatio, 100);
        window.addEventListener('orientationchange', handleOrientationChange);

        return () => {
            observer.disconnect();
            window.removeEventListener('orientationchange', handleOrientationChange);
        };
    }, [calculateAspectRatio]);

    const loadGame = useCallback(async () => {
        if (loadState === 'loading-script' || loadState === 'loading-data') return;
        setLoadState('loading-script');
        setProgress(0);
        setErrorMsg('');
        calculateAspectRatio();

        const buildPath = getAssetPath(game.build.buildPath);
        const buildName = game.build.buildName;
        const ext = getExt();

        try {
            const loaderUrl = `${buildPath}/${buildName}.loader.js`;
            await new Promise<void>((resolve, reject) => {
                if ((window as any).createUnityInstance) { resolve(); return; }
                const script = document.createElement('script');
                script.src = loaderUrl;
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load Unity loader: ${loaderUrl}`));
                document.head.appendChild(script);
            });

            setLoadState('loading-data');

            const config: any = {
                dataUrl: game.build.externalDataUrl || `${buildPath}/${buildName}.data${ext}`,
                frameworkUrl: `${buildPath}/${buildName}.framework.js${ext}`,
                codeUrl: `${buildPath}/${buildName}.wasm${ext}`,
                companyName: game.build.companyName || 'DefaultCompany',
                productName: game.build.productName || game.title,
                productVersion: game.build.productVersion || '1.0',
            };
            
            if (game.build.hasStreamingAssets) {
                config.streamingAssetsUrl = `${buildPath}/StreamingAssets`;
            }

            const createUnityInstance = (window as any).createUnityInstance;
            if (!createUnityInstance) throw new Error('createUnityInstance not found after loading script.');

            const instance = await createUnityInstance(canvasRef.current, config, (p: number) => {
                setProgress(Math.round(p * 100));
            });

            unityInstanceRef.current = instance;
            setLoadState('ready');
            setTimeout(() => setShowControls(false), 3000);
        } catch (err: any) {
            setLoadState('error');
            setErrorMsg(err.message || 'Failed to load game.');
        }
    },[game, loadState, getExt, calculateAspectRatio]);

    useEffect(() => {
        return () => {
            if (unityInstanceRef.current) {
                try { unityInstanceRef.current.Quit(); } catch {}
                unityInstanceRef.current = null;
            }
            document.querySelectorAll('script[src*=".loader.js"]').forEach(s => s.remove());
            (window as any).createUnityInstance = undefined;
        };
    },[]);

    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;
        try {
            if (!document.fullscreenElement) { 
                await containerRef.current.requestFullscreen(); 
                setIsFullscreen(true); 
            } else { 
                await document.exitFullscreen(); 
                setIsFullscreen(false); 
            }
        } catch {
            if (unityInstanceRef.current) unityInstanceRef.current.SetFullscreen(isFullscreen ? 0 : 1);
        }
    }, [isFullscreen]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            setTimeout(calculateAspectRatio, 100);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [calculateAspectRatio]);

    const toggleMute = useCallback(() => {
        if (unityInstanceRef.current) {
            try { unityInstanceRef.current.SendMessage('AudioManager', 'SetMute', isMuted ? 0 : 1); } catch {}
        }
        setIsMuted(!isMuted);
    }, [isMuted]);

    useEffect(() => {
        if (loadState !== 'ready') return;
        const preventScroll = (e: KeyboardEvent) => {
            if (document.activeElement === canvasRef.current &&['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
        };
        window.addEventListener('keydown', preventScroll);
        return () => window.removeEventListener('keydown', preventScroll);
    },[loadState]);

    useEffect(() => {
        if (loadState !== 'ready') return;
        let timeout: NodeJS.Timeout;
        const handleMouseMove = () => { 
            setShowControls(true); 
            clearTimeout(timeout); 
            timeout = setTimeout(() => setShowControls(false), 2500); 
        };
        const el = containerRef.current;
        el?.addEventListener('mousemove', handleMouseMove);
        return () => { 
            el?.removeEventListener('mousemove', handleMouseMove); 
            clearTimeout(timeout); 
        };
    }, [loadState]);

    const containerClasses = mode === 'fullpage' ? 'fixed inset-0 z-[100] bg-black' : 'relative w-full aspect-video';

    return (
        <div ref={containerRef} className={`${containerClasses} flex flex-col items-center justify-center overflow-hidden select-none`}>
            <canvas 
                ref={canvasRef} 
                id={`unity-canvas-${game.id}`} 
                tabIndex={0}
                className={`outline-none ${loadState === 'ready' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
                style={{ 
                    cursor: loadState === 'ready' ? 'default' : 'wait',
                    width: canvasSize.width,
                    height: canvasSize.height
                }}
                onClick={() => canvasRef.current?.focus()} 
            />

            <AnimatePresence>
                {(loadState === 'idle' || loadState === 'loading-script' || loadState === 'loading-data') && (
                    <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0A0A0A]">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
                            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,184,77,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,184,77,0.3) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
                        </div>

                        <div className="relative z-10 flex flex-col items-center gap-8 max-w-md px-6 text-center">
                            {game.thumbnail && loadState === 'idle' && (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-48 h-48 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/10">
                                    <img src={getAssetPath(game.thumbnail)} alt={game.title} className="w-full h-full object-cover" />
                                </motion.div>
                            )}

                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">{game.title}</h2>
                                <p className="text-zinc-500 text-sm font-mono">{game.buildSize} • {game.genre}</p>
                            </div>

                            {loadState === 'idle' && (
                                <motion.button onClick={loadGame} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="group relative px-10 py-4 bg-primary text-black font-bold font-mono text-sm tracking-widest uppercase rounded-lg overflow-hidden shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative z-10 flex items-center gap-3"><Gamepad2 size={20} />INITIALIZE GAME</span>
                                </motion.button>
                            )}

                            {(loadState === 'loading-script' || loadState === 'loading-data') && (
                                <div className="w-full max-w-sm">
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <Loader2 className="animate-spin text-primary" size={16} />
                                        <span className="text-xs font-mono text-zinc-400 tracking-widest uppercase">
                                            {loadState === 'loading-script' ? 'LOADING_ENGINE...' : `LOADING_DATA... ${progress}%`}
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                                            initial={{ width: '0%' }} animate={{ width: `${Math.max(progress, loadState === 'loading-script' ? 10 : 0)}%` }} transition={{ duration: 0.3 }} />
                                    </div>
                                    <div className="mt-4 flex justify-center gap-4 text-[9px] font-mono text-zinc-700">
                                        <span>0x{(progress * 2.55).toString(16).slice(0, 4).toUpperCase().padStart(4, '0')}</span>
                                        <span>SECTOR_{String(progress).padStart(3, '0')}</span>
                                    </div>
                                </div>
                            )}

                            {loadState === 'idle' && <p className="text-[10px] font-mono text-zinc-600">Download ~{game.buildSize} • Requires WebGL 2.0</p>}
                        </div>

                        {onClose && loadState === 'idle' && (
                            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {loadState === 'error' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0A0A0A] gap-6 px-6">
                    <AlertTriangle size={48} className="text-red-500" />
                    <div className="text-center max-w-md">
                        <h3 className="text-xl font-bold text-white mb-2">SYSTEM_ERROR</h3>
                        <p className="text-zinc-400 text-sm mb-4">{errorMsg}</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => { setLoadState('idle'); setProgress(0); }}
                                className="px-6 py-2 bg-primary text-black font-mono text-xs font-bold uppercase tracking-wider rounded hover:bg-white transition-colors flex items-center gap-2">
                                <RefreshCw size={14} />Retry
                            </button>
                            {onClose && <button onClick={onClose} className="px-6 py-2 bg-zinc-800 text-zinc-300 font-mono text-xs uppercase tracking-wider rounded hover:bg-zinc-700 transition-colors">Back</button>}
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {loadState === 'ready' && showControls && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                        className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center p-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                        <div className="flex items-center gap-3 pointer-events-auto">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-mono text-zinc-300 tracking-wider">{game.title}</span>
                            {game.status !== 'playable' && <span className="px-2 py-0.5 text-[9px] font-mono bg-amber-500/20 text-amber-400 rounded border border-amber-500/30 uppercase">{game.status}</span>}
                        </div>
                        <div className="flex items-center gap-1 pointer-events-auto">
                            <button onClick={() => setShowInfo(!showInfo)} className="p-2 text-zinc-400 hover:text-white transition-colors rounded hover:bg-white/10" title="Info"><Info size={16} /></button>
                            <button onClick={toggleMute} className="p-2 text-zinc-400 hover:text-white transition-colors rounded hover:bg-white/10">{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
                            <button onClick={toggleFullscreen} className="p-2 text-zinc-400 hover:text-white transition-colors rounded hover:bg-white/10">{isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}</button>
                            {onClose && <button onClick={() => { if (unityInstanceRef.current) { try { unityInstanceRef.current.Quit(); } catch {} } onClose(); }} className="p-2 text-zinc-400 hover:text-red-400 transition-colors rounded hover:bg-white/10 ml-2"><X size={16} /></button>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showInfo && loadState === 'ready' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="absolute top-12 right-3 z-40 w-64 bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow-xl pointer-events-auto">
                        <h4 className="text-xs font-mono text-primary uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Controls</h4>
                        <div className="space-y-2">
                            {game.controls?.keyboard?.map((ctrl, i) => (<div key={i} className="flex items-start gap-2 text-xs"><span className="text-zinc-500 font-mono shrink-0">⌨</span><span className="text-zinc-300">{ctrl}</span></div>))}
                            {game.controls?.mouse?.map((ctrl, i) => (<div key={i} className="flex items-start gap-2 text-xs"><span className="text-zinc-500 font-mono shrink-0">🖱</span><span className="text-zinc-300">{ctrl}</span></div>))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5 space-y-1">
                            <p className="text-[10px] text-zinc-600 font-mono">Build: {game.buildSize}</p>
                            {game.unityVersion && <p className="text-[10px] text-zinc-600 font-mono">Engine: Unity {game.unityVersion}</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};