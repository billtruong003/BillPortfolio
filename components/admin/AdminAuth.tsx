"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, AlertTriangle, Eye, EyeOff, Terminal } from "lucide-react";

interface AdminAuthProps {
    onAuthenticated: () => void;
}

async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export const AdminAuth = ({ onAuthenticated }: AdminAuthProps) => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (attempts >= 5) {
            setError("ACCESS_LOCKED // Too many attempts. Refresh page.");
            return;
        }

        setIsChecking(true);
        setError("");

        try {
            const hash = await sha256(password);
            const expectedHash = process.env.NEXT_PUBLIC_ADMIN_HASH;

            if (!expectedHash) {
                setError("SYSTEM_ERROR // Admin hash not configured in ENV");
                setIsChecking(false);
                return;
            }

            await new Promise(r => setTimeout(r, 500 + Math.random() * 500));

            if (hash === expectedHash.toLowerCase()) {
                sessionStorage.setItem("admin_auth", Date.now().toString());
                onAuthenticated();
            } else {
                setAttempts(prev => prev + 1);
                setError(`AUTH_FAILED // Invalid credentials [${attempts + 1}/5]`);
                setPassword("");
            }
        } catch {
            setError("CRYPTO_ERROR // Hash computation failed");
        } finally {
            setIsChecking(false);
        }
    }, [password, attempts, onAuthenticated]);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-red-500/3 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-primary/3 rounded-full blur-[100px]" />
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: "linear-gradient(rgba(255,50,50,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,50,50,0.3) 1px, transparent 1px)",
                    backgroundSize: "60px 60px"
                }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <Shield size={28} className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white font-mono tracking-tight">CMD_CENTER</h1>
                        <p className="text-[10px] font-mono text-zinc-600 tracking-[0.3em] uppercase">Restricted Access Zone</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-zinc-900/80 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                            <Terminal size={14} className="text-emerald-500" />
                            <span className="text-xs font-mono text-zinc-500">root@system:~$</span>
                            <span className="text-xs font-mono text-emerald-400 animate-pulse">authenticate</span>
                        </div>

                        <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
                            Access Key
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter passphrase..."
                                autoFocus
                                disabled={attempts >= 5 || isChecking}
                                className="w-full pl-11 pr-12 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm placeholder:text-zinc-700 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-30"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 mt-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                            >
                                <AlertTriangle size={14} className="text-red-500 shrink-0" />
                                <span className="text-xs font-mono text-red-400">{error}</span>
                            </motion.div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!password || isChecking || attempts >= 5}
                        className="w-full py-3.5 bg-primary/10 hover:bg-primary text-primary hover:text-black font-mono text-sm font-bold uppercase tracking-[0.2em] rounded-xl border border-primary/30 hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isChecking ? (
                            <>
                                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                VERIFYING...
                            </>
                        ) : (
                            <>
                                <Shield size={16} />
                                AUTHENTICATE
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-[9px] font-mono text-zinc-700 leading-relaxed">
                        SHA-256 CLIENT-SIDE VERIFICATION • SESSION-BASED AUTH<br />
                        ALL ACCESS ATTEMPTS ARE LOGGED
                    </p>
                </div>

                <div className="mt-8 text-center">
                    <a href="/" className="text-xs font-mono text-zinc-600 hover:text-primary transition-colors">
                        ← RETURN_TO_BASE
                    </a>
                </div>
            </motion.div>
        </div>
    );
};