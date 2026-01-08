"use client";

import { useEffect, useState } from "react";
import { getPdlGainRanking, PdlGainEntry } from "@/lib/api";
import { EloBadge } from "@/components/EloBadge";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useQueue } from "@/contexts/QueueContext";

export default function PdlRankingPage() {
    const { queueType } = useQueue();
    const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'GENERAL'>('GENERAL');

    const [data, setData] = useState<PdlGainEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await getPdlGainRanking(queueType, 20, period);
                setData(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [queueType, period]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <TrendingUp className="w-8 h-8 text-emerald-400" />
                        </div>
                        Maiores Subidas (PDL)
                    </h2>
                    <p className="text-gray-400 mt-2 ml-14">
                        Quem está escalando (ou caindo) mais rápido no período.
                    </p>
                </div>

                <div className="bg-black/40 p-1 rounded-lg flex items-center border border-white/5 h-fit self-start md:self-center">
                    <button
                        onClick={() => setPeriod('GENERAL')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${period === 'GENERAL' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
                    >
                        Geral
                    </button>
                    <button
                        onClick={() => setPeriod('MONTHLY')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${period === 'MONTHLY' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
                    >
                        Mensal
                    </button>
                    <button
                        onClick={() => setPeriod('WEEKLY')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${period === 'WEEKLY' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
                    >
                        Semanal
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="grid gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 w-full bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <Card className="overflow-hidden border-0 bg-transparent p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-gray-500 text-xs font-bold uppercase tracking-wider bg-black/20">
                                    <th className="p-4 w-16 text-center">#</th>
                                    <th className="p-4">Jogador</th>
                                    <th className="p-4">Elo Atual</th>
                                    <th className="p-4 text-right">Saldo</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.map((player, index) => (
                                    <tr key={player.puuid} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-center font-mono text-gray-500 font-bold">{index + 1}</td>
                                        <td className="p-4">
                                            <Link href={`/player/${player.puuid}`} className="flex items-center gap-3">
                                                <PlayerAvatar profileIconId={player.profileIconId} size="sm" />
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                        {player.gameName}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono">#{player.tagLine}</div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <EloBadge tier={player.tier} rank={player.rank} />
                                                    <span className="text-gray-400 text-sm font-mono">
                                                        {player.lp} PDL
                                                    </span>
                                                </div>
                                                {/* Hover Start Details */}
                                                {player.startTier && (
                                                    <div className="text-[10px] text-gray-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Iniciou: {player.startTier} {player.startRank} ({player.startLp} PDL)
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span
                                                className={`text-lg font-bold font-mono tracking-tight ${player.pdlGain > 0 ? "text-emerald-400" : player.pdlGain < 0 ? "text-red-400" : "text-gray-400"}`}
                                                title={`Iniciou em: ${player.startTier} ${player.startRank} (${player.startLp} PDL)`}
                                            >
                                                {player.pdlGain > 0 ? "+" : ""}{player.pdlGain}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-1">PDL</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center">
                                                {player.pdlGain > 0 ? (
                                                    <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-400 border border-emerald-500/20">
                                                        <ArrowUp className="w-4 h-4" />
                                                    </div>
                                                ) : player.pdlGain < 0 ? (
                                                    <div className="p-1.5 bg-red-500/10 rounded text-red-400 border border-red-500/20">
                                                        <ArrowDown className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div className="p-1.5 bg-gray-500/10 rounded text-gray-400 border border-gray-500/20">
                                                        <Minus className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                Sem dados suficientes para este período.
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
