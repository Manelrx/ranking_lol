'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function TrendIcon({ trend }: { trend: 'UP' | 'DOWN' | 'SAME' | string }) {
    if (trend === 'UP') return <TrendingUp size={16} className="text-[var(--color-success)]" />;
    if (trend === 'DOWN') return <TrendingDown size={16} className="text-[var(--color-danger)]" />;
    return <Minus size={16} className="text-[var(--color-neutral)]" />;
}
