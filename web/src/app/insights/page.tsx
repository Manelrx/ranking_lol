"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getHighlights, WeeklyHighlights, HighlightPlayer } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { Trophy, TrendingUp, Zap, Skull, Swords, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function InsightsPage() {
    const searchParams = useSearchParams();
    const queue = (searchParams.get("queue")?.toUpperCase() === "FLEX" ? "FLEX" : "SOLO") as "SOLO" | "FLEX";

    const [data, setData] = useState<WeeklyHighlights | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getHighlights(queue).then((res) => {
            setData(res);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [queue]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!data) { // Or error state
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
                <Trophy className="w-16 h-16 text-gray-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Sem dados suficientes</h2>
                <p className="text-gray-400">Ainda não temos partidas suficientes nesta semana para gerar insights.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                    Insights da Semana
                </h2>
                <p className="text-gray-400 mt-1">
                    Destaques e recordes da semana atual ({data.periodLabel}).
                </p>
            </div>

            {/* MVP Section - Hero Card */}
            {data.mvp && (
                <Card className="relative overflow-hidden border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent p-6 md:p-8">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="relative">
                            <PlayerAvatar
                                profileIconId={data.mvp.profileIconId}
                                size="xl"
                                ringColor="border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)]"
                            />
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                MVP
                            </div>
                        </div>

                        <div className="flex-1 space-y-2">
                            <h3 className="text-4xl font-black text-white">{data.mvp.gameName}</h3>
                            <p className="text-yellow-500 font-medium">O Melhor Desempenho da Semana</p>
                            <div className="inline-flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/30">
                                <span className="text-2xl font-bold text-yellow-100">{data.mvp.value}</span>
                                <span className="text-sm font-bold text-yellow-500 uppercase">{data.mvp.label}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Secondary Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                {data.kdaKing && (
                    <HighlightCard
                        title="KDA King"
                        player={data.kdaKing}
                        icon={<Skull className="w-6 h-6 text-red-500" />}
                        color="red"
                    />
                )}

                {data.highestDmg && (
                    <HighlightCard
                        title="Dano Máximo"
                        player={data.highestDmg}
                        icon={<Swords className="w-6 h-6 text-orange-500" />}
                        color="orange"
                    />
                )}

                {data.lpMachine && ( // Assuming backend sends lpMachine properly
                    <HighlightCard
                        title="Máquina de PDL"
                        player={data.lpMachine as any} // Typing loose for now
                        icon={<Zap className="w-6 h-6 text-cyan-400" />}
                        color="cyan"
                    />
                )}

                {data.mostActive && (
                    <HighlightCard
                        title="Inimigo do Sono"
                        player={data.mostActive}
                        icon={<Activity className="w-6 h-6 text-purple-500" />}
                        color="purple"
                    />
                )}

            </div>
        </div>
    );
}

function HighlightCard({ title, player, icon, color }: { title: string, player: HighlightPlayer, icon: React.ReactNode, color: string }) {
    const colorClasses: Record<string, string> = {
        red: "border-red-500/20 bg-red-500/5 hover:border-red-500/40",
        orange: "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40",
        cyan: "border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/40",
        purple: "border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40",
    };

    return (
        <Card className={`group relative overflow-hidden transition-all duration-300 ${colorClasses[color]}`}>
            <div className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="flex items-center gap-2 text-gray-400 uppercase text-xs font-bold tracking-widest">
                    {icon}
                    {title}
                </div>

                <PlayerAvatar profileIconId={player.profileIconId} size="lg" className="group-hover:scale-110 transition-transform duration-300" />

                <div>
                    <div className="font-bold text-white text-lg leading-none mb-1">{player.gameName}</div>
                    <div className="text-xs text-gray-500">#{player.tagLine}</div>
                </div>

                <div className="w-full bg-white/5 rounded-lg py-2 border border-white/5 group-hover:bg-white/10 transition-colors">
                    <span className="text-xl font-bold text-white block">{player.value}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{player.label}</span>
                </div>
            </div>
        </Card>
    );
}
