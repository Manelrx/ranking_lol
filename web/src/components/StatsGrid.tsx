'use client';
import { Globe, Swords, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from './ui/AnimatedCounter';
import { TierTheme } from '@/lib/tier-themes';

interface StatsProps {
    stats: {
        winRate: string;
        avgKda: string;
        bestScore: number;
        worstScore: number;
        totalGames: number;
    },
    theme: TierTheme;
    className?: string;
}

export function StatsGrid({ stats, theme, className }: StatsProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, scale: 0.9 },
        show: { opacity: 1, scale: 1 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 ${className || ''}`}
        >
            <StatItem
                variants={item}
                icon={<Globe size={18} />}
                label="Win Rate"
                value={Number(stats.winRate.replace('%', ''))}
                suffix="%"
                subtext={`${stats.totalGames} partidas`}
                theme={theme}
                isPercent
            />
            <StatItem
                variants={item}
                icon={<Swords size={18} />}
                label="KDA Médio"
                value={Number(stats.avgKda)}
                subtext="Performance de Combate"
                theme={theme}
            />
            <StatItem
                variants={item}
                icon={<TrendingUp size={18} />}
                label="Melhor Score"
                value={stats.bestScore}
                subtext="Recorde da Temporada"
                theme={theme}
                colorClass="text-emerald-400"
                glowColor="rgba(16, 185, 129, 0.2)"
            />
            <StatItem
                variants={item}
                icon={<TrendingDown size={18} />}
                label="Pior Score"
                value={stats.worstScore}
                subtext="Partida para esquecer"
                theme={theme}
                colorClass="text-rose-400"
                glowColor="rgba(244, 63, 94, 0.2)"
            />
        </motion.div>
    );
}

function StatItem({ icon, label, value, subtext, theme, variants, suffix, colorClass, glowColor, isPercent }: any) {
    return (
        <motion.div
            variants={variants}
            whileHover={{ y: -5 }}
            className={`
                relative overflow-hidden ${theme.styles.borderRadius} p-6
                ${theme.colors.cardBg}
                group shadow-lg transition-all duration-300
            `}
        >
            {/* Background Gradient Effect */}
            <div
                className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-[40px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40`}
                style={{ background: glowColor || `linear-gradient(to bottom right, ${theme.colors.accent.replace('text-', '')}, transparent)` }}
            />
            {/* If no specific glow, use theme gradients logic via CSS variable or hardcode mapped from theme. 
                Simpler: Use the theme.gradients.hero passed down? Or just rely on the accent color map.
            */}

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${theme.colors.textSecondary} mb-4`}>
                    <span className={`p-1.5 rounded-lg bg-black/30 group-hover:bg-white/10 transition-colors ${theme.colors.accent}`}>
                        {icon}
                    </span>
                    {label}
                </div>

                <div>
                    <div className={`text-4xl font-black tracking-tight flex items-baseline gap-1 ${colorClass || 'text-white'}`}>
                        <AnimatedCounter value={value} />
                        {suffix && <span className="text-xl opacity-50 font-medium">{suffix}</span>}
                    </div>
                    <div className={`text-[10px] font-bold mt-1 ${theme.colors.text} opacity-60`}>
                        {subtext}
                    </div>
                </div>

                {/* Progress Bar for Win Rate */}
                {isPercent && (
                    <div className="w-full h-1 bg-black/30 rounded-full mt-4 overflow-hidden">
                        <div
                            className={`h-full rounded-full ${value >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(value, 100)}%` }}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
