'use client';

import { PdlGainEntry } from '@/lib/api';
// import { TrendUp } from '@/components/icons/TrendUp'; // Removed invalid import
import { ArrowUp, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface MomentumListProps {
    trends: PdlGainEntry[];
    loading?: boolean;
}

export function MomentumList({ trends, loading }: MomentumListProps) {
    if (loading) return <div className="max-w-4xl mx-auto h-64 bg-white/5 rounded-2xl animate-pulse" />;

    // Sort by highest gain
    const sorted = [...trends].sort((a, b) => b.pdlGain - a.pdlGain).slice(0, 5);

    return (
        <section className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <ArrowUp className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Momentum <span className="text-gray-500 text-sm font-normal ml-2">Top Gainers (24h)</span></h2>
            </div>

            <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                {sorted.length > 0 ? sorted.map((player) => {
                    const isPromoted = player.startTier && player.tier !== player.startTier;

                    return (
                        <div key={player.puuid} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
                            {/* Left: Player */}
                            <Link href={`/player/${player.puuid}`} className="flex items-center gap-4 flex-1">
                                <div className="font-mono text-gray-500 w-6">{(trends.indexOf(player) + 1).toString().padStart(2, '0')}</div>

                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                            {player.gameName}
                                        </span>
                                        {isPromoted && (
                                            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded animate-pulse">
                                                PROMOVIDO
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500">{player.tier} {player.rank}</span>
                                </div>
                            </Link>

                            {/* Right: Stats */}
                            <div className="text-right">
                                <div className="text-emerald-400 font-bold font-mono">+{player.pdlGain} LP</div>
                                <div className="text-xs text-gray-600">Total: {player.lp} LP</div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="p-8 text-center text-gray-500">Nenhum dado de ascensão registrado recentemente.</div>
                )}
            </div>
        </section>
    );
}
