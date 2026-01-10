'use client';

import { EloBadge } from './EloBadge';
import { PlayerAvatar } from './ui/PlayerAvatar';
import { getTheme } from '@/lib/tier-themes';
import { motion } from 'framer-motion';
import { VitalityBadge } from './VitalityBadge';

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
    history?: any[];
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
    onQueueChange,
    history
}: PlayerHeaderProps) {
    const theme = getTheme(tier);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`relative overflow-hidden rounded-2xl ${theme.colors.cardBg} border-t ${theme.colors.border} p-8 mb-6 shadow-2xl group`}
        >
            {/* Background Glow - Dynamic based on tier */}
            <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br ${theme.gradients.hero} opacity-20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none animate-pulse-slow`} />

            {/* Subtle Noise Texture for "Realism" */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-8">
                    <div className="relative">
                        <PlayerAvatar
                            profileIconId={profileIconId}
                            summonerLevel={summonerLevel}
                            size="xl"
                            className={`w-28 h-28 shadow-2xl border-4 ${theme.colors.border}`}
                            tier={tier}
                        />
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-2 drop-shadow-xl">
                                {gameName}
                                <span className="text-2xl font-bold text-zinc-500 font-mono opacity-50">#{tagLine}</span>
                            </h1>
                            {/* Vitality Badge */}
                            {history && <VitalityBadge history={history} theme={theme} />}
                        </div>

                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            {/* Queue Selector Micro-Component */}
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 backdrop-blur-md">
                                <button
                                    onClick={() => onQueueChange('SOLO')}
                                    className={`relative px-4 py-1.5 rounded-md text-xs font-bold transition-all ${queueType === 'SOLO' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    {queueType === 'SOLO' && (
                                        <motion.div layoutId="queue-highlight" className={`absolute inset-0 ${theme.colors.background} border border-white/10 rounded-md shadow-lg`} />
                                    )}
                                    <span className="relative z-10">Solo/Duo</span>
                                </button>
                                <button
                                    onClick={() => onQueueChange('FLEX')}
                                    className={`relative px-4 py-1.5 rounded-md text-xs font-bold transition-all ${queueType === 'FLEX' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    {queueType === 'FLEX' && (
                                        <motion.div layoutId="queue-highlight" className={`absolute inset-0 bg-purple-900/40 border border-purple-500/30 rounded-md shadow-lg`} />
                                    )}
                                    <span className="relative z-10">Flex</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Rank Info */}
                <div className="flex flex-col items-center md:items-end gap-2">
                    <EloBadge tier={tier} rank={rank} size="lg" />
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className={`text-4xl font-mono font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b ${theme.gradients.text} filter drop-shadow-sm`}>
                            {lp}
                        </span>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest opacity-70">PDL</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
