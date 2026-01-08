import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PlayerAvatarProps {
    profileIconId?: number | null;
    summonerLevel?: number | null;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    ringColor?: string;
}

export function PlayerAvatar({ profileIconId, summonerLevel, className, size = 'md', ringColor = 'border-gray-700' }: PlayerAvatarProps) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    const iconUrl = profileIconId
        ? `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${profileIconId}.png`
        : `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/29.png`; // Generic Fallback

    return (
        <div className={twMerge("relative inline-block", className)}>
            <img
                src={iconUrl}
                alt="Avatar"
                onError={(e) => {
                    e.currentTarget.src = "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/29.png";
                }}
                className={clsx(
                    "rounded-2xl object-cover border-2 shadow-lg transition-transform hover:scale-105",
                    sizeClasses[size],
                    ringColor
                )}
            />
            {summonerLevel && size !== 'sm' && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-[10px] text-white px-2 py-0.5 rounded-full border border-white/10 shadow-xl whitespace-nowrap">
                    Lvl {summonerLevel}
                </div>
            )}
        </div>
    );
}
