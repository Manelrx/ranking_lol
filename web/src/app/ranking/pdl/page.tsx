"use client";

import { useEffect, useState } from "react";
import { getPdlGainRanking, PdlGainEntry } from "@/lib/api";
import { useQueue } from "@/contexts/QueueContext";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Calendar, RefreshCcw } from "lucide-react";
import { TheClimber } from "@/components/pdl/TheClimber";
import { TickerRow } from "@/components/pdl/TickerRow";
import { Card } from "@/components/ui/Card";

export default function PdlRankingPage() {
    const { queueType } = useQueue();
    const [period, setPeriod] = useState<'SEASON' | 'MONTH' | 'WEEK'>('SEASON');

    const [data, setData] = useState<PdlGainEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                // Calculate Start Date based on Period
                let startDate: string | undefined = undefined;
                const now = new Date();

                if (period === 'WEEK') {
                    // Last 7 days
                    const d = new Date(now);
                    d.setDate(d.getDate() - 7);
                    startDate = d.toISOString();
                } else if (period === 'MONTH') {
                    // Last 30 days
                    const d = new Date(now);
                    d.setDate(d.getDate() - 30);
                    startDate = d.toISOString();
                }

                // For SEASON, we don't send startDate, API handles it (since beginning of time/season)

                const res = await getPdlGainRanking(queueType, 50, startDate);
                setData(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [queueType, period]);

    const topClimber = data.length > 0 ? data[0] : null;
    const movers = data.length > 0 ? data.slice(1) : [];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
                <div>
                    <h2 className="text-4xl font-[family-name:var(--font-outfit)] font-bold text-white tracking-tighter flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            <TrendingUp className="w-8 h-8 text-emerald-400" />
                        </div>
                        JOGADORES EM ALTA
                    </h2>
                    <p className="text-zinc-400 mt-2 font-mono text-sm max-w-lg">
                        Rastreamento em tempo real dos maiores ganhadores de PDL.
                        <span className="text-emerald-500"> Quem está subindo?</span>
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5 backdrop-blur-md">
                    <button
                        onClick={() => setPeriod('SEASON')}
                        className={`relative px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all overflow-hidden ${period === 'SEASON' ? 'text-black' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {period === 'SEASON' && (
                            <motion.div layoutId="period-bg" className="absolute inset-0 bg-emerald-500" />
                        )}
                        <span className="relative z-10">Temporada</span>
                    </button>

                    <button
                        onClick={() => setPeriod('MONTH')}
                        className={`relative px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all overflow-hidden ${period === 'MONTH' ? 'text-black' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {period === 'MONTH' && (
                            <motion.div layoutId="period-bg" className="absolute inset-0 bg-emerald-500" />
                        )}
                        <span className="relative z-10">Mês</span>
                    </button>

                    <button
                        onClick={() => setPeriod('WEEK')}
                        className={`relative px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all overflow-hidden ${period === 'WEEK' ? 'text-black' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {period === 'WEEK' && (
                            <motion.div layoutId="period-bg" className="absolute inset-0 bg-emerald-500" />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Calendar size={12} /> Semana
                        </span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-4">
                    <div className="h-64 w-full bg-white/5 rounded-2xl animate-pulse" />
                    <div className="h-96 w-full bg-white/5 rounded-2xl animate-pulse delay-75" />
                </div>
            ) : (
                <>
                    {/* The Climber (Hero) */}
                    {topClimber && (
                        <TheClimber player={topClimber} />
                    )}

                    {data.length === 0 && (
                        <div className="p-20 text-center border border-dashed border-white/10 rounded-2xl">
                            <RefreshCcw className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-400">Sem dados de movimentação.</h3>
                            <p className="text-gray-600">Nenhum jogador registrou ganho de PDL neste período.</p>
                        </div>
                    )}

                    {/* Ticker List */}
                    {movers.length > 0 && (
                        <Card className="overflow-hidden border border-white/5 bg-black/20 backdrop-blur-sm shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-gray-500 text-[10px] font-bold uppercase tracking-widest bg-white/5">
                                            <th className="p-4 w-16 text-center">#</th>
                                            <th className="p-4">Ativo (Jogador)</th>
                                            <th className="p-4">Evolução</th>
                                            <th className="p-4 text-right">Saldo (PDL)</th>
                                            <th className="p-4 text-center">Tendência</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <AnimatePresence>
                                            {movers.map((player, idx) => (
                                                <TickerRow key={player.puuid} player={player} index={idx + 1} /> // Index +1 because top 1 is separate
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
