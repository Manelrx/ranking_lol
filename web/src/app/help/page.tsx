"use client";

import { Trophy, Swords, Target, AlertCircle, TrendingUp, Info } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Hero */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-3">
                    <Info className="w-10 h-10 text-emerald-400" />
                    Como Funciona o Ranking?
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Entenda como sua nota (RiftScore) é calculada e como subir nas tabelas da temporada.
                </p>
            </div>

            {/* Score Calculation Logic */}
            <div className="grid gap-8 md:grid-cols-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        O RiftScore
                    </h2>
                    <p className="text-gray-300 leading-relaxed">
                        O RiftScore não é apenas KDA. Ele é uma análise completa do seu impacto no jogo, dividido em três pilares fundamentais. A nota máxima base é 100 pontos.
                    </p>

                    <div className="space-y-4">
                        <Scoreitem
                            icon={<Swords className="w-5 h-5 text-blue-400" />}
                            title="Combate (60 pts)"
                            desc="KDA, Dano Causado, Participação em Abates e Sobrevivência."
                        />
                        <Scoreitem
                            icon={<Target className="w-5 h-5 text-amber-400" />}
                            title="Objetivos (20 pts)"
                            desc="Torres, Dragões, Barão e Dano em Objetivos."
                        />
                        <Scoreitem
                            icon={<AlertCircle className="w-5 h-5 text-emerald-400" />}
                            title="Visão & Controle (20 pts)"
                            desc="Placar de Visão, Controle de Mapa e CS por minuto."
                        />
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                        Bonificações
                    </h2>
                    <p className="text-gray-300 leading-relaxed">
                        Além da nota base, você pode ganhar ou perder pontos extras dependendo do resultado da partida e conquistas especiais.
                    </p>

                    <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-3">
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold mt-1">+20%</span>
                            <span><b>Vitória:</b> Vencer a partida aplica um multiplicador na sua nota final.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs font-bold mt-1">+MVP</span>
                            <span><b>Destaque:</b> Ser o melhor da partida garante pontos de prestígio no ranking.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Lane Weights */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Pesos por Rota (Lane)</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <LaneCard lane="TOP" focus="Dano + Tank" />
                    <LaneCard lane="JUNGLE" focus="Objetivos + KDA" />
                    <LaneCard lane="MID" focus="Dano + Roaming" />
                    <LaneCard lane="ADC" focus="Farm + Dano" />
                    <LaneCard lane="SUPPORT" focus="Visão + Assistências" />
                </div>
                <p className="text-sm text-center text-gray-500">
                    * O algoritmo ajusta a cobrança de status dependendo da sua função no jogo.
                </p>
            </div>
        </div>
    );
}

function Scoreitem({ icon, title, desc }: any) {
    return (
        <div className="flex gap-4">
            <div className="p-2 bg-black/40 rounded-lg h-fit">{icon}</div>
            <div>
                <h3 className="font-bold text-white">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
            </div>
        </div>
    );
}

function LaneCard({ lane, focus }: any) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
            <div className="font-bold text-white mb-1">{lane}</div>
            <div className="text-xs text-emerald-400 font-medium">{focus}</div>
        </div>
    );
}
