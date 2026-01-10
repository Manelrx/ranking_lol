import { motion } from 'framer-motion';
import { Calendar, Crown, Star } from 'lucide-react';

interface MonthlyRecapProps {
    isActive: boolean;
}

export function MonthlyRecap({ isActive }: MonthlyRecapProps) {
    // Only show if active (e.g. first days of month)
    // Note: In a real app we would pass data about the monthly winner here
    if (!isActive) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-24 relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-purple-900 to-[#1a0b2e] border border-purple-500/30"
        >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16 p-8 md:p-12">

                {/* Visual Left */}
                <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-purple-500 blur-[60px] opacity-40 animate-pulse" />
                    <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-900/50 rotate-12 border-4 border-white/10">
                        <Crown className="w-16 h-16 md:w-24 md:h-24 text-white" fill="currentColor" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 bg-white text-purple-900 font-black text-sm uppercase tracking-widest px-4 py-1 rounded-full">
                        Janeiro
                    </div>
                </div>

                {/* Content Right */}
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                        <Calendar className="text-purple-300 w-5 h-5" />
                        <span className="text-purple-300 font-bold uppercase tracking-widest text-sm">Fechamento Mensal</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic leading-none mb-6">
                        A Temporada Virou!
                    </h2>

                    <p className="text-purple-200/80 text-lg leading-relaxed max-w-xl mb-8">
                        Os cálculos finais foram processados. Veja quem dominou o mês de Janeiro e levou a premiação máxima.
                    </p>

                    <button className="bg-white text-purple-950 font-black uppercase tracking-wider px-8 py-4 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(168,85,247,0.4)] flex items-center gap-2 mx-auto md:mx-0">
                        <Star className="w-5 h-5 fill-current" />
                        Ver Vencedores
                    </button>
                </div>
            </div>
        </motion.section>
    );
}
