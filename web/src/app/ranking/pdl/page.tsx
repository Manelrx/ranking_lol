"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPdlGainRanking, PdlGainEntry } from "@/lib/api";
import { EloBadge } from "@/components/EloBadge";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function PdlRankingPage() {
    const searchParams = useSearchParams();
    const queue = (searchParams.get("queue")?.toUpperCase() === "FLEX" ? "FLEX" : "SOLO") as "SOLO" | "FLEX";

    const [data, setData] = useState<PdlGainEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await getPdlGainRanking(queue);
                setData(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [queue]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                    </div>
                    Maiores Subidas (PDL)
                </h2>
                <p className="text-gray-400 mt-2 ml-14">
                    Quem está escalando (ou caindo) mais rápido na Temporada.
                </p>
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
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index < 3 ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-400'}`}>
                                                    {player.gameName.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                        {player.gameName}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono">#{player.tagLine}</div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="p-4">
                                            <EloBadge tier={player.tier} rank={player.rank} />
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`text-lg font-bold font-mono tracking-tight ${player.pdlGain > 0 ? "text-emerald-400" : player.pdlGain < 0 ? "text-red-400" : "text-gray-400"}`}>
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
                                Sem dados suficientes para calcular ganhos na temporada.
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
