'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initPlayers } from '@/lib/api';
import { Sparkles, Users, Search, Loader2, CheckCircle2 } from 'lucide-react';

interface FirstRunModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

export function FirstRunModal({ isOpen, onComplete }: FirstRunModalProps) {
    const [players, setPlayers] = useState([{ gameName: '', tagLine: '' }]);
    const [status, setStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS'>('IDLE');
    const [error, setError] = useState('');

    const addField = () => {
        setPlayers([...players, { gameName: '', tagLine: '' }]);
    };

    const removeField = (index: number) => {
        if (players.length > 1) {
            setPlayers(players.filter((_, i) => i !== index));
        }
    };

    const handleChange = (index: number, field: 'gameName' | 'tagLine', value: string) => {
        const newPlayers = [...players];
        newPlayers[index][field] = value;
        setPlayers(newPlayers);
    };

    const handleSubmit = async () => {
        const validPlayers = players.filter(p => p.gameName.trim() && p.tagLine.trim());
        if (validPlayers.length === 0) {
            setError('Adicione pelo menos um jogador válido.');
            return;
        }

        setStatus('SYNCING');
        setError('');

        try {
            const res = await initPlayers(validPlayers);
            if (res.failed.length > 0) {
                setError(`Alguns falharam: ${res.failed.join(', ')}`);
                // If at least one succeeded, we proceed after a delay
                if (res.success.length > 0) {
                    setTimeout(() => setStatus('SUCCESS'), 1500);
                } else {
                    setStatus('IDLE');
                }
            } else {
                // All good
                setStatus('SUCCESS');
            }
        } catch (err) {
            setError('Erro ao salvar. Tente novamente.');
            setStatus('IDLE');
            console.error(err);
        }
    };

    // Auto-close on success
    if (status === 'SUCCESS') {
        setTimeout(onComplete, 2000);
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-xl bg-zinc-900/40 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                    >
                        {/* Decorative Gradient Blob */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="p-8 relative">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    <Sparkles className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Bem-vindo ao Ranking</h2>
                                <p className="text-zinc-400">Configure os jogadores para iniciar o monitoramento.</p>
                            </div>

                            {/* Content based on Status */}
                            {status === 'IDLE' && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {players.map((player, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="group flex gap-3 items-center"
                                            >
                                                <div className="flex-1 grid grid-cols-[1fr,100px] gap-2 p-1 bg-zinc-950/50 rounded-lg border border-white/5 focus-within:border-emerald-500/50 transition-colors">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                                        <input
                                                            type="text"
                                                            placeholder="Game Name"
                                                            value={player.gameName}
                                                            onChange={(e) => handleChange(index, 'gameName', e.target.value)}
                                                            className="w-full bg-transparent border-none py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none placeholder:text-zinc-600"
                                                        />
                                                    </div>
                                                    <div className="relative border-l border-white/5">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">#</span>
                                                        <input
                                                            type="text"
                                                            placeholder="TAG"
                                                            value={player.tagLine}
                                                            onChange={(e) => handleChange(index, 'tagLine', e.target.value)}
                                                            className="w-full bg-transparent border-none py-2.5 pl-6 pr-3 text-sm text-white focus:outline-none placeholder:text-zinc-600"
                                                        />
                                                    </div>
                                                </div>
                                                {players.length > 1 && (
                                                    <button
                                                        onClick={() => removeField(index)}
                                                        className="p-2 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                        tabIndex={-1}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <button
                                            onClick={addField}
                                            className="text-sm flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors px-2 py-1 rounded hover:bg-emerald-400/10"
                                        >
                                            <Users className="w-4 h-4" />
                                            Adicionar Jogador
                                        </button>
                                        {error && <span className="text-xs text-red-400">{error}</span>}
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        className="w-full mt-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all transform active:scale-[0.98]"
                                    >
                                        Iniciar Sincronização
                                    </button>
                                </motion.div>
                            )}

                            {status === 'SYNCING' && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="py-12 flex flex-col items-center justify-center text-center space-y-6"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                                        <Loader2 className="w-16 h-16 text-emerald-400 animate-spin relative z-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">Sincronizando Dados...</h3>
                                        <p className="text-zinc-400 text-sm mt-1">Carregando histórico, elos e estatísticas da Riot API.</p>
                                        <p className="text-zinc-500 text-xs mt-4">Isso pode levar alguns segundos.</p>
                                    </div>
                                </motion.div>
                            )}

                            {status === 'SUCCESS' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                    className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                                >
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Tudo Pronto!</h3>
                                        <p className="text-zinc-400">O ranking foi criado com sucesso.</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
