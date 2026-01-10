export interface TierTheme {
    id: string;
    label: string;
    colors: {
        background: string; // Background gradient or solid
        cardBg: string; // Glassmorphism background with tint
        text: string; // Primary text color
        textSecondary: string; // Secondary text
        accent: string; // Primary accent (buttons, active states)
        border: string; // Border colors
        glow: string; // Box shadow glow
        hex: string; // Hex color for charts
    };
    gradients: {
        hero: string; // The main background gradient
        text: string; // Gradient for special text
    };
    styles: {
        borderRadius: string; // 'rounded-lg', 'rounded-xl', 'rounded-3xl'
        layoutGap: string; // 'gap-6', 'gap-10'
        backdrop: string; // 'backdrop-blur-md', 'backdrop-blur-3xl'
        texture: 'noise' | 'metal' | 'glass'; // Logic for background texture
        particles: boolean; // Show floating particles?
    }
}

const BASE_THEME = {
    cardBg: 'bg-black/40 backdrop-blur-xl border-white/5',
    textSecondary: 'text-zinc-400',
};

// TIER THEMES V5: ETHEREAL EVOLUTION
// Concepts:
// Low Elo (Iron-Gold): Material, Metallic, Grounded.
// Mid Elo (Plat-Emerald): Tech, Crystal, Sharp.
// High Elo (Diamond+): Cosmic, Light, Abstract.

export const TIER_THEMES: Record<string, TierTheme> = {
    IRON: {
        id: 'IRON',
        label: 'Ferro',
        colors: {
            ...BASE_THEME,
            background: 'bg-[#1a1a1a]',
            cardBg: 'bg-zinc-900 border-zinc-700', // Solid
            text: 'text-zinc-400',
            accent: 'text-zinc-500',
            border: 'border-zinc-700',
            glow: 'shadow-none',
            hex: '#71717a'
        },
        gradients: {
            hero: 'from-zinc-800 via-zinc-950 to-black',
            text: 'from-zinc-400 to-zinc-600'
        },
        styles: {
            borderRadius: 'rounded-lg',
            layoutGap: 'gap-6',
            backdrop: 'backdrop-blur-sm',
            texture: 'noise',
            particles: false
        }
    },
    BRONZE: {
        id: 'BRONZE',
        label: 'Bronze',
        colors: {
            ...BASE_THEME,
            background: 'bg-[#1a120b]',
            cardBg: 'bg-[#2a1d15] border-orange-900/40', // Mostly solid
            text: 'text-orange-200',
            accent: 'text-orange-500',
            border: 'border-orange-900',
            glow: 'shadow-[0_0_10px_rgba(154,52,18,0.1)]',
            hex: '#f97316'
        },
        gradients: {
            hero: 'from-orange-950 via-black to-black',
            text: 'from-orange-300 to-orange-700'
        },
        styles: {
            borderRadius: 'rounded-lg',
            layoutGap: 'gap-6',
            backdrop: 'backdrop-blur-sm',
            texture: 'noise',
            particles: false
        }
    },
    SILVER: {
        id: 'SILVER',
        label: 'Prata',
        colors: {
            ...BASE_THEME,
            background: 'bg-[#1f2937]',
            cardBg: 'bg-slate-800 border-slate-600',
            text: 'text-slate-200',
            accent: 'text-slate-400',
            border: 'border-slate-500/50',
            glow: 'shadow-none',
            hex: '#94a3b8'
        },
        gradients: {
            hero: 'from-slate-800 via-slate-950 to-black',
            text: 'from-slate-100 to-slate-400'
        },
        styles: {
            borderRadius: 'rounded-lg',
            layoutGap: 'gap-6',
            backdrop: 'backdrop-blur-sm',
            texture: 'noise',
            particles: false
        }
    },
    GOLD: {
        id: 'GOLD',
        label: 'Ouro',
        colors: {
            ...BASE_THEME,
            background: 'bg-[#0f0b02]',
            cardBg: 'bg-yellow-950/20 backdrop-blur-xl border-yellow-500/30',
            text: 'text-yellow-100',
            accent: 'text-yellow-400',
            border: 'border-yellow-500/50',
            glow: 'shadow-[0_0_30px_rgba(234,179,8,0.2)]',
            hex: '#facc15'
        },
        gradients: {
            hero: 'from-yellow-900/40 via-black to-black',
            text: 'from-yellow-200 via-yellow-400 to-amber-600'
        },
        styles: {
            borderRadius: 'rounded-xl',
            layoutGap: 'gap-6',
            backdrop: 'backdrop-blur-xl',
            texture: 'metal',
            particles: false
        }
    },
    PLATINUM: {
        id: 'PLATINUM',
        label: 'Platina',
        colors: {
            ...BASE_THEME,
            background: 'bg-[#020e10]',
            cardBg: 'bg-cyan-950/30 backdrop-blur-xl border-cyan-400/30',
            text: 'text-cyan-50',
            accent: 'text-cyan-400',
            border: 'border-cyan-400/50',
            glow: 'shadow-[0_0_35px_rgba(34,211,238,0.25)]',
            hex: '#22d3ee'
        },
        gradients: {
            hero: 'from-cyan-900/50 via-black to-black',
            text: 'from-cyan-100 via-cyan-400 to-teal-500'
        },
        styles: {
            borderRadius: 'rounded-xl',
            layoutGap: 'gap-6',
            backdrop: 'backdrop-blur-xl',
            texture: 'metal',
            particles: false
        }
    },
    EMERALD: {
        id: 'EMERALD',
        label: 'Esmeralda',
        colors: {
            ...BASE_THEME,
            background: 'bg-[#011406]',
            cardBg: 'bg-emerald-950/30 backdrop-blur-xl border-emerald-500/30',
            text: 'text-emerald-50',
            accent: 'text-emerald-400',
            border: 'border-emerald-500/50',
            glow: 'shadow-[0_0_35px_rgba(16,185,129,0.25)]',
            hex: '#34d399'
        },
        gradients: {
            hero: 'from-emerald-900/60 via-black to-black',
            text: 'from-emerald-100 via-emerald-400 to-green-500'
        },
        styles: {
            borderRadius: 'rounded-xl',
            layoutGap: 'gap-6',
            backdrop: 'backdrop-blur-xl',
            texture: 'metal',
            particles: false
        }
    },
    DIAMOND: {
        id: 'DIAMOND',
        label: 'Diamante',
        colors: {
            ...BASE_THEME,
            background: 'bg-[#040914]',
            cardBg: 'bg-blue-950/20 backdrop-blur-2xl border-blue-400/40',
            text: 'text-blue-50',
            accent: 'text-blue-400',
            border: 'border-blue-400/60',
            glow: 'shadow-[0_0_50px_rgba(96,165,250,0.4)]',
            hex: '#60a5fa'
        },
        gradients: {
            hero: 'from-blue-900/70 via-slate-900 to-black',
            text: 'from-blue-100 via-indigo-300 to-violet-500'
        },
        styles: {
            borderRadius: 'rounded-3xl',
            layoutGap: 'gap-10',
            backdrop: 'backdrop-blur-2xl',
            texture: 'glass',
            particles: true
        }
    },
    MASTER: {
        id: 'MASTER',
        label: 'Mestre',
        colors: {
            ...BASE_THEME,
            background: 'bg-[#120214]',
            cardBg: 'bg-purple-950/20 backdrop-blur-2xl border-purple-500/40',
            text: 'text-purple-50',
            accent: 'text-fuchsia-400',
            border: 'border-purple-500/60',
            glow: 'shadow-[0_0_60px_rgba(192,38,211,0.4)]',
            hex: '#e879f9'
        },
        gradients: {
            hero: 'from-purple-900/80 via-black to-black',
            text: 'from-fuchsia-200 via-purple-400 to-pink-500'
        },
        styles: {
            borderRadius: 'rounded-3xl',
            layoutGap: 'gap-10',
            backdrop: 'backdrop-blur-2xl',
            texture: 'glass',
            particles: true
        }
    },
    GRANDMASTER: {
        id: 'GRANDMASTER',
        label: 'Grão-Mestre',
        colors: {
            ...BASE_THEME,
            background: 'bg-[#140202]',
            cardBg: 'bg-red-950/40 backdrop-blur-2xl border-red-500/40',
            text: 'text-red-50',
            accent: 'text-red-500',
            border: 'border-red-500/60',
            glow: 'shadow-[0_0_70px_rgba(239,68,68,0.5)]',
            hex: '#ef4444'
        },
        gradients: {
            hero: 'from-red-900/80 via-black to-black',
            text: 'from-orange-200 via-red-500 to-rose-600'
        },
        styles: {
            borderRadius: 'rounded-3xl',
            layoutGap: 'gap-10',
            backdrop: 'backdrop-blur-2xl',
            texture: 'glass',
            particles: true
        }
    },
    CHALLENGER: {
        id: 'CHALLENGER',
        label: 'Desafiante',
        colors: {
            ...BASE_THEME,
            background: 'bg-[#080c14]',
            cardBg: 'bg-indigo-950/50 backdrop-blur-3xl border-yellow-300/50',
            text: 'text-yellow-50',
            accent: 'text-yellow-300',
            border: 'border-yellow-300/80',
            glow: 'shadow-[0_0_100px_rgba(253,224,71,0.5)]',
            hex: '#fde047'
        },
        gradients: {
            hero: 'from-indigo-900/90 via-slate-900 to-black',
            text: 'from-white via-yellow-200 to-amber-400'
        },
        styles: {
            borderRadius: 'rounded-3xl',
            layoutGap: 'gap-10',
            backdrop: 'backdrop-blur-3xl',
            texture: 'glass',
            particles: true
        }
    },
    UNRANKED: {
        id: 'UNRANKED',
        label: 'Unranked',
        colors: {
            ...BASE_THEME,
            background: 'bg-zinc-950',
            cardBg: 'bg-zinc-900 border-zinc-800',
            text: 'text-zinc-400',
            accent: 'text-zinc-500',
            border: 'border-zinc-800',
            glow: 'shadow-none',
            hex: '#71717a'
        },
        gradients: {
            hero: 'from-zinc-900 via-black to-black',
            text: 'from-zinc-400 to-zinc-600'
        },
        styles: {
            borderRadius: 'rounded-lg',
            layoutGap: 'gap-6',
            backdrop: 'backdrop-blur-sm',
            texture: 'noise',
            particles: false
        }
    }
};

// Helper to safely get theme
export function getTheme(tier: string | undefined): TierTheme {
    if (!tier) return TIER_THEMES.UNRANKED;
    const normalizedTier = tier.toUpperCase();
    return TIER_THEMES[normalizedTier] || TIER_THEMES.UNRANKED;
}
