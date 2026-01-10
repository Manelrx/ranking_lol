'use client';

import { MatchHistoryEntry } from "@/lib/api";
import { TierTheme } from "@/lib/tier-themes";
import { Coffee, Flame, Skull, Zap, Ghost } from "lucide-react";
import { motion } from "framer-motion";

interface VitalityBadgeProps {
    history: MatchHistoryEntry[];
    theme: TierTheme;
}

export function VitalityBadge({ history, theme }: VitalityBadgeProps) {
    if (!history || history.length === 0) return null;

    // Logic
    const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastMatch = new Date(sorted[0].date);
    const now = new Date();

    const diffDays = Math.floor((now.getTime() - lastMatch.getTime()) / (1000 * 60 * 60 * 24));

    // 1. Inactivity (> 3 days)
    if (diffDays >= 3) {
        return (
            <Badge
                icon={Ghost}
                label="Enferrujado"
                subtext={`Sem jogar há ${diffDays} dias`}
                color="text-zinc-500"
                borderColor="border-zinc-700"
                bg="bg-zinc-950/50"
            />
        );
    }

    // 2. Grinder (> 10 games last 24h)
    const matchesLast24h = sorted.filter(m => (now.getTime() - new Date(m.date).getTime()) < 24 * 60 * 60 * 1000).length;
    if (matchesLast24h >= 10) {
        return (
            <Badge
                icon={Skull}
                label="Viciado"
                subtext={`${matchesLast24h} jogos hoje`}
                color="text-rose-500"
                borderColor="border-rose-900"
                bg="bg-rose-950/30"
            />
        );
    }

    // 3. Streak
    const recentStreak = getStreak(sorted);
    if (recentStreak >= 3) {
        return (
            <Badge
                icon={Flame}
                label="Em Chamas"
                subtext={`${recentStreak} vitórias seguidas`}
                color="text-orange-500"
                borderColor="border-orange-500/50"
                bg="bg-orange-950/30"
            />
        );
    }
    if (recentStreak <= -3) {
        return (
            <Badge
                icon={Zap}
                label="Tiltado"
                subtext={`${Math.abs(recentStreak)} derrotas seguidas`}
                color="text-purple-400"
                borderColor="border-purple-500/50"
                bg="bg-purple-950/30"
            />
        );
    }

    // Default: Casual
    return (
        <Badge
            icon={Coffee}
            label="Tranquilo"
            subtext="Jogando suave"
            color="text-emerald-400"
            borderColor="border-emerald-900"
            bg="bg-emerald-950/30"
        />
    );
}

function getStreak(matches: MatchHistoryEntry[]) {
    if (!matches.length) return 0;
    let streak = 0;
    const isWin = matches[0].isVictory;

    for (const m of matches) {
        if (m.isVictory === isWin) {
            streak = isWin ? streak + 1 : streak - 1;
        } else {
            break;
        }
    }
    return streak;
}

function Badge({ icon: Icon, label, subtext, color, borderColor, bg }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${borderColor} ${bg} backdrop-blur-md shadow-lg`}
        >
            <div className={`p-2 rounded-full bg-black/40 ${color}`}>
                <Icon size={18} />
            </div>
            <div>
                <div className={`text-sm font-black uppercase ${color}`}>{label}</div>
                <div className="text-[10px] text-zinc-400 font-bold">{subtext}</div>
            </div>
        </motion.div>
    )
}
