"use client";

import { motion } from "framer-motion";
import { PdlGainEntry } from "@/lib/api";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { EloBadge } from "@/components/EloBadge";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import CountUp from "react-countup";

interface TheClimberProps {
    player: PdlGainEntry;
}

export function TheClimber({ player }: TheClimberProps) {
    const isPositive = player.pdlGain >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br border p-8 shadow-2xl ${isPositive
                ? "from-black to-emerald-950/20 border-emerald-500/20 shadow-emerald-900/10"
                : "from-black to-red-950/20 border-red-500/20 shadow-red-900/10"
                }`}
        >
            {/* Background Particles/Glow */}
            <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 ${isPositive ? "bg-emerald-500/5" : "bg-red-500/5"}`} />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

                {/* Left: Player Info */}
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className={`absolute -inset-1 rounded-full bg-gradient-to-r blur opacity-40 animate-pulse ${isPositive ? "from-emerald-500 to-teal-400" : "from-red-500 to-orange-400"}`} />
                        <div className={`relative scale-125 border-2 rounded-full p-1 bg-black ${isPositive ? "border-emerald-500/50" : "border-red-500/50"}`}>
                            <PlayerAvatar profileIconId={player.profileIconId} size="lg" />
                        </div>
                        <div className={`absolute -bottom-2 -right-2 text-black text-xs font-bold px-2 py-0.5 rounded-full border border-black shadow-lg ${isPositive ? "bg-emerald-500" : "bg-red-500"}`}>
                            #1
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`font-mono text-xs uppercase tracking-widest px-2 py-0.5 rounded ${isPositive ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                                {isPositive ? "Maior Alta" : "Maior Queda"}
                            </span>
                        </div>
                        <Link href={`/player/${player.puuid}`} className={`text-3xl font-[family-name:var(--font-outfit)] font-bold text-white transition-colors ${isPositive ? "hover:text-emerald-400" : "hover:text-red-400"}`}>
                            {player.gameName}
                        </Link>
                        <div className="text-gray-400 font-mono text-sm">#{player.tagLine}</div>
                    </div>
                </div>

                {/* Center: Evolution */}
                <div className="flex items-center gap-6 bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                    {player.startTier && (
                        <>
                            <div className="flex flex-col items-center opacity-70 scale-90">
                                <EloBadge tier={player.startTier} rank={player.startRank} />
                                <span className="text-xs text-gray-500 font-mono mt-2">{player.startLp} LP</span>
                            </div>

                            <motion.div
                                animate={{ x: [0, 5, 0], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className={isPositive ? "text-emerald-500" : "text-red-500"}
                            >
                                <ArrowRight size={24} />
                            </motion.div>
                        </>
                    )}

                    <div className="flex flex-col items-center scale-110">
                        <div className={isPositive ? "drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]"}>
                            <EloBadge tier={player.tier} rank={player.rank} />
                        </div>
                        <span className="text-sm text-white font-mono font-bold mt-2">{player.lp} LP</span>
                    </div>
                </div>

                {/* Right: Big Gain Number */}
                <div className="text-right">
                    <div className="text-sm text-zinc-400 font-mono mb-1 flex items-center justify-end gap-2">
                        <div className={isPositive ? "text-emerald-400" : "text-red-400"}>
                            {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        </div>
                        {isPositive ? "Ganho" : "Perda"}
                    </div>
                    <div className={`text-5xl font-[family-name:var(--font-outfit)] font-bold tracking-tighter tabular-nums drop-shadow-sm ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                        {isPositive ? "+" : ""}<CountUp end={player.pdlGain} duration={2.5} separator="," />
                    </div>
                    <div className={`text-xs font-[family-name:var(--font-outfit)] font-bold mt-1 uppercase tracking-widest ${isPositive ? "text-emerald-600/60" : "text-red-600/60"}`}>
                        Pontos
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
