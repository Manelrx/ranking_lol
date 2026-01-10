import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Minus, Crown, Shield, TrendingUp, TrendingDown } from 'lucide-react';
import { RankingEntry, PdlGainEntry } from '@/lib/api';
import Link from 'next/link';

interface RankSnapshotProps {
    players: RankingEntry[];
    trends: PdlGainEntry[];
}

const DDRAGON_VERSION = '13.24.1';

export function RankSnapshot({ players, trends }: RankSnapshotProps) {
    if (!players || players.length === 0) return null;

    return (
        <section className="col-span-1 lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-[family-name:var(--font-outfit)] font-bold text-white uppercase tracking-wider">Top 10 Atual</h3>
                    <div className="h-px w-12 bg-white/10" />
                </div>
                <Link
                    href="/ranking/elo"
                    className="text-emerald-400 text-xs font-bold hover:text-emerald-300 transition-colors uppercase tracking-widest"
                >
                    Ver Tudo →
                </Link>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/50">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/[0.02] items-center">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-5">Jogador</div>
                    <div className="col-span-3 text-center">Elo</div>
                    <div className="col-span-3 text-right">PDL / Semana</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/5">
                    {players.slice(0, 10).map((player, idx) => {
                        const trend = trends.find(t => t.puuid === player.puuid);
                        const delta = trend ? trend.pdlGain : 0;

                        return (
                            <motion.div
                                key={player.puuid}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group relative"
                            >
                                {/* Rank Decor for Top 3 */}
                                {idx === 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />}
                                {idx === 1 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300" />}
                                {idx === 2 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-700" />}

                                {/* Rank Number */}
                                <div className="col-span-1 text-center font-mono font-bold text-gray-400 group-hover:text-white">
                                    {idx === 0 ? <Crown size={16} className="mx-auto text-yellow-500" /> : idx + 1}
                                </div>

                                {/* Profile & Name */}
                                <div className="col-span-5 flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden border border-white/10 group-hover:border-emerald-500 transition-colors shrink-0">
                                        <img
                                            src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${player.profileIconId || 29}.png`}
                                            alt={player.gameName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-[family-name:var(--font-outfit)] font-bold text-gray-200 group-hover:text-white truncate">
                                            {player.gameName}
                                        </div>
                                        <div className="text-xs text-gray-600 truncate">
                                            {player.mainChampion ? `Main ${player.mainChampion.name}` : 'Flex'}
                                        </div>
                                    </div>
                                </div>

                                {/* Tier Badge/Text */}
                                <div className="col-span-3 text-center">
                                    <span className="inline-block px-2 py-1 rounded bg-white/5 text-[10px] font-bold tracking-wider text-gray-300 border border-white/5">
                                        {player.tier} {player.rankDivision}
                                    </span>
                                </div>

                                {/* LP & Trend */}
                                <div className="col-span-3 flex flex-col items-end justify-center">
                                    <span className="text-emerald-400 font-mono text-sm font-bold">{player.lp} PDL</span>
                                    {delta !== 0 && (
                                        <span className={`text-[10px] font-bold flex items-center gap-1 ${delta > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {delta > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                            {delta > 0 ? '+' : ''}{delta}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
