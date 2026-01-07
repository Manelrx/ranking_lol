"use client";

import { useEffect, useState } from "react";
import { getHighlights, WeeklyHighlights } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import Link from "next/link";
import { Trophy, Flame, Eye, Sword } from "lucide-react";
import { clsx } from 'clsx';

function HighlightCard({ title, icon: Icon, data, color }: { title: string, icon: any, data: any, color: string }) {
    if (!data) return (
        <Card variant="glass" className="h-[300px] flex flex-col items-center justify-center text-gray-500">
            <Icon size={48} className="mb-4 opacity-20" />
            <p>Dados insuficientes</p>
        </Card>
    );

    return (
        <Card variant="glass" className="relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            {/* Background Gradient */}
            <div className={clsx("absolute top-0 right-0 w-64 h-64 rounded-full filter blur-[80px] opacity-10 -translate-y-1/2 translate-x-1/2", color)} />

            <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-4">
                <div className={clsx("p-3 rounded-2xl bg-white/5 border border-white/10 shadow-xl", color.replace('bg-', 'text-'))}>
                    <Icon size={32} />
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">{title}</h3>
                    <div className="text-xs text-gray-600">Esta Semana</div>
                </div>

                <Link href={`/player/${data.puuid}`} className="flex flex-col items-center group-hover:scale-105 transition-transform duration-300">
                    <PlayerAvatar profileIconId={data.profileIconId} size="lg" className="shadow-2xl mb-3" />
                    <span className="text-xl font-black text-white">{data.gameName}</span>
                    <span className="text-xs text-gray-500">#{data.tagLine}</span>
                </Link>

                <div className="pt-4 border-t border-white/5 w-full">
                    <div className="text-3xl font-black text-white tracking-tighter">
                        {data.value}
                    </div>
                    <div className="text-xs font-bold uppercase text-[var(--color-primary)]">
                        {data.label}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default function PerformancePage() {
    const [stats, setStats] = useState<WeeklyHighlights | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getHighlights('SOLO').then(setStats).finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen pb-20 animate-in fade-in duration-500 space-y-8">
            <div className="text-center space-y-2 mb-12">
                <h2 className="text-4xl font-black text-white tracking-tight">Destaques da Semana</h2>
                <p className="text-gray-400">Os melhores invocadores do servidor nos últimos 7 dias.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-[350px] bg-white/5 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <HighlightCard
                        title="MVP (KDA)"
                        icon={Trophy}
                        data={stats?.mvp}
                        color="bg-yellow-500"
                    />
                    <HighlightCard
                        title="Máquina de Dano"
                        icon={Sword}
                        data={stats?.highestDmg}
                        color="bg-red-500"
                    />
                    <HighlightCard
                        title="Visão de Mapa"
                        icon={Eye}
                        data={stats?.bestVision}
                        color="bg-emerald-500"
                    />
                    <HighlightCard
                        title="Sem Parar"
                        icon={Flame}
                        data={stats?.mostActive}
                        color="bg-orange-500"
                    />
                </div>
            )}

            {/* Placeholder for Leaderboards Table (Top DPS, Top Tank, etc) - Step 4 */}
            <div className="mt-12 bg-white/5 rounded-3xl p-1 text-center text-gray-600 border border-white/5 border-dashed h-48 flex items-center justify-center">
                <p>Rankings detalhados por função (Top, Jungle, Mid...) em breve.</p>
            </div>
        </div>
    );
}
