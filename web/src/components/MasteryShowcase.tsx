'use client';

import { TierTheme } from "@/lib/tier-themes";
import { motion } from "framer-motion";
import { Award, Star } from "lucide-react";

interface Mastery {
    championId: number;
    championName: string;
    level: number;
    points: number;
}

export function MasteryShowcase({ masteries, theme }: { masteries: Mastery[], theme: TierTheme }) {
    if (!masteries || masteries.length === 0) return null;

    const top3 = masteries.slice(0, 3);
    const rest = masteries.slice(3, 8); // Next 5

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${theme.styles.borderRadius} overflow-hidden ${theme.colors.cardBg} flex flex-col`}
        >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Award className={theme.colors.accent} size={18} />
                    <h3 className={`text-lg font-bold ${theme.colors.text}`}>Maestrias</h3>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    O Melhor
                </div>
            </div>

            {/* Top 3 Showcase - Visual Horizontal Cards */}
            <div className="grid grid-cols-3 gap-1 p-1 h-48">
                {top3.map((m, i) => (
                    <div key={m.championId} className="relative group overflow-hidden rounded-lg cursor-default">
                        {/* Splash Art Info */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src={`https://cdn.communitydragon.org/latest/champion/${m.championId}/splash-art/centered`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                                alt={m.championName}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 inset-x-0 p-3 z-10">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-black text-white uppercase tracking-wider drop-shadow-md">{m.championName}</span>
                                {i === 0 && <Star size={12} className="text-yellow-400 fill-yellow-400 animate-pulse" />}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-zinc-300">
                                <span className="bg-black/50 px-1.5 py-0.5 rounded border border-white/10 text-white">M{m.level}</span>
                                <span className={theme.colors.accent}>{new Intl.NumberFormat('en', { notation: 'compact' }).format(m.points)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Compact List for the rest */}
            <div className="flex-1 p-4 space-y-2 bg-black/20">
                {rest.map((m) => (
                    <div key={m.championId} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors group">
                        <img
                            src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${m.championId}.png`}
                            className="w-8 h-8 rounded-full border border-white/10 group-hover:border-white/30 grayscale group-hover:grayscale-0 transition-all"
                        />
                        <div className="flex-1 flex justify-between items-center">
                            <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 uppercase">{m.championName}</span>
                            <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400">{new Intl.NumberFormat('en', { notation: 'compact' }).format(m.points)}</span>
                        </div>
                    </div>
                ))}
                {masteries.length > 8 && (
                    <div className="text-center pt-2">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase hover:text-white cursor-pointer transition-colors">Ver Mais Campeões</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
