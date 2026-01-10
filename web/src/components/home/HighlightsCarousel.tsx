import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Swords,
    Skull,
    Zap,
    Target,
    Timer,
    Ghost,
    HeartCrack,
    TrendingDown,
} from 'lucide-react';
import { HallOfFameData, HallOfShameData, InsightPlayer } from '@/lib/api';
import { normalizeChampionName } from '@/lib/utils';
import { DDRAGON_VERSION, CHAMPION_LOAD_BASE } from '@/lib/constants';

interface HighlightsCarouselProps {
    fame: HallOfFameData | null;
    shame: HallOfShameData | null;
}

type StoryCard = {
    id: string;
    type: 'GOLD' | 'RED' | 'BLUE' | 'PURPLE' | 'GRAY' | 'GREEN';
    player: InsightPlayer;
    title: string;
    icon: any;
    message: string;
    bgImage?: string;
};

// Use LOADING images for vertical cards (better aspect ratio than splash)

export function HighlightsCarousel({ fame, shame }: HighlightsCarouselProps) {
    const [cards, setCards] = useState<StoryCard[]>([]);

    useEffect(() => {
        const list: StoryCard[] = [];

        const getSplash = (championName?: string) => {
            if (!championName) return undefined;
            const normalized = normalizeChampionName(championName);
            return `${CHAMPION_LOAD_BASE}/${normalized}_0.jpg`;
        };

        // 1. HALL OF FAME
        if (fame?.pentaKing) list.push({
            id: 'penta', type: 'GOLD', player: fame.pentaKing, title: 'PENTAKILL',
            icon: Swords, message: 'Massacre total!',
            bgImage: getSplash(fame.pentaKing.championName)
        });
        if (fame?.stomper) list.push({
            id: 'stomper', type: 'BLUE', player: fame.stomper, title: 'STOMPER',
            icon: Zap, message: 'Vitória Relâmpago',
            bgImage: getSplash(fame.stomper.championName)
        });
        if (fame?.damageEfficient) list.push({
            id: 'dmg', type: 'GOLD', player: fame.damageEfficient, title: 'TOP DANO',
            icon: Target, message: 'Derreteu a barra de HP',
            bgImage: getSplash(fame.damageEfficient.championName)
        });

        // 2. HALL OF SHAME
        if (shame?.soloDoador) list.push({
            id: 'feeder', type: 'RED', player: shame.soloDoador, title: 'FEEDER',
            icon: Skull, message: 'Buffet Livre pro inimigo',
            bgImage: getSplash(shame.soloDoador.championName)
        });
        if (shame?.throwingStation && !shame.soloDoador) list.push({
            id: 'throw', type: 'RED', player: shame.throwingStation, title: 'ENTREGOU',
            icon: TrendingDown, message: 'Jogou a vantagem no lixo',
            bgImage: getSplash(shame.throwingStation.championName)
        });
        if (shame?.visionNegligente) list.push({
            id: 'blind', type: 'PURPLE', player: shame.visionNegligente, title: 'NO VISION',
            icon: Ghost, message: 'Mapa apagado é meta?',
            bgImage: getSplash(shame.visionNegligente.championName)
        });
        if (shame?.sonecaBaron) list.push({
            id: 'sleep', type: 'GRAY', player: shame.sonecaBaron, title: 'SONECA',
            icon: Timer, message: 'Dormindo no farm',
            bgImage: getSplash(shame.sonecaBaron.championName)
        });

        setCards(list.filter(c => c.player && c.player.gameName));
    }, [fame, shame]);

    if (cards.length === 0) return null;

    return (
        <section className="mb-12 overflow-hidden relative">
            <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-xl font-[family-name:var(--font-outfit)] font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full" /> Stories da Rodada
                </h3>
            </div>

            <div
                className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide select-none w-full max-w-full"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {cards.map((card, idx) => (
                    <div key={card.id + idx} className="snap-center flex-shrink-0">
                        <StoryCardComponent card={card} />
                    </div>
                ))}
            </div>
        </section>
    );
}

function StoryCardComponent({ card }: { card: StoryCard }) {

    const styles = {
        GOLD: { text: 'text-yellow-400', badge: 'bg-yellow-500' },
        RED: { text: 'text-red-500', badge: 'bg-red-600' },
        BLUE: { text: 'text-blue-400', badge: 'bg-blue-500' },
        PURPLE: { text: 'text-purple-400', badge: 'bg-purple-600' },
        GRAY: { text: 'text-gray-400', badge: 'bg-gray-600' },
        GREEN: { text: 'text-emerald-400', badge: 'bg-emerald-500' },
    }[card.type] || { text: 'text-white', badge: 'bg-white' };

    const fallbackProfileIcon = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${card.player.profileIconId || 29}.png`;

    return (
        <motion.div
            whileHover={{ scale: 0.98 }}
            className="relative w-[240px] h-[380px] rounded-[1.5rem] overflow-hidden bg-[#0A0A0A] border-[1px] border-white/10 shadow-xl group cursor-pointer"
        >
            {/* Background Image Logic */}
            <div className="absolute inset-0 z-0">
                {card.bgImage ? (
                    <img
                        src={card.bgImage}
                        alt="Background"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                            // On error, fallback to profile icon with heavy blur
                            const img = e.target as HTMLImageElement;
                            img.src = fallbackProfileIcon;
                            img.classList.add('blur-sm', 'opacity-50', 'scale-150'); // Style the fallback
                        }}
                    />
                ) : (
                    // Default if no BG image provided at all
                    <img
                        src={fallbackProfileIcon}
                        alt="Fallback"
                        className="w-full h-full object-cover blur-sm opacity-50 scale-150"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
            </div>

            {/* Story Progress Bar Simulation */}
            <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
                <div className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-full shadow-[0_0_10px_white]" />
                </div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">

                {/* Type Badge */}
                <div className={`
                    absolute top-6 left-5 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest text-white shadow-lg
                    ${styles.badge}
                `}>
                    {card.title}
                </div>

                <div className="mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className={`
                        w-10 h-10 rounded-full bg-black/60 backdrop-blur-md mb-3 border border-white/20 
                        flex items-center justify-center ${styles.text} shadow-lg
                    `}>
                        <card.icon size={18} />
                    </div>

                    <h4 className="text-2xl font-[family-name:var(--font-outfit)] font-black text-white leading-none mb-1 drop-shadow-md">
                        {card.player.gameName}
                    </h4>
                    <p className="text-white/70 font-mono text-[10px] mb-3 uppercase tracking-wide">
                        {card.player.value} {card.player.label}
                    </p>

                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/5 group-hover:bg-white/15 transition-colors">
                        <p className="text-xs font-bold text-white/90 italic leading-tight">
                            "{card.message}"
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
