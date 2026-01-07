"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getSeasonRanking, RankingEntry } from "@/lib/api";
import { RankingTable } from "@/components/RankingTable";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Trophy, Medal, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Defined Tiers for Tabs
const TIERS = [
    { id: "ALL", label: "Todos" },
    { id: "CHALLENGER", label: "Challenger" },
    { id: "GRANDMASTER", label: "Grandmaster" },
    { id: "MASTER", label: "Master" },
    { id: "DIAMOND", label: "Diamond" },
    { id: "EMERALD", label: "Emerald" },
    { id: "PLATINUM", label: "Platinum" },
    { id: "GOLD", label: "Gold" },
    { id: "SILVER", label: "Silver" },
    { id: "BRONZE", label: "Bronze" },
    { id: "IRON", label: "Iron" },
];

export default function EloRankingPage() {
    const searchParams = useSearchParams();
    const queue = (searchParams.get("queue")?.toUpperCase() === "FLEX" ? "FLEX" : "SOLO") as "SOLO" | "FLEX";

    const [players, setPlayers] = useState<RankingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL");

    useEffect(() => {
        setLoading(true);
        // Using getSeasonRanking to get everyone and filter client-side for "Instant" feel
        getSeasonRanking(queue).then((res) => {
            setPlayers(res);
            setLoading(false);
        });
    }, [queue]);

    const filteredPlayers = useMemo(() => {
        if (activeTab === "ALL") return players;
        return players.filter(p => p.tier === activeTab);
    }, [players, activeTab]);

    const topPlayer = useMemo(() => {
        if (filteredPlayers.length > 0) return filteredPlayers[0];
        return null;
    }, [filteredPlayers]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        Ranking por Elo
                    </h2>
                    <p className="text-gray-400 mt-1">
                        Classificação detalhada por divisões competitivas.
                    </p>
                </div>

                {/* Tabs Component */}
                <Tabs
                    tabs={TIERS}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar"
                />
            </div>

            {loading ? (
                <div className="space-y-4">
                    <div className="h-48 w-full bg-white/5 rounded-2xl animate-pulse" />
                    <div className="h-96 w-full bg-white/5 rounded-2xl animate-pulse" />
                </div>
            ) : (
                <div className="space-y-6">

                    {/* Top 1 Highlight Card (Only if players exist) */}
                    <AnimatePresence mode="wait">
                        {topPlayer && (
                            <motion.div
                                key={topPlayer.puuid + activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card variant="glass" className="relative overflow-hidden border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-transparent">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-2">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-900 flex items-center justify-center border-4 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                                                <Crown className="w-10 h-10 text-white" />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-lg border border-yellow-400">
                                                TOP 1
                                            </div>
                                        </div>

                                        <div className="text-center md:text-left flex-1">
                                            <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-1">
                                                Líder {activeTab === "ALL" ? "Geral" : activeTab}
                                            </h3>
                                            <div className="text-3xl font-bold text-white mb-1">
                                                {topPlayer.gameName}
                                            </div>
                                            <div className="text-sm text-gray-400 font-mono">
                                                {topPlayer.totalScore.toFixed(0)} Pontos • {topPlayer.winRate} Winrate
                                            </div>
                                        </div>

                                        <div className="hidden md:block pr-8">
                                            <Medal className="w-16 h-16 text-white/5" />
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Table */}
                    <RankingTable data={filteredPlayers} />
                </div>
            )}
        </div>
    );
}
