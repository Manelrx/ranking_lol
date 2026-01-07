"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPlayerHistory, getPlayerInsights, PlayerHistory, PlayerInsights, MatchHistoryEntry } from "@/lib/api";
import { PdlChart } from "@/components/PdlChart";
import { MatchHistoryTable } from "@/components/MatchHistoryTable";
import { MatchDetailsSidePanel } from "@/components/MatchDetailsSidePanel";
import { PlayerHeader } from "@/components/PlayerHeader";
import { StatsGrid } from "@/components/StatsGrid";
import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function PlayerProfile({ params }: { params: Promise<{ puuid: string }> }) {
    const { puuid } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const queueParam = searchParams.get("queue")?.toUpperCase();
    const queue = (queueParam === "FLEX" ? "FLEX" : "SOLO") as "SOLO" | "FLEX";

    const [history, setHistory] = useState<PlayerHistory | null>(null);
    const [insights, setInsights] = useState<PlayerInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<MatchHistoryEntry | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const [hData, iData] = await Promise.all([
                    getPlayerHistory(puuid, queue),
                    getPlayerInsights(puuid, queue)
                ]);
                setHistory(hData);
                setInsights(iData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [puuid, queue]);

    const handleQueueChange = (newQueue: 'SOLO' | 'FLEX') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("queue", newQueue.toLowerCase());
        router.push(`?${params.toString()}`);
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
                        <div className="flex items-center gap-3 mb-6 p-2">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Evolução de PDL</h3>
                                <p className="text-xs text-gray-500">Histórico da Temporada Atual</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <PdlChart history={history.history} />
                        </div>
                    </Card>
                </div>

                {/* Right Column (Future Modules or Sticky Ads/Info) 
                    For now, leaving blank or maybe moving Match History here? 
                    Actually, let's keep match history full width below for better readability.
                    Or put a "Best Champions" block here if we had it.
                    Let's just use it for a placeholder "Champion Mastery" or leave empty to keep centered focus.
                    Actually, better to stretch grid if empty. But let's keep 2/3 + 1/3 structure.
                */}
                <div className="xl:col-span-1 space-y-6">
                    <Card className="h-full min-h-[400px] flex items-center justify-center border-dashed border-white/10 bg-transparent">
                        <div className="text-center text-gray-600">
                            <p className="text-sm font-bold uppercase tracking-widest">Maestria de Campeões</p>
                            <p className="text-xs mt-1">Em Breve</p>
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
                </div>
                <MatchHistoryTable
                    history={insights.history}
                    onSelectMatch={setSelectedMatch}
                />
            </section>

            {/* Side Panel Overlay */}
            <MatchDetailsSidePanel
                match={selectedMatch}
                onClose={() => setSelectedMatch(null)}
            />
        </div>
    );
}
