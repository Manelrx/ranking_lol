'use client';
import { User } from 'lucide-react';
import { EloBadge } from './EloBadge';

interface PlayerHeaderProps {
    displayName: string;
    gameName: string;
    tagLine: string;
    tier: string;
    rank: string;
    lp: number;
    queueType: 'SOLO' | 'FLEX';
    onQueueChange: (queue: 'SOLO' | 'FLEX') => void;
}

export function PlayerHeader({
    displayName,
    gameName,
    tagLine,
    tier,
    rank,
    lp,
    queueType,
    onQueueChange
}: PlayerHeaderProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl glass border-t border-[rgba(255,255,255,0.08)] p-8 mb-6 shadow-2xl">
            {/* Background Glow based on Tier? Maybe later. For now generic premium glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-hover)] p-[2px] shadow-lg ring-1 ring-white/10">
                            <div className="w-full h-full rounded-full bg-[var(--color-surface)] flex items-center justify-center overflow-hidden">
                                <span className="text-3xl font-bold text-[var(--color-text-secondary)] group-hover:text-white transition-colors">
                                    {gameName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                        {/* Queue Indicator Badge */}
                        <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--color-surface)] ${queueType === 'SOLO' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                            <span className="text-[10px] font-bold text-white mb-[1px]">
                                {queueType === 'SOLO' ? 'S' : 'F'}
                            </span>
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-2">
                            {gameName}
                            <span className="text-xl font-medium text-[var(--color-text-secondary)] font-mono">#{tagLine}</span>
                        </h1>
                        <div className="mt-3 flex items-center gap-2 justify-center md:justify-start">
                            <div className="flex bg-[var(--color-surface-hover)] p-1 rounded-lg border border-white/5">
                                <button
                                    onClick={() => onQueueChange('SOLO')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${queueType === 'SOLO' ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Solo/Duo
                                </button>
                                <button
                                    onClick={() => onQueueChange('FLEX')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${queueType === 'FLEX' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Flex
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Rank Info */}
                <div className="flex flex-col items-center md:items-end gap-2">
                    <EloBadge tier={tier} rank={rank} size="lg" />
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-mono font-bold text-white tracking-tighter">{lp}</span>
                        <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">PDL</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
