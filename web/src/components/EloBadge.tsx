'use client';

// Tier Colors Mapping
const TIER_COLORS: Record<string, string> = {
    CHALLENGER: 'bg-[var(--color-rank-challenger)]/10 text-[var(--color-rank-challenger)] border-[var(--color-rank-challenger)]/40 shadow-[0_0_15px_-3px_var(--color-rank-challenger)]',
    GRANDMASTER: 'bg-[var(--color-rank-grandmaster)]/10 text-[var(--color-rank-grandmaster)] border-[var(--color-rank-grandmaster)]/40 shadow-[0_0_15px_-3px_var(--color-rank-grandmaster)]',
    MASTER: 'bg-[var(--color-rank-master)]/10 text-[var(--color-rank-master)] border-[var(--color-rank-master)]/40 shadow-[0_0_15px_-3px_var(--color-rank-master)]',
    DIAMOND: 'bg-[var(--color-rank-diamond)]/10 text-[var(--color-rank-diamond)] border-[var(--color-rank-diamond)]/40 shadow-[0_0_15px_-3px_var(--color-rank-diamond)]',
    EMERALD: 'bg-[var(--color-rank-emerald)]/10 text-[var(--color-rank-emerald)] border-[var(--color-rank-emerald)]/40 shadow-[0_0_15px_-3px_var(--color-rank-emerald)]',
    PLATINUM: 'bg-[var(--color-rank-platinum)]/10 text-[var(--color-rank-platinum)] border-[var(--color-rank-platinum)]/40 shadow-[0_0_15px_-3px_var(--color-rank-platinum)]',
    GOLD: 'bg-[var(--color-rank-gold)]/10 text-[var(--color-rank-gold)] border-[var(--color-rank-gold)]/40 shadow-[0_0_15px_-3px_var(--color-rank-gold)]',
    SILVER: 'bg-[var(--color-rank-silver)]/10 text-[var(--color-rank-silver)] border-[var(--color-rank-silver)]/40 shadow-[0_0_15px_-3px_var(--color-rank-silver)]',
    BRONZE: 'bg-[var(--color-rank-bronze)]/10 text-[var(--color-rank-bronze)] border-[var(--color-rank-bronze)]/40 shadow-[0_0_15px_-3px_var(--color-rank-bronze)]',
    IRON: 'bg-[var(--color-rank-iron)]/10 text-[var(--color-rank-iron)] border-[var(--color-rank-iron)]/40 shadow-[0_0_15px_-3px_var(--color-rank-iron)]',
    UNRANKED: 'bg-zinc-800/50 text-zinc-500 border-zinc-700',
};

export function EloBadge({ tier, rank, size = 'md' }: { tier: string; rank?: string; size?: 'sm' | 'md' | 'lg' }) {
    const colorClass = TIER_COLORS[tier] || TIER_COLORS.UNRANKED;

    // Size classes
    const sizeClasses = size === 'lg' ? 'px-4 py-1 text-sm' : 'px-2 py-0.5 text-xs';

    return (
        <span className={`${sizeClasses} rounded font-bold border ${colorClass} uppercase tracking-wider`}>
            {tier} {rank}
        </span>
    );
}
