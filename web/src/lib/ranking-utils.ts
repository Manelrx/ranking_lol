export const TIER_VALUES: Record<string, number> = {
    IRON: 0,
    BRONZE: 400,
    SILVER: 800,
    GOLD: 1200,
    PLATINUM: 1600,
    EMERALD: 2000,
    DIAMOND: 2400,
    MASTER: 2800,
    GRANDMASTER: 2800,
    CHALLENGER: 2800,
    UNRANKED: 0
};

export const RANK_VALUES: Record<string, number> = {
    'IV': 0,
    'III': 100,
    'II': 200,
    'I': 300,
    '4': 0,
    '3': 100,
    '2': 200,
    '1': 300,
    '': 0
};

export function getNormalizedLp(tier: string, rank: string, lp: number): number {
    const tierVal = TIER_VALUES[tier.toUpperCase()] || 0;
    // For Apex tiers (Master+), Rank usually doesn't matter (always I), LP stacks indefinitely
    if (tierVal >= 2800) {
        return tierVal + lp;
    }
    const rankVal = RANK_VALUES[rank] || 0;
    return tierVal + rankVal + lp;
}
