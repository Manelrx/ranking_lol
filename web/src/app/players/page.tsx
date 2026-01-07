"use client";

import { useEffect, useState } from "react";
import { getSeasonRanking, RankingEntry } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { ChampionIcon } from "@/components/ui/ChampionIcon";
import { EloBadge } from "@/components/EloBadge";
import Link from "next/link";
import { Search, Trophy, TrendingUp } from "lucide-react";

export default function PlayersDirectoryPage() {
    const [players, setPlayers] = useState<RankingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                // Fetch Solo Ranking as default list
                const res = await getSeasonRanking("SOLO", 100);
                setPlayers(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const filtered = players.filter(p =>
        p.gameName.toLowerCase().includes(filter.toLowerCase()) ||
        p.tagLine.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 min-h-screen pb-20">
            {/* Header com Busca */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Jogadores</h2>
                    <p className="text-gray-400">Diretório oficial do servidor ({players.length})</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar invocador..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* Grid de Jogadores */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((player) => (
                        <Card key={player.puuid} variant="glass" className="p-0 overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
                            <Link href={`/player/${player.puuid}`}>
                                <div className="p-6 flex flex-col items-center text-center relative">
                                    {/* Hover Effect Background */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 to-indigo-500/0 group-hover:to-indigo-500/5 transition-all duration-500" />

                                    <PlayerAvatar
                                        profileIconId={player.profileIconId}
                                        summonerLevel={player.summonerLevel}
                                        size="xl"
                                        className="mb-4 shadow-2xl"
                                        ringColor={player.rank === 1 ? 'border-yellow-400 shadow-yellow-500/40' : undefined}
                                    />

                                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                                        {player.gameName}
                                    </h3>
                                    <span className="text-xs text-gray-500 font-mono mb-4">#{player.tagLine}</span>

                                    <div className="flex items-center gap-2 mb-6">
                                        <EloBadge tier={player.tier} rank={player.rankDivision} className="scale-90" />
                                        <div className="text-sm font-bold text-gray-300">
                                            {player.lp} <span className="text-[10px] text-gray-500 uppercase">PDL</span>
                                        </div>
                                    </div>

                                    {/* Main Champion Mini-Display */}
                                    {player.mainChampion && (
                                        <div className="absolute top-4 right-4">
                                            <ChampionIcon
                                                championId={player.mainChampion.id}
                                                size="sm"
                                                masteryLevel={player.mainChampion.level}
                                                className="opacity-50 group-hover:opacity-100 transition-opacity"
                                            />
                                        </div>
                                    )}

                                    {/* Stats Footer */}
                                    <div className="w-full grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Score</span>
                                            <span className="text-lg font-bold text-white">{player.totalScore.toFixed(0)}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Win Rate</span>
                                            <span className={`text-lg font-bold ${parseFloat(player.winRate) >= 50 ? 'text-emerald-400' : 'text-gray-400'}`}>
                                                {player.winRate}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}

            {filtered.length === 0 && !loading && (
                <div className="text-center py-20 text-gray-500">
                    Nenhum jogador encontrado com esse nome.
                </div>
            )}
        </div>
    );
}
