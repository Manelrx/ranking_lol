import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PlayerAvatarProps {
    profileIconId?: number | null;
    summonerLevel?: number | null;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    ringColor?: string;
    tier?: string; // e.g. "GOLD", "CHALLENGER"
}

export function PlayerAvatar({ profileIconId, summonerLevel, className, size = 'md', ringColor, tier }: PlayerAvatarProps) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    const tierColors: Record<string, string> = {
        IRON: 'border-slate-500 shadow-slate-500/20',
        BRONZE: 'border-orange-700 shadow-orange-700/20',
        SILVER: 'border-gray-400 shadow-gray-400/20',
        GOLD: 'border-yellow-400 shadow-yellow-400/20',
        PLATINUM: 'border-cyan-400 shadow-cyan-400/20',
        EMERALD: 'border-emerald-500 shadow-emerald-500/30',
        DIAMOND: 'border-blue-400 shadow-blue-400/30',
        MASTER: 'border-purple-500 shadow-purple-500/40',
        GRANDMASTER: 'border-red-500 shadow-red-500/40',
        CHALLENGER: 'border-yellow-300 shadow-blue-400/50 shadow-lg ring-2 ring-yellow-400/50', // Special mix
        UNRANKED: 'border-gray-700'
    };

    // Determine border/shadow style
    // Priority: ringColor prop > tier style > default
    const borderStyle = ringColor || (tier ? tierColors[tier.toUpperCase()] : '') || 'border-gray-700';

    const iconUrl = profileIconId
        ? `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/profileicon/${profileIconId}.png`
        : `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/profileicon/29.png`; // Generic Fallback

    return (
        <div className={twMerge("relative inline-block", className)}>
            <img
                src={iconUrl}
                alt="Avatar"
                onError={(e) => {
                    e.currentTarget.src = "https://ddragon.leagueoflegends.com/cdn/16.1.1/img/profileicon/29.png";
                }}
                className={clsx(
                    "rounded-2xl object-cover border-2 shadow-lg transition-transform hover:scale-105",
                    sizeClasses[size],
                    borderStyle
                )}
            />
            {summonerLevel && size !== 'sm' && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-[10px] text-white px-2 py-0.5 rounded-full border border-white/10 shadow-xl whitespace-nowrap z-10">
                    Lvl {summonerLevel}
                </div>
            )}
        </div>
    );
}
