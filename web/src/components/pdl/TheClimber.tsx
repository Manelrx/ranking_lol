"use client";

import { motion } from "framer-motion";
import { PdlGainEntry } from "@/lib/api";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { EloBadge } from "@/components/EloBadge";
import { TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import CountUp from "react-countup";

interface TheClimberProps {
    player: PdlGainEntry;
}

export function TheClimber({ player }: TheClimberProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black to-emerald-950/20 border border-emerald-500/20 p-8 shadow-2xl shadow-emerald-900/10"
        >
            {/* Background Particles/Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

                {/* Left: Player Info */}
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 blur opacity-40 animate-pulse" />
                        <div className="relative scale-125 border-2 border-emerald-500/50 rounded-full p-1 bg-black">
                            <PlayerAvatar profileIconId={player.profileIconId} size="lg" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black text-xs font-bold px-2 py-0.5 rounded-full border border-black shadow-lg">
                            #1
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
                                Destaque
                            </span>
                        </div>
                        <Link href={`/player/${player.puuid}`} className="text-3xl font-bold text-white hover:text-emerald-400 transition-colors">
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
                                className="text-emerald-500"
                            >
                                <ArrowRight size={24} />
                            </motion.div>
                        </>
                    )}

                    <div className="flex flex-col items-center scale-110">
                        <div className="drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            <EloBadge tier={player.tier} rank={player.rank} />
                        </div>
                        <span className="text-sm text-white font-mono font-bold mt-2">{player.lp} LP</span>
                    </div>
                </div>

                {/* Right: Big Gain Number */}
                <div className="text-right">
                    <div className="text-sm text-gray-400 font-mono mb-1 flex items-center justify-end gap-2">
                        <TrendingUp size={16} className="text-emerald-400" />
                        Ganho
                    </div>
                    <div className="text-5xl font-bold text-emerald-400 tracking-tighter tabular-nums drop-shadow-sm">
                        +<CountUp end={player.pdlGain} duration={2.5} separator="," />
                    </div>
                    <div className="text-xs text-emerald-600/60 font-mono mt-1 uppercase tracking-widest">
                        Pontos
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
