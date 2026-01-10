"use client";

import { motion } from "framer-motion";
import { PdlGainEntry } from "@/lib/api";
import Link from "next/link";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { RankMigration } from "./RankMigration";
import { TrendArrow } from "./TrendArrow";
import CountUp from "react-countup";

interface TickerRowProps {
    player: PdlGainEntry;
    index: number;
}

export function TickerRow({ player, index }: TickerRowProps) {
    const isPositive = player.pdlGain > 0;
    const isNegative = player.pdlGain < 0;

    return (
        <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border-b border-white/5 hover:bg-white/5 transition-colors group"
        >
            {/* Rank */}
            <td className="p-4 text-center sticky left-0 bg-transparent">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 font-[family-name:var(--font-outfit)] font-bold text-xs text-zinc-400">
                    {index + 1}
                </div>
            </td>

            {/* Player (Ticker Symbol) */}
            <td className="p-4">
                <Link href={`/player/${player.puuid}`} className="flex items-center gap-3">
                    <PlayerAvatar profileIconId={player.profileIconId} size="sm" />
                    <div className="flex flex-col">
                        <span className="font-[family-name:var(--font-outfit)] font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-wider text-sm flex items-center gap-2">
                            {player.gameName}
                            {index < 3 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">#{player.tagLine}</span>
                    </div>
                </Link>
            </td>

            {/* Migration (Evolution) */}
            <td className="p-4">
                <RankMigration
                    startTier={player.startTier}
                    startRank={player.startRank}
                    endTier={player.tier}
                    endRank={player.rank}
                />
            </td>

            {/* Gain (Price) */}
            <td className="p-4 text-right">
                <div className={`text-lg font-[family-name:var(--font-outfit)] font-bold tracking-tighter ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-zinc-400'
                    }`}>
                    {isPositive ? '+' : ''}
                    <CountUp end={player.pdlGain} duration={2} preserveValue />
                </div>
            </td>

            {/* Trend Indicator */}
            <td className="p-4 text-center">
                <div className="flex justify-center">
                    <div className={`p-2 rounded-full ${isPositive ? 'bg-emerald-500/10' : isNegative ? 'bg-red-500/10' : 'bg-white/5'
                        }`}>
                        <TrendArrow trend={player.trend} />
                    </div>
                </div>
            </td>
        </motion.tr>
    );
}
