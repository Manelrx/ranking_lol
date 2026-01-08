"use client";

import { useEffect, useState, useMemo } from "react";
// import { useSearchParams } from "next/navigation"; // Removed
import { getSeasonRanking, RankingEntry } from "@/lib/api";
import { RankingTable } from "@/components/RankingTable";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Trophy, Medal, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueue } from "@/contexts/QueueContext"; // Added

// Defined Tiers for Tabs
const TIERS = [
    // ... (TIERS array remains same)
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

// ... (getEloValue helper remains same)
const getEloValue = (p: RankingEntry) => {
    const tierScores: Record<string, number> = {
        CHALLENGER: 90000, GRANDMASTER: 80000, MASTER: 70000,
        DIAMOND: 60000, EMERALD: 50000, PLATINUM: 40000,
        GOLD: 30000, SILVER: 20000, BRONZE: 10000, IRON: 0
    };
    const rankScores: Record<string, number> = { I: 300, II: 200, III: 100, IV: 0, "": 0 };

    // Base Tier Score + Rank Score + LP
    return (tierScores[p.tier] || 0) + (rankScores[p.rankDivision] || 0) + p.lp;
};

export default function EloRankingPage() {
    // const searchParams = useSearchParams(); // Removed
    // const queue = ... // Removed
    const { queueType } = useQueue(); // Added

    const [players, setPlayers] = useState<RankingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL");
    const [viewMode, setViewMode] = useState<"TIER" | "POINTS">("TIER");

    useEffect(() => {
        setLoading(true);
        // Using getSeasonRanking to get everyone and filter client-side for "Instant" feel
        getSeasonRanking(queueType).then((res) => { // Updated to queueType
            setPlayers(res);
            setLoading(false);
        });
    }, [queueType]); // Updated dependency

    const filteredPlayers = useMemo(() => {
        if (viewMode === "POINTS") {
            // Sort by Total Score Descending
            return [...players].sort((a, b) => b.totalScore - a.totalScore);
        }

        // Mode TIER: Sort by Elo Value
        let sorted = [...players].sort((a, b) => getEloValue(b) - getEloValue(a));

        if (activeTab === "ALL") return sorted;
        return sorted.filter(p => p.tier === activeTab);
    }, [players, activeTab, viewMode]);

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
                        Ranking {viewMode === "TIER" ? "por Elo" : "Global"}
                    </h2>
                    <p className="text-gray-400 mt-1">
                        {viewMode === "TIER"
                            ? "Classificação detalhada por divisões competitivas."
                            : "Classificação geral baseada no RiftScore."}
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-full md:w-auto items-end">
                    {/* View Mode Toggle */}
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
                        <button
                            onClick={() => setViewMode("TIER")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "TIER"
                                ? "bg-emerald-600/90 text-white shadow-lg shadow-emerald-500/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            Por Elo
                        </button>
                        <button
                            onClick={() => setViewMode("POINTS")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "POINTS"
                                ? "bg-emerald-600/90 text-white shadow-lg shadow-emerald-500/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            Por Pontos
                        </button>
                    </div>

                    {/* Tabs Component (Only in TIER mode) */}
                    {viewMode === "TIER" && (
                        <Tabs
                            tabs={TIERS}
                            activeTab={activeTab}
                            onChange={setActiveTab}
                            className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar"
                        />
                    )}
                </div>
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
                                key={topPlayer.puuid + activeTab + viewMode}
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
                                                Líder {viewMode === "TIER" ? (activeTab === "ALL" ? "Geral" : activeTab) : "Global"}
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
