'use client';
import { EloBadge } from './EloBadge';
import { PlayerAvatar } from './ui/PlayerAvatar';

interface PlayerHeaderProps {
    displayName: string;
    gameName: string;
    tagLine: string;
    tier: string;
    rank: string;
    lp: number;
    profileIconId?: number | null;
    summonerLevel?: number | null;
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
    profileIconId,
    summonerLevel,
    queueType,
    onQueueChange
}: PlayerHeaderProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl glass border-t border-[rgba(255,255,255,0.08)] p-8 mb-6 shadow-2xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <PlayerAvatar
                            profileIconId={profileIconId}
                            summonerLevel={summonerLevel}
                            size="xl"
                            className="w-24 h-24 shadow-2xl border-4 border-white/5"
                            ringColor={tier === 'CHALLENGER' ? 'border-yellow-400' : undefined}
                        />
                        {/* Queue Indicator Badge */}
                        <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--color-surface)] ${queueType === 'SOLO' ? 'bg-blue-500' : 'bg-purple-500'}`}>
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
