import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Shield, Swords } from 'lucide-react';
import { PdlGainEntry } from '@/lib/api';

// Props now accept combined trends or list of generic items
interface TickerProps {
    trends: PdlGainEntry[];
}

export function Ticker({ trends }: TickerProps) {
    if (!trends || trends.length === 0) return null;

    // Process trends into news items
    // Since we receive potentially mixed trends from page component, we just format them.
    // Ideally page.tsx should pass a "source" tag, but PdlGainEntry doesn't have it by default unless we augment it.
    // For now, we assume trends might be enriched or we just show the name. 
    // Wait, the user asked to see "Solo" or "Flex". 
    // We will rely on checking if the item has a 'queue' property if we injected it, 
    // OR we will make the generic Ticker accept a custom interface. Let's adapt.

    const newsItems = trends
        .filter(t => Math.abs(t.pdlGain) >= 15) // Show big moves only
        .map(t => {
            const isGain = t.pdlGain > 0;
            // Hack: Identifying queue if passed via extended property or just general
            // Since we can't easily change API type globally right now, we'll try to guess or just show generic if missing.
            // Actually, we'll handle this in page.tsx by mapping before passing, OR we can just show "RANKED" if unknown.
            // Let's assume we want to show pure movement.

            return {
                id: `${t.puuid}-${t.pdlGain}`,
                gameName: t.gameName,
                amount: Math.abs(t.pdlGain),
                isGain,
                // If we detect tier change (just heuristic or if available)
                meta: (t as any).queueType === 'FLEX' ? 'FLEX' : 'SOLO' // We will inject this in page.tsx
            };
        })
        .slice(0, 15);

    if (newsItems.length === 0) return null;

    // Duplicate for loop
    const displayItems = [...newsItems, ...newsItems];

    return (
        <div className="w-full bg-transparent py-2 overflow-hidden flex items-center relative z-50 h-12 mask-gradient-to-r">

            {/* Live Badge - refined gradient */}
            <div className="absolute left-0 pl-2 md:pl-8 z-20 h-full flex items-center pr-8 bg-gradient-to-r from-[#050505] to-transparent">
                <span className="flex items-center gap-1.5 text-emerald-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-black/40 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)] backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Feed
                </span>
            </div>

            {/* Marquee Container */}
            <div className="flex-1 overflow-hidden relative h-full mask-gradient-to-r">
                <motion.div
                    className="flex items-center gap-12 whitespace-nowrap active:cursor-grab pl-8"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        duration: 30, // Slightly faster for better flow check
                        ease: "linear",
                        repeat: Infinity
                    }}
                    style={{ width: "max-content" }}
                >
                    {/* Render items TWICE for seamless loop */}
                    {[...displayItems, ...displayItems].map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="flex items-center gap-3 text-xs font-medium text-gray-400">
                            {/* Queue Badge */}
                            <div className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${item.meta === 'SOLO' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                                {item.meta === 'SOLO' ? 'SOLO' : 'FLEX'}
                            </div>

                            <span className="text-white font-[family-name:var(--font-outfit)] font-bold tracking-wide">{item.gameName}</span>

                            <span className={`flex items-center gap-0.5 font-mono ${item.isGain ? 'text-emerald-400' : 'text-red-400'}`}>
                                {item.isGain ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {item.isGain ? '+' : '-'}{item.amount} PDL
                            </span>

                            <span className="w-1 h-1 rounded-full bg-white/20 ml-2" />
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
        </div>
    );
}
