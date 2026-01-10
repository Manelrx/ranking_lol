"use client";

import { Trophy, Swords, Target, AlertCircle, Info, ShieldAlert, Scale, Map, Crosshair, Crown } from "lucide-react";
import { clsx } from 'clsx';
import { motion } from "framer-motion";

export default function HelpPage() {
    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-16 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="text-center space-y-6 pt-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-[family-name:var(--font-outfit)] font-bold uppercase tracking-widest">
                    <Info className="w-4 h-4" />
                    Central de Conhecimento
                </div>
                <h1 className="text-5xl md:text-7xl font-[family-name:var(--font-outfit)] font-black text-white tracking-tighter">
                    Como funciona o <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">RiftScore</span>?
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Um algoritmo de 0 a 100 projetado para medir impacto real, não apenas KDA.
                </p>
            </div>

            {/* Golden Rule: 60-30-10 */}
            <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-black p-8 md:p-12">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 space-y-12">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-[family-name:var(--font-outfit)] font-bold text-white flex items-center justify-center gap-2">
                            <Scale className="w-8 h-8 text-emerald-500" />
                            A Fórmula de Ouro: 60-30-10
                        </h2>
                        <p className="text-gray-400">Todo jogo é avaliado baseado em três pilares fundamentais.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <PillarCard
                            title="60%"
                            subtitle="Performance de Rota"
                            desc="Comparação direta com seu oponente de lane. Se você joga Top e destrói o Top inimigo em Farm e Dano, você pontua alto."
                            color="from-blue-500/20 to-blue-600/5"
                            icon={<Swords className="w-8 h-8 text-blue-400" />}
                        />
                        <PillarCard
                            title="30%"
                            subtitle="Objetivos & Mapa"
                            desc="Soma fixa por objetivos conquistados. Dragões, Arautos, Barões e Torres. Quem foca objetivo, sobe no ranking."
                            color="from-amber-500/20 to-amber-600/5"
                            icon={<Target className="w-8 h-8 text-amber-400" />}
                        />
                        <PillarCard
                            title="10%"
                            subtitle="Disciplina"
                            desc="Simples: Morra menos que seu oponente. 10 pontos se morrer menos, 5 se empatar, 0 se morrer mais."
                            color="from-red-500/20 to-red-600/5"
                            icon={<ShieldAlert className="w-8 h-8 text-red-400" />}
                        />
                    </div>

                    {/* New Section: Points by Score */}
                    <div className="pt-8 border-t border-white/10">
                        <h3 className="text-2xl font-[family-name:var(--font-outfit)] font-bold text-white text-center mb-6">Pontos por Pontuação</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="text-gray-400 space-y-4">
                                <p>
                                    <strong className="text-white">Seu Score = Seus Pontos.</strong> A pontuação final da partida (0-100) é somada diretamente ao seu Ranking Global.
                                </p>
                                <p>
                                    Não importa se você venceu ou perdeu: se jogou bem, pontua alto. Se jogou mal e foi carregado, pontua baixo.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <ScoreExample grade="S+" score="95-100" pts="Excelente" color="text-yellow-400 border-yellow-500/20 bg-yellow-500/10" />
                                <ScoreExample grade="A" score="80-94" pts="Ótimo" color="text-emerald-400 border-emerald-500/20 bg-emerald-500/10" />
                                <ScoreExample grade="B" score="60-79" pts="Médio" color="text-blue-400 border-blue-500/20 bg-blue-500/10" />
                                <ScoreExample grade="C/D" score="0-59" pts="Baixo" color="text-gray-400 border-gray-500/20 bg-gray-500/10" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Detailed Lane Weights */}
            <section className="space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-[family-name:var(--font-outfit)] font-bold text-white flex items-center gap-3">
                            <Crosshair className="w-8 h-8 text-cyan-400" />
                            Pesos por Rota
                        </h2>
                        <p className="text-gray-400 mt-2">O sistema entende que um Suporte não deve farmar e um Tank não precisa dar dano massivo.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <LaneCard role="TOP" p1="15 pts Farm" p2="10 pts Dano" extra="5pts Tank" />
                    <LaneCard role="JUNGLE" p1="15 pts Obj" p2="10 pts Visão" extra="5pts KP" />
                    <LaneCard role="MID" p1="15 pts Dano" p2="10 pts Farm" extra="5pts Roam" />
                    <LaneCard role="ADC" p1="15 pts Farm" p2="10 pts Dano" extra="5pts Kill" />
                    <LaneCard role="SUPPORT" p1="15 pts Visão" p2="10 pts KP" extra="5pts Assist" />
                </div>
            </section>

            {/* Objectives Detail */}
            <section className="space-y-8">
                <h2 className="text-3xl font-[family-name:var(--font-outfit)] font-bold text-white flex items-center gap-3">
                    <Crown className="w-8 h-8 text-yellow-400" />
                    Tabela de Objetivos
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <ObjDetail title="Torre" points="10 pts" icon="🏰" />
                    <ObjDetail title="Dragão" points="10 pts" icon="🐉" />
                    <ObjDetail title="Barão" points="5 pts" icon="👾" />
                    <ObjDetail title="Arauto" points="5 pts" icon="👁️" />
                </div>
            </section>

            {/* Defeat Logic */}
            <section className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="p-4 bg-red-500/20 rounded-2xl">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-[family-name:var(--font-outfit)] font-bold text-white">A Regra da Derrota</h3>
                        <p className="text-gray-300">
                            A vitória é soberana. Em caso de derrota, aplicam-se redutores severos para desencorajar o jogo egoísta "For Fun".
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-black/30 p-4 rounded-xl border border-red-500/10">
                                <span className="block text-red-400 font-[family-name:var(--font-outfit)] font-bold mb-1">Cap de 40 Pontos</span>
                                <span className="text-sm text-gray-400">Pontuação máxima possível na derrota.</span>
                            </div>
                            <div className="bg-black/30 p-4 rounded-xl border border-red-500/10">
                                <span className="block text-red-400 font-[family-name:var(--font-outfit)] font-bold mb-1">Anti-AFK (15% KP)</span>
                                <span className="text-sm text-gray-400">Participação menor que 15% zera a nota.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="text-center text-gray-500 text-sm pt-12 pb-6 border-t border-white/5">
                <p>RiftScore © 2024. Desenvolvido para elevar o nível do servidor.</p>
            </footer>
        </div>
    );
}

function PillarCard({ title, subtitle, desc, color, icon }: any) {
    return (
        <div className={clsx("relative p-6 rounded-2xl border border-white/5 bg-gradient-to-br", color)}>
            <div className="mb-4 bg-black/20 w-fit p-3 rounded-xl backdrop-blur-sm">{icon}</div>
            <div className="text-4xl font-[family-name:var(--font-outfit)] font-black text-white mb-1">{title}</div>
            <div className="text-sm font-[family-name:var(--font-outfit)] font-bold opacity-80 uppercase tracking-wider mb-3">{subtitle}</div>
            <p className="text-sm opacity-70 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}

function LaneCard({ role, p1, p2, extra }: any) {
    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors group">
            <h3 className="text-xl font-[family-name:var(--font-outfit)] font-black text-white mb-4 tracking-tight">{role}</h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Foco #1</span>
                    <span className="font-bold text-emerald-400">{p1}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Foco #2</span>
                    <span className="font-bold text-cyan-400">{p2}</span>
                </div>
                <div className="h-px bg-white/5 my-2" />
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Extra</span>
                    <span className="font-medium text-purple-400">{extra}</span>
                </div>
            </div>
        </div>
    );
}

function ObjDetail({ title, points, icon }: any) {
    return (
        <div className="bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col items-center text-center hover:border-yellow-500/30 transition-colors">
            <div className="text-3xl mb-2">{icon}</div>
            <div className="font-[family-name:var(--font-outfit)] font-bold text-white mb-1">{title}</div>
            <div className="text-xs font-[family-name:var(--font-outfit)] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">{points}</div>
        </div>
    );
}

function ScoreExample({ grade, score, pts, color }: any) {
    return (
        <div className={`p-3 rounded-lg border ${color} flex items-center justify-between`}>
            <div>
                <span className="block font-[family-name:var(--font-outfit)] font-bold text-lg">{grade}</span>
                <span className="text-xs opacity-70">{pts}</span>
            </div>
            <div className="font-[family-name:var(--font-outfit)] font-bold text-xl">{score}</div>
        </div>
    );
}
