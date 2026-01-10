"use client";

import { useEffect, useState } from "react";
import { getSeasonRanking, RankingEntry } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { ChampionIcon } from "@/components/ui/ChampionIcon";
import { EloBadge } from "@/components/EloBadge";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useQueue } from "@/contexts/QueueContext";

function PlayersContent() {
    const [players, setPlayers] = useState<RankingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    // Add Summoner State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPlayer, setNewPlayer] = useState({ gameName: '', tagLine: '', password: '' });
    const [addStatus, setAddStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMsg, setErrorMsg] = useState('');

    const router = useRouter();
    const { queueType } = useQueue();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await getSeasonRanking(queueType, 100);
                setPlayers(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [queueType]);

    const handleAddPlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddStatus('LOADING');
        setErrorMsg('');

        try {
            const { createPlayer } = await import('@/lib/api');
            await createPlayer(newPlayer.gameName, newPlayer.tagLine, newPlayer.password);

            setAddStatus('SUCCESS');
            setTimeout(() => {
                setShowAddModal(false);
                setAddStatus('IDLE');
                setNewPlayer({ gameName: '', tagLine: '', password: '' });
                window.location.reload();
            }, 1500);
        } catch (err: any) {
            setAddStatus('ERROR');
            setErrorMsg(err.message || 'Erro ao adicionar');
        }
    };

    const filtered = players.filter(p =>
        p.gameName.toLowerCase().includes(filter.toLowerCase()) ||
        p.tagLine.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 min-h-screen pb-20 relative">
            {/* Header com Busca e Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-[family-name:var(--font-outfit)] font-bold text-white tracking-tight">Jogadores</h2>
                    <p className="text-gray-400">Diretório oficial do servidor ({players.length})</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-[family-name:var(--font-outfit)] font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 justify-center"
                    >
                        <UserPlus className="w-4 h-4" />
                        Adicionar Invocador
                    </button>

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
            </div>

            {/* Modal Add Player */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a1c23] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">x</button>

                        <h3 className="text-xl font-[family-name:var(--font-outfit)] font-bold text-white">Adicionar Invocador</h3>
                        <p className="text-sm text-gray-400">Insira o Riot ID e a senha de administrador para rastrear um novo jogador.</p>

                        <form onSubmit={handleAddPlayer} className="space-y-4 mt-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-[family-name:var(--font-outfit)] font-bold text-gray-500 uppercase">Game Name</label>
                                    <input
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                                        placeholder="Faker"
                                        value={newPlayer.gameName}
                                        onChange={e => setNewPlayer({ ...newPlayer, gameName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-[family-name:var(--font-outfit)] font-bold text-gray-500 uppercase">Tag</label>
                                    <input
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                                        placeholder="T1"
                                        value={newPlayer.tagLine}
                                        onChange={e => setNewPlayer({ ...newPlayer, tagLine: e.target.value.replace('#', '') })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-[family-name:var(--font-outfit)] font-bold text-gray-500 uppercase">Senha de Admin</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                                    placeholder="••••••••"
                                    value={newPlayer.password}
                                    onChange={e => setNewPlayer({ ...newPlayer, password: e.target.value })}
                                />
                            </div>

                            {addStatus === 'ERROR' && (
                                <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/20 text-center">
                                    {errorMsg}
                                </div>
                            )}
                            {addStatus === 'SUCCESS' && (
                                <div className="text-emerald-400 text-sm bg-emerald-500/10 p-2 rounded border border-emerald-500/20 text-center">
                                    Jogador adicionado com sucesso!
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={addStatus === 'LOADING' || addStatus === 'SUCCESS'}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 mt-2"
                            >
                                {addStatus === 'LOADING' ? 'Verificando...' : 'Adicionar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

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
                            <Link href={`/player/${player.puuid}?queue=${queueType}`}>
                                <div className="p-6 flex flex-col items-center text-center relative">
                                    {/* Hover Effect Background */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 to-indigo-500/0 group-hover:to-indigo-500/5 transition-all duration-500" />

                                    <PlayerAvatar
                                        profileIconId={player.profileIconId}
                                        summonerLevel={player.summonerLevel}
                                        size="xl"
                                        className="mb-4 shadow-2xl"
                                        tier={player.tier}
                                        ringColor={player.rank === 1 ? 'border-yellow-400 shadow-yellow-500/40' : undefined}
                                    />

                                    <h3 className="text-xl font-[family-name:var(--font-outfit)] font-bold text-white group-hover:text-indigo-400 transition-colors">
                                        {player.gameName}
                                    </h3>
                                    <span className="text-xs text-gray-500 font-mono mb-4">#{player.tagLine}</span>

                                    <div className="flex items-center gap-2 mb-6">
                                        <EloBadge tier={player.tier} rank={player.rankDivision} className="scale-90" />
                                        <div className="text-sm font-[family-name:var(--font-outfit)] font-bold text-gray-300">
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
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-[family-name:var(--font-outfit)] font-bold">Score</span>
                                            <span className="text-lg font-[family-name:var(--font-outfit)] font-bold text-white">{player.totalScore.toFixed(0)}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-[family-name:var(--font-outfit)] font-bold">Win Rate</span>
                                            <span className={`text-lg font-[family-name:var(--font-outfit)] font-bold ${parseFloat(player.winRate) >= 50 ? 'text-emerald-400' : 'text-gray-400'}`}>
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
                    Nenhum jogador encontrado com esse nome na fila <strong>{queueType === 'SOLO' ? 'Solo/Duo' : 'Flex'}</strong>.
                </div>
            )}
        </div>
    );
}

export default function PlayersDirectoryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>}>
            <PlayersContent />
        </Suspense>
    );
}
