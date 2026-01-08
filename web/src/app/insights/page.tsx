"use client";

import { useEffect, useState } from "react";
import { getHighlights, PeriodHighlights } from "@/lib/api";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { Card } from "@/components/ui/Card";
import { Trophy, Skull, Flame, TrendingUp, Swords, Calendar, Eye, Timer, Target, Layers, User } from "lucide-react";
import { motion } from "framer-motion";

import { useQueue } from "@/contexts/QueueContext";

export default function InsightsPage() {
    const [data, setData] = useState<PeriodHighlights | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'GENERAL'>('GENERAL');
    const { queueType } = useQueue();

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await getHighlights(queueType, period);
                setData(res);
            } catch (error) {
                console.error("Failed to load insights", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [period, queueType]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
                <Trophy className="w-16 h-16 text-gray-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Sem dados suficientes</h2>
                <p className="text-gray-400">Ainda não temos partidas suficientes neste período para gerar insights.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header & Toggle */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Flame className="w-8 h-8 text-orange-500" />
                        Insights da Temporada
                    </h1>
                    <p className="text-gray-400 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {data.periodLabel}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="bg-black/40 p-1 rounded-lg flex items-center border border-white/5 h-fit">
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
                </div>
            </div>

            {/* Top Section: Side By Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* MVP Section - Hero Card */}
                {data.mvp ? (
                    <Card className="relative overflow-hidden border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent p-6 md:p-8 flex flex-col justify-between h-full min-h-[280px]">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left h-full">
                            <div className="relative shrink-0">
                                <PlayerAvatar
                                    profileIconId={data.mvp.profileIconId}
                                    size="xl"
                                    ringColor="border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)]"
                                />
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg whitespace-nowrap">
                                    MVP da Season
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <h3 className="text-3xl md:text-3xl font-black text-white line-clamp-1">{data.mvp.gameName}</h3>
                                <p className="text-yellow-500 font-medium">Melhor Performance Geral</p>
                                <div className="inline-flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/30">
                                    <span className="text-2xl font-bold text-yellow-100">{data.mvp.value}</span>
                                    <span className="text-sm font-bold text-yellow-500 uppercase">{data.mvp.label}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="col-span-1 border border-white/5 rounded-xl bg-white/5 animate-pulse min-h-[280px]" />
                )}

                {/* Highest Score */}
                {data.highestScore ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 h-full">
                        <Card className="relative overflow-hidden border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent p-6 flex flex-col items-center justify-center text-center h-full min-h-[280px]">
                            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-6">✨ Maior Pontuação Única</h3>
                            <div className="relative mb-6">
                                <PlayerAvatar
                                    profileIconId={data.highestScore.profileIconId}
                                    size="lg"
                                    ringColor="border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                                />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1 line-clamp-1">{data.highestScore.gameName}</h2>
                            <div className="text-5xl font-black text-purple-200 mb-2">{data.highestScore.value}</div>
                            <p className="text-xs text-gray-500">Pontos em uma única partida</p>
                        </Card>
                    </div>
                ) : (
                    <div className="col-span-1 border border-white/5 rounded-xl bg-white/5 animate-pulse min-h-[280px]" />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {data.mono && (
                    <HighlightCard
                        title="Mono Champion"
                        icon={<User className="w-6 h-6 text-pink-400" />}
                        player={data.mono}
                        color="border-pink-500/50 bg-pink-500/5"
                        delay={0.05}
                        extraInfo={data.mono.championName}
                    />
                )}

                {data.objective && (
                    <HighlightCard
                        title="Controlador"
                        icon={<Target className="w-6 h-6 text-teal-400" />}
                        player={data.objective}
                        color="border-teal-500/50 bg-teal-500/5"
                        delay={0.08}
                    />
                )}

                {data.ocean && (
                    <HighlightCard
                        title="Versátil"
                        icon={<Layers className="w-6 h-6 text-cyan-400" />}
                        player={data.ocean}
                        color="border-cyan-500/50 bg-cyan-500/5"
                        delay={0.09}
                    />
                )}

                {data.kdaKing && (
                    <HighlightCard
                        title="Rei do KDA"
                        icon={<Swords className="w-6 h-6 text-blue-400" />}
                        player={data.kdaKing}
                        color="border-blue-500/50 bg-blue-500/5"
                        delay={0.1}
                    />
                )}

                {data.lpMachine && (
                    <HighlightCard
                        title="Máquina de PDL"
                        icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
                        player={data.lpMachine}
                        color="border-emerald-500/50 bg-emerald-500/5"
                        delay={0.2}
                    />
                )}

                {data.highestDmg && (
                    <HighlightCard
                        title="Dano Máximo"
                        icon={<Flame className="w-6 h-6 text-orange-500" />}
                        player={data.highestDmg}
                        color="border-orange-500/50 bg-orange-500/5"
                        delay={0.3}
                    />
                )}

                {data.visionary && (
                    <HighlightCard
                        title="Olhos de Águia"
                        icon={<Eye className="w-6 h-6 text-indigo-400" />}
                        player={data.visionary}
                        color="border-indigo-500/50 bg-indigo-500/5"
                        delay={0.35}
                    />
                )}

                {data.rich && (
                    <HighlightCard
                        title="Magnata"
                        icon={<Trophy className="w-6 h-6 text-yellow-300" />}
                        player={data.rich}
                        color="border-yellow-300/50 bg-yellow-300/5"
                        delay={0.36}
                    />
                )}

                {data.farmer && (
                    <HighlightCard
                        title="Agricultor"
                        icon={<Swords className="w-6 h-6 text-emerald-300" />}
                        player={data.farmer}
                        color="border-emerald-300/50 bg-emerald-300/5"
                        delay={0.37}
                    />
                )}

                {data.stomper && (
                    <HighlightCard
                        title="Speedrun"
                        icon={<Timer className="w-6 h-6 text-yellow-400" />}
                        player={data.stomper}
                        color="border-yellow-500/50 bg-yellow-500/5"
                        delay={0.4}
                    />
                )}

                {data.mostActive && (
                    <HighlightCard
                        title="Viciado"
                        icon={<Calendar className="w-6 h-6 text-purple-400" />}
                        player={data.mostActive}
                        color="border-purple-500/50 bg-purple-500/5"
                        delay={0.45}
                    />
                )}

                {data.survivor && (
                    <HighlightCard
                        title="Sobrevivente"
                        icon={<Skull className="w-6 h-6 text-gray-400" />}
                        player={data.survivor}
                        color="border-gray-500/50 bg-gray-500/5"
                        delay={0.5}
                    />
                )}
            </div>
        </div>
    );
}

function HighlightCard({ title, icon, player, color, delay, extraInfo }: any) {
    if (!player) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <Card className={`p-6 border ${color} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black/40 rounded-lg backdrop-blur-sm">
                            {icon}
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-bold text-gray-200 leading-none">{title}</h3>
                            {extraInfo && (
                                <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wide mt-1">
                                    {extraInfo}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Badge */}
                    <div className="bg-black/60 px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-gray-400 text-right">
                        <div>{player.label}</div>
                        <div className="text-white font-bold">{player.value}</div>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <PlayerAvatar profileIconId={player.profileIconId} size="lg" className="ring-2 ring-white/10 group-hover:ring-white/30 transition-all shrink-0" />
                    <div className="min-w-0">
                        <div className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                            {player.gameName}
                        </div>
                        <div className="text-sm text-gray-500 font-mono truncate">#{player.tagLine}</div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
