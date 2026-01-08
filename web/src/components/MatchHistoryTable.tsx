'use client';

import { MatchHistoryEntry } from '@/lib/api';

interface Props {
    history: MatchHistoryEntry[];
    onSelectMatch?: (match: MatchHistoryEntry) => void;
}

export function MatchHistoryTable({ history, onSelectMatch }: Props) {
    return (
        <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.05)] shadow-xl bg-[var(--color-surface)]/40 backdrop-blur-md">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-black/20 text-[var(--color-text-secondary)] border-b border-white/5 uppercase text-[10px] tracking-wider font-bold">
                        <tr>
                            <th className="p-4">Campeão</th>
                            <th className="p-4">Resultado</th>
                            <th className="p-4 text-center">KDA</th>
                            <th className="p-4 text-center">Score</th>
                            <th className="p-4 text-right">Data</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {history.map((match) => (
                            <tr
                                key={match.matchId}
                                onClick={() => onSelectMatch?.(match)}
                                className="group hover:bg-white/5 transition-all cursor-pointer"
                            >
                                {/* Champion & Lane */}
                                <td className="p-4 font-bold text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            {match.championId ? (
                                                <img
                                                    src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${match.championId}.png`}
                                                    alt={match.championName}
                                                    className="w-10 h-10 rounded-full border-2 border-gray-800 group-hover:border-[var(--color-primary)] transition-colors shadow-lg"
                                                    width={40}
                                                    height={40}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xs border-2 border-gray-700">?</div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 bg-black/80 text-[10px] px-1 rounded border border-white/10 text-gray-300">
                                                {{ 'TOP': 'TOP', 'JUNGLE': 'JNG', 'MIDDLE': 'MID', 'BOTTOM': 'ADC', 'UTILITY': 'SUP' }[match.lane] || match.lane?.substring(0, 3)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold leading-none">{match.championName}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Result */}
                                <td className="p-4">
                                    <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${match.isVictory
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_-4px_rgba(34,197,94,0.5)]'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {match.isVictory ? 'Vitória' : 'Derrota'}
                                    </div>
                                </td>

                                {/* KDA */}
                                <td className="p-4 text-center">
                                    <div className="font-mono font-bold text-md text-gray-200">{match.kda}</div>
                                </td>

                                {/* RiftScore */}
                                <td className="p-4 text-center">
                                    <div className="font-bold text-lg text-[var(--color-primary)] group-hover:text-[var(--color-primary-hover)] transition-colors drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                                        {match.score.toFixed(1)}
                                    </div>
                                </td>

                                {/* Date */}
                                <td className="p-4 text-right text-[var(--color-text-secondary)] text-xs font-mono">
                                    {new Date(match.date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {history.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    Nenhuma partida encontrada nesta fila.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
