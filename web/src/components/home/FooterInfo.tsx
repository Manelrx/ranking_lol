import { Info, Database, Server, Activity } from 'lucide-react';

interface FooterInfoProps {
    lastUpdate?: string | null;
    totalGames?: number;
}

export function FooterInfo({ lastUpdate, totalGames = 0 }: FooterInfoProps) {
    return (
        <footer className="mt-20 border-t border-white/5 pt-12 pb-24 text-center md:text-left">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Brand / About */}
                <div className="col-span-1 md:col-span-1">
                    <h4 className="text-white font-bold uppercase tracking-wider mb-4">NexusRank Engine</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">
                        Sistema de ranking competitivo interno. Dados sincronizados com a Riot Games API.
                        Compita, suba de elo e apareça no hall da fama.
                    </p>
                </div>

                {/* Meta Stats */}
                <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between h-24">
                        <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <Activity size={12} />
                            Partidas da Season
                        </div>
                        <div className="text-2xl font-mono text-white">{totalGames.toLocaleString()}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between h-24">
                        <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <Database size={12} />
                            Última Atualização
                        </div>
                        <div className="text-sm font-mono text-emerald-400">
                            {lastUpdate ? new Date(lastUpdate).toLocaleTimeString('pt-BR') : 'Ao vivo'}
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between h-24">
                        <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <Info size={12} />
                            Status
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-sm text-gray-300">Operacional</span>
                        </div>
                    </div>

                </div>
            </div>

            <div className="mt-12 text-center text-xs text-gray-700 font-mono">
                &copy; 2026 NexusRank. Not endorsed by Riot Games.
            </div>
        </footer>
    );
}
