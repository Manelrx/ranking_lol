'use client';

import { motion } from 'framer-motion';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import Link from 'next/link';
import { RankingEntry } from '@/lib/api';
import { Crown } from 'lucide-react';

interface EliteHeroProps {
    top3: RankingEntry[];
    loading?: boolean;
}

export function EliteHero({ top3, loading }: EliteHeroProps) {
    if (loading) return <div className="h-[500px] w-full animate-pulse bg-white/5 rounded-3xl" />;

    // Ensure we have 3 slots even if data is missing
    const [top1, top2, top3Player] = [top3[0], top3[1], top3[2]];

    const Card = ({ player, rank, className, delay }: { player?: RankingEntry, rank: number, className?: string, delay: number }) => {
        if (!player) return <div className={`h-[400px] bg-white/5 rounded-3xl ${className}`} />;

        return (
            <motion.div
                className={`relative group bg-[#0f0f0f]/80 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden flex flex-col items-center justify-end p-8 transition-all hover:border-white/10 ${className}`}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }} // Bezier for smooth luxury feel
            >
                {/* Decoration */}
                <div className={`absolute inset-0 bg-gradient-to-b ${rank === 1 ? 'from-amber-400/10' : 'from-white/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                {/* Rank Number */}
                <div className="absolute top-4 right-6 text-8xl font-black text-white/5 select-none font-serif italic">
                    {rank}
                </div>

                {/* Avatar */}
                <div className="relative mb-6 z-10">
                    <PlayerAvatar
                        profileIconId={player.profileIconId}
                        size={'xl'}
                        className={`shadow-2xl transition-transform ${rank === 1 ? 'ring-4 ring-amber-500/20 scale-125' : 'ring-1 ring-white/10'}`}
                    />
                    {rank === 1 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                            <Crown className="w-8 h-8 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] fill-current" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="text-center relative z-10">
                    <Link href={`/player/${player.puuid}`} className="block">
                        <h3 className={`font-bold text-white tracking-tight hover:text-emerald-400 transition-colors ${rank === 1 ? 'text-3xl' : 'text-xl'}`}>
                            {player.gameName}
                        </h3>
                    </Link>
                    <p className={`font-mono text-sm uppercase tracking-widest mt-2 ${rank === 1 ? 'text-amber-400' : 'text-gray-500'}`}>
                        {player.lp} PDL
                    </p>
                </div>
            </motion.div>
        );
    };

    return (
        <section className="relative w-full py-20 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* 2nd Place */}
                <Card player={top2} rank={2} className="h-[420px] order-2 md:order-1" delay={0.2} />

                {/* 1st Place */}
                <Card player={top1} rank={1} className="h-[500px] border-t-4 border-t-amber-400/50 shadow-[0_0_50px_-10px_rgba(251,191,36,0.1)] order-1 md:order-2" delay={0.1} />

                {/* 3rd Place */}
                <Card player={top3Player} rank={3} className="h-[420px] order-3" delay={0.3} />
            </div>
        </section>
    );
}
