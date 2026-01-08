"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPlayerHistory, getPlayerInsights, getPdlEvolution, PlayerHistory, PlayerInsights, MatchHistoryEntry, PdlEvolution } from "@/lib/api";
import { PdlChart } from "@/components/PdlChart";
import { MatchHistoryTable } from "@/components/MatchHistoryTable";
import { MatchDetailsSidePanel } from "@/components/MatchDetailsSidePanel";
import { PlayerHeader } from "@/components/PlayerHeader";
import { StatsGrid } from "@/components/StatsGrid";
import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useQueue } from "@/contexts/QueueContext";

export default function PlayerProfile({ params }: { params: Promise<{ puuid: string }> }) {
    const { puuid } = use(params);
    const router = useRouter();
    const { queueType, setQueueType } = useQueue();

    // Use global context instead of URL params
    const queue = queueType;

    const [evolution, setEvolution] = useState<PdlEvolution | null>(null);
    const [history, setHistory] = useState<PlayerHistory | null>(null);
    const [insights, setInsights] = useState<PlayerInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<MatchHistoryEntry | null>(null);

    // Pagination & Sort State
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<'asc' | 'desc'>('desc');
    const [chartFilter, setChartFilter] = useState<'ALL' | 'MONTHLY' | 'WEEKLY'>('ALL');

    const getFilteredHistory = () => {
        if (!history) return [];
        const now = new Date();
        const cutoff = new Date();

        if (chartFilter === 'WEEKLY') cutoff.setDate(now.getDate() - 7);
        if (chartFilter === 'MONTHLY') cutoff.setDate(now.getDate() - 30);
        if (chartFilter === 'ALL') return history.history;

        return history.history.filter(h => new Date(h.date) >= cutoff);
    };

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                // Fetch with Pagination (Limit 10 default in API, but explicit here good practice)
                const [hData, iData, eData] = await Promise.all([
                    getPlayerHistory(puuid, queue),
                    getPlayerInsights(puuid, queue, page, 10, sort), // Pass page & sort
                    getPdlEvolution(puuid, queue)
                ]);
                setHistory(hData);
                setInsights(iData);
                setEvolution(eData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [puuid, queue, page, sort]);

    // Reset page on queue/sort change
    useEffect(() => {
        setPage(1);
    }, [queue, sort]);

    const handleQueueChange = (newQueue: 'SOLO' | 'FLEX') => {
        setQueueType(newQueue);
        // Optional: Update URL for sharing purposes, but source of truth is Context
        // router.push(`?queue=${newQueue.toLowerCase()}`, { scroll: false });
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p className="mt-4 text-emerald-500 font-bold tracking-widest text-xs uppercase animate-pulse">Carregando Perfil...</p>
            </div>
        );
    }

    if (!history || !insights) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Jogador não encontrado</h2>
                <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                    Voltar ao Ranking
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 animate-in fade-in duration-500">
            {/* 1. Header Principal */}
            <PlayerHeader
                displayName={history.player.displayName}
                gameName={history.player.displayName.split('#')[0]}
                tagLine={history.player.displayName.split('#')[1]}
                tier={history.player.tier}
                rank={history.player.rank}
                lp={history.player.lp}
                profileIconId={history.player.profileIconId}
                summonerLevel={history.player.summonerLevel}
                queueType={queue}
                onQueueChange={handleQueueChange}
            />

            {/* 2. Main Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
                {/* Left Column (Stats & History) */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Stats Cards */}
                    <StatsGrid stats={insights.stats} />

                    {/* Evolution Chart */}
                    <Card variant="glass" className="h-[400px]">
                        <div className="flex items-center justify-between mb-6 p-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Evolução de PDL</h3>
                                    <p className="text-xs text-gray-500">Histórico de Ranqueada</p>
                                </div>
                            </div>

                            {/* Chart Controls */}
                            <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg">
                                {(['ALL', 'MONTHLY', 'WEEKLY'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setChartFilter(f)}
                                        className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${chartFilter === f
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'text-gray-500 hover:text-white'
                                            }`}
                                    >
                                        {f === 'ALL' ? 'GERAL' : f === 'MONTHLY' ? 'MÊS' : 'SEMANA'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <PdlChart history={getFilteredHistory()} />
                        </div>
                    </Card>
                </div>

                {/* Right Column (Future Modules or Sticky Ads/Info) */}
                <div className="xl:col-span-1 space-y-6">
                    <Card className="h-full min-h-[400px] flex flex-col">
                        <div className="p-4 border-b border-white/5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="text-amber-400">★</span> Maestrias
                            </h3>
                        </div>
                        <div className="flex-1 p-4 space-y-4">
                            {history.masteries && history.masteries.length > 0 ? (
                                history.masteries.map((m) => (
                                    <div key={m.championId} className="flex items-center gap-4 p-2 hover:bg-white/5 rounded-lg transition-colors">
                                        <div className="relative">
                                            {/* Assuming ChampionIcon handles the image URL logic */}
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/30">
                                                <img
                                                    src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${m.championId}.png`}
                                                    alt={m.championName}
                                                    className="w-full h-full object-cover transform scale-110"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/29.png';
                                                    }}
                                                />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-gray-900 text-xs font-bold px-1.5 rounded-full border border-gray-700">
                                                {m.level}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-200">{m.championName}</p>
                                            <p className="text-xs text-emerald-400 font-mono">
                                                {new Intl.NumberFormat('pt-BR').format(m.points)} pts
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-10">
                                    <p>Nenhuma maestria encontrada.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* History Section */}
            <section className="mt-8 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        Histórico de Partidas
                    </h3>

                    {/* Sort Controls */}
                    <div className="flex items-center gap-2 bg-black/30 p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => setSort('desc')}
                            className={`px-3 py-1 text-xs font-bold rounded ${sort === 'desc' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            Recente
                        </button>
                        <button
                            onClick={() => setSort('asc')}
                            className={`px-3 py-1 text-xs font-bold rounded ${sort === 'asc' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            Antigo
                        </button>
                    </div>
                </div>
                <MatchHistoryTable
                    history={insights.history}
                    onSelectMatch={setSelectedMatch}
                />

                {/* Pagination Controls */}
                {insights.pagination && insights.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 py-4">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold text-white transition-colors"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-400 font-mono">
                            Página <span className="text-white">{page}</span> de <span className="text-white">{insights.pagination.totalPages}</span>
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(insights.pagination!.totalPages, p + 1))}
                            disabled={page >= insights.pagination.totalPages}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold text-white transition-colors"
                        >
                            Próximo
                        </button>
                    </div>
                )}
            </section>

            {/* Side Panel Overlay */}
            <MatchDetailsSidePanel
                match={selectedMatch}
                onClose={() => setSelectedMatch(null)}
            />
        </div>
    );
}
