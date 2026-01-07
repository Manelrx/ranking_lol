'use client';
import { Globe, Swords, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsProps {
    stats: {
        winRate: string;
        avgKda: string;
        bestScore: number;
        worstScore: number;
        totalGames: number;
    }
}

export function StatsGrid({ stats }: StatsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatItem
                icon={<Globe size={16} />}
                label="Win Rate"
                value={stats.winRate}
                subtext={`${stats.totalGames} partidas`}
                trend="neutral"
            />
            <StatItem
                icon={<Swords size={16} />}
                label="KDA Médio"
                value={stats.avgKda}
                subtext="Média Geral"
                trend="neutral"
            />
            <StatItem
                icon={<TrendingUp size={16} />}
                label="Melhor Score"
                value={stats.bestScore}
                subtext="High Score"
                trend="positive"
                valueColor="text-[var(--color-success)]"
            />
            <StatItem
                icon={<TrendingDown size={16} />}
                label="Pior Score"
                value={stats.worstScore}
                subtext="Low Score"
                trend="negative"
                valueColor="text-[var(--color-danger)]"
            />
        </div>
    );
}

function StatItem({ icon, label, value, subtext, trend, valueColor }: any) {
    return (
        <div className="glass p-5 rounded-xl transition-all duration-300 hover:bg-white/5 group border border-transparent hover:border-white/10">
            <div className="flex items-center gap-2 mb-3 text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-wider group-hover:text-[var(--color-primary)] transition-colors">
                {icon}
                {label}
            </div>
            <div className={`text-2xl font-bold text-white mb-1 ${valueColor || ''}`}>
                {value}
            </div>
            <div className="text-xs font-medium text-[var(--color-neutral)] opacity-70">
                {subtext}
            </div>
        </div>
    );
}
