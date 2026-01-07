import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RankingEntry {
    rank: number;
    puuid: string;
    gameName: string;
    tagLine: string;
    // Identity
    profileIconId: number | null;
    summonerLevel: number | null;
    // Stats
    tier: string;
    rankDivision: string;
    lp: number;
    totalScore: number;
    avgScore: number;
    gamesUsed: number;
    wins: number;
    losses: number;
    winRate: string;
    // Main Champion
    mainChampion?: {
        id: number;
        name: string;
        points: number;
        level: number;
    };
}

export class RankingService {

    /**
     * Get General Season Ranking
     * Aggregates MatchScores for all active players in a specific queue.
     * CRITICAL: Uses RankSnapshot for Tier/Rank, NOT Player model.
     */
    async getSeasonRanking(queueType: 'SOLO' | 'FLEX' = 'SOLO', limit: number = 100): Promise<RankingEntry[]> {
        // 1. Get Active Players (Include Masteries)
        const players = await prisma.player.findMany({
            where: { isActive: true },
            include: {
                masteries: {
                    orderBy: { championPoints: 'desc' },
                    take: 1
                }
            } as any
        });

        const ranking: RankingEntry[] = [];

        // 2. Aggregate Scores & Get Snapshot per Player
        for (const player of players) {

            // Get LATEST snapshot for this queue
            const snapshot = await prisma.rankSnapshot.findFirst({
                where: { playerId: player.puuid, queueType },
                orderBy: { createdAt: 'desc' }
            });

            const scores = await prisma.matchScore.findMany({
                where: {
                    playerId: player.puuid,
                    queueType: queueType
                } as any
            });

            // If no games and no rank, skip (unless we want to show all players in /players? Logic might differ)
            // For RANKING, we skip. For /players directory, we might want them.
            // But this method is 'getSeasonRanking'. Use strict rule.
            if (scores.length === 0 && !snapshot) continue;

            const totalScore = scores.reduce((acc, s) => acc + s.matchScore, 0);
            const avgScore = scores.length > 0 ? totalScore / scores.length : 0;
            const wins = scores.filter(s => s.isVictory).length;
            const losses = scores.length - wins;

            const masteries = (player as any).masteries;
            const mainChamp = masteries?.[0] ? {
                id: masteries[0].championId,
                name: masteries[0].championName,
                points: masteries[0].championPoints,
                level: masteries[0].championLevel
            } : undefined;

            ranking.push({
                rank: 0, // Assigned later
                puuid: player.puuid,
                gameName: player.gameName,
                tagLine: player.tagLine,
                profileIconId: player.profileIconId,
                summonerLevel: player.summonerLevel,
                tier: snapshot?.tier || 'UNRANKED',
                rankDivision: snapshot?.rank || '',
                lp: snapshot?.lp || 0,
                totalScore: Math.round(totalScore * 10) / 10,
                avgScore: Math.round(avgScore * 10) / 10,
                gamesUsed: scores.length,
                wins,
                losses,
                winRate: scores.length > 0 ? ((wins / scores.length) * 100).toFixed(1) + '%' : '0%',
                mainChampion: mainChamp
            });
        }

        // 3. Sort by Total Score (RiftScore rules)
        const sorted = ranking.sort((a, b) => b.totalScore - a.totalScore).slice(0, limit);

        // 4. Assign Rank
        return sorted.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));
    }

    /**
     * Get Ranking Filtered by Tier
     * CRITICAL: Uses RankSnapshot for Tier source.
     */
    async getRankingByElo(queueType: 'SOLO' | 'FLEX', tierFilter: string, limit: number = 100) {
        // Reuse getSeasonRanking logic because filtering *after* snapshot lookup is safer 
        // than complex join queries given current prisma schema.
        // It's not most efficient for 1M players but strictly correct for small scale.

        const fullRanking = await this.getSeasonRanking(queueType, 1000); // Get all relevant

        let filtered = fullRanking;
        if (tierFilter !== 'ALL') {
            filtered = fullRanking.filter(p => p.tier === tierFilter);
        }

        // Sort is already done in getSeasonRanking but slicing again
        return {
            tier: tierFilter,
            players: filtered.slice(0, limit).map((entry, index) => ({ ...entry, rank: index + 1 }))
        };
    }


    // ... existing interfaces ...

    /**
     * Get PDL Gain Ranking
     * PDL Gain = Current LP (normalized) - Initial LP (normalized)
     */
    async getPdlGainRanking(queueType: 'SOLO' | 'FLEX', limit: number = 20) {
        const players = await prisma.player.findMany({ where: { isActive: true } });
        const gains = [];

        for (const player of players) {
            // Get Snapshots sorted by date
            const snapshots = await prisma.rankSnapshot.findMany({
                where: { playerId: player.puuid, queueType },
                orderBy: { createdAt: 'asc' }
            });

            if (snapshots.length < 2) continue;

            const start = snapshots[0];
            const end = snapshots[snapshots.length - 1];

            if (!start || !end) continue;

            // Normalize LP (Simple tier approximation)
            const getVal = (tier: string, lp: number) => {
                const map: any = { IRON: 0, BRONZE: 400, SILVER: 800, GOLD: 1200, PLATINUM: 1600, EMERALD: 2000, DIAMOND: 2400, MASTER: 2800, GRANDMASTER: 2800, CHALLENGER: 2800 };
                return (map[tier] || 0) + lp;
            };

            const startVal = getVal(start.tier, start.lp);
            const endVal = getVal(end.tier, end.lp);
            const gain = endVal - startVal;

            gains.push({
                puuid: player.puuid,
                gameName: player.gameName,
                tagLine: player.tagLine,
                tier: end.tier,
                rank: end.rank,
                lp: end.lp,
                pdlGain: gain,
                trend: gain > 0 ? 'UP' : (gain < 0 ? 'DOWN' : 'SAME')
            });
        }

        return gains.sort((a, b) => b.pdlGain - a.pdlGain).slice(0, limit);
    }

    /**
     * Get Player History (Snapshots)
     * CORRECTED: Uses RankSnapshot for Tier source.
     */
    async getPlayerHistory(puuid: string, queueType: 'SOLO' | 'FLEX' = 'SOLO') {
        const player = await prisma.player.findUnique({
            where: { puuid },
            include: {
                masteries: {
                    orderBy: { championPoints: 'desc' },
                    take: 5
                }
            } as any
        });

        if (!player) return null;

        const history = await prisma.rankSnapshot.findMany({
            where: { playerId: puuid, queueType: queueType },
            orderBy: { createdAt: 'asc' }
        });

        // Use the LAST snapshot as the current state for this queue
        const currentSnapshot = history.length > 0 ? history[history.length - 1] : null;

        return {
            player: {
                displayName: `${player.gameName} #${player.tagLine}`,
                // If no snapshot exists for this queue, default to UNRANKED/Empty
                tier: currentSnapshot?.tier || 'UNRANKED',
                rank: currentSnapshot?.rank || '',
                lp: currentSnapshot?.lp || 0,
                puuid: player.puuid,
                profileIconId: player.profileIconId,
                summonerLevel: player.summonerLevel
            },
            history: history.map(h => ({
                date: h.createdAt.toISOString(),
                tier: h.tier,
                rank: h.rank,
                lp: h.lp
            })),
            masteries: (player as any).masteries?.map((m: any) => ({
                championId: m.championId,
                championName: m.championName,
                level: m.championLevel,
                points: m.championPoints
            })) || []
        };
    }

    /**
     * Get Player Insights & Stats
     */
    async getPlayerInsights(puuid: string, queueType: 'SOLO' | 'FLEX') {
        const player = await prisma.player.findUnique({ where: { puuid } });
        if (!player) return null;

        // Optimized Query using denormalized queueType and fields
        const scores: any[] = await prisma.matchScore.findMany({
            where: {
                playerId: puuid,
                queueType: queueType // Direct filter (Index friendly)
            } as any,
            orderBy: { createdAt: 'desc' },
            include: { match: true }
        });

        if (scores.length === 0) return null;

        // Calc Stats using Top-Level Columns (No JSON parsing)
        const totalScore = scores.reduce((acc, s) => acc + s.matchScore, 0);
        const avgScore = totalScore / scores.length;
        const wins = scores.filter(s => s.isVictory).length;
        const winRate = ((wins / scores.length) * 100).toFixed(1);

        // Best/Worst
        const sortedByScore = [...scores].sort((a, b) => b.matchScore - a.matchScore);
        const bestMatch = sortedByScore[0];
        const worstMatch = sortedByScore[sortedByScore.length - 1];

        // KDA Calc (Direct Access)
        let totalK = 0, totalD = 0, totalA = 0;
        scores.forEach(s => {
            totalK += s.kills;
            totalD += s.deaths;
            totalA += s.assists;
        });
        const avgKda = totalD === 0 ? (totalK + totalA) : ((totalK + totalA) / totalD).toFixed(2);

        // Enhanced Match History Map
        const matchHistory = scores.map(s => {
            return {
                matchId: s.matchId,
                date: s.match.gameCreation,
                lane: s.lane,
                isVictory: s.isVictory,
                score: s.matchScore,
                // Breakdown Scores
                performanceScore: s.performanceScore,
                objectivesScore: s.objectivesScore,
                disciplineScore: s.disciplineScore,
                // KDA Details (Top Level)
                kills: s.kills,
                deaths: s.deaths,
                assists: s.assists,
                kda: `${s.kills}/${s.deaths}/${s.assists}`,
                // Champion
                championName: s.championName || 'Unknown',
                championId: s.championId
            };
        });

        return {
            stats: {
                avgScore: avgScore.toFixed(1),
                winRate: `${winRate}%`,
                totalGames: scores.length,
                avgKda,
                bestScore: bestMatch?.matchScore ?? 0,
                worstScore: worstMatch?.matchScore ?? 0
            },
            history: matchHistory,
            // Weekly/Monthly placeholders
            insights: {
                consistency: 'Alta', // PT-BR
                trend: 'UP'
            }
        };
    }

    /**
     * Get Weekly Highlights
     * Returns: Top KDA, Most Games, Best Support, Highest Dmg
     */
    async getWeeklyHighlights(queueType: 'SOLO' | 'FLEX' = 'SOLO') {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);

        // Fetch all scores for this week
        const scores: any[] = await prisma.matchScore.findMany({
            where: {
                queueType,
                createdAt: { gte: monday }
            } as any,
            include: { player: true }
        });

        if (scores.length === 0) return null;

        // Group by Player
        const playerStats: Record<string, {
            player: any,
            games: number,
            wins: number,
            kills: number,
            deaths: number,
            assists: number,
            totalDmg: number,
            totalVision: number
        }> = {};

        scores.forEach(s => {
            if (!playerStats[s.playerId]) {
                playerStats[s.playerId] = {
                    player: s.player,
                    games: 0, wins: 0,
                    kills: 0, deaths: 0, assists: 0,
                    totalDmg: 0, totalVision: 0
                };
            }
            const p = playerStats[s.playerId];
            p.games++;
            if (s.isVictory) p.wins++;
            p.kills += s.kills;
            p.deaths += s.deaths;
            p.assists += s.assists;

            // Extract JSON metrics safely
            const metrics = s.metrics as any;
            p.totalDmg += (metrics?.totalDamageDealtToChampions || 0);
            p.totalVision += (metrics?.visionScore || 0);
        });

        const statsArray = Object.values(playerStats);
        const minGames = 2; // Min valid for highlights
        const validStats = statsArray.filter(s => s.games >= minGames);

        // 1. MVP (Highest Score? Or KDA?) -> Let's use KDA for MVP Highlight
        const bestKda = validStats.sort((a, b) => {
            const kdaA = a.deaths === 0 ? (a.kills + a.assists) : (a.kills + a.assists) / a.deaths;
            const kdaB = b.deaths === 0 ? (b.kills + b.assists) : (b.kills + b.assists) / b.deaths;
            return kdaB - kdaA;
        })[0];

        // 2. Most Active
        const mostActive = statsArray.sort((a, b) => b.games - a.games)[0];

        // 3. Highest Damage (Avg per game)
        const highestDmg = validStats.sort((a, b) => (b.totalDmg / b.games) - (a.totalDmg / a.games))[0];

        // 4. Best Support (Vision + Assists weight)
        // Simplified: Avg Vision Score
        const bestVision = validStats.sort((a, b) => (b.totalVision / b.games) - (a.totalVision / a.games))[0];

        return {
            period: { start: monday, end: new Date() },
            mvp: bestKda ? { ...bestKda.player, value: ((bestKda.kills + bestKda.assists) / (bestKda.deaths || 1)).toFixed(2), label: 'KDA' } : null,
            mostActive: mostActive ? { ...mostActive.player, value: mostActive.games, label: 'Partidas' } : null,
            highestDmg: highestDmg ? { ...highestDmg.player, value: (highestDmg.totalDmg / highestDmg.games).toFixed(0), label: 'Dano/Jogo' } : null,
            bestVision: bestVision ? { ...bestVision.player, value: (bestVision.totalVision / bestVision.games).toFixed(0), label: 'Visão/Jogo' } : null
        };
    }

    /**
     * Get PDL Evolution (Start vs Current for Season)
     */
    async getPdlEvolution(puuid: string, queueType: 'SOLO' | 'FLEX' = 'SOLO') {
        const snapshots = await prisma.rankSnapshot.findMany({
            where: { playerId: puuid, queueType },
            orderBy: { createdAt: 'asc' }
        });

        if (snapshots.length === 0) return null;

        const start = snapshots[0];
        const current = snapshots[snapshots.length - 1];

        // Normalize LP
        const getVal = (tier: string, lp: number) => {
            const map: any = { IRON: 0, BRONZE: 400, SILVER: 800, GOLD: 1200, PLATINUM: 1600, EMERALD: 2000, DIAMOND: 2400, MASTER: 2800, GRANDMASTER: 2800, CHALLENGER: 2800 };
            return (map[tier] || 0) + lp;
        };

        const startVal = getVal(start.tier, start.lp);
        const currentVal = getVal(current.tier, current.lp);
        const gain = currentVal - startVal;

        return {
            start: { tier: start.tier, rank: start.rank, lp: start.lp, date: start.createdAt },
            current: { tier: current.tier, rank: current.rank, lp: current.lp, date: current.createdAt },
            gain,
            gainLabel: gain > 0 ? `+${gain} LP` : `${gain} LP`
        };
    }
}
