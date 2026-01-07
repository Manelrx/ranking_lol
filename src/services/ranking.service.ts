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
    async getPdlGainRanking(queueType: 'SOLO' | 'FLEX', limit: number = 20, startDate?: Date) {
        const players = await prisma.player.findMany({ where: { isActive: true } });
        const gains = [];

        for (const player of players) {
            // Build where clause
            const whereClause: any = { playerId: player.puuid, queueType };
            if (startDate) {
                whereClause.createdAt = { gte: startDate };
            }

            // Get Snapshots sorted by date
            const snapshots = await prisma.rankSnapshot.findMany({
                where: whereClause,
                orderBy: { createdAt: 'asc' }
            });

            if (snapshots.length === 0) continue;

            // Handle single snapshot case (New players or start of season tracking)
            const start = snapshots[0];
            const end = snapshots[snapshots.length - 1];

            // Normalize LP (Simple tier approximation)
            const getVal = (tier: string, lp: number) => {
                const map: any = { IRON: 0, BRONZE: 400, SILVER: 800, GOLD: 1200, PLATINUM: 1600, EMERALD: 2000, DIAMOND: 2400, MASTER: 2800, GRANDMASTER: 2800, CHALLENGER: 2800 };
                return (map[tier] || 0) + lp;
            };

            const startVal = getVal(start.tier, start.lp);
            const endVal = getVal(end.tier, end.lp);
            // If only 1 snapshot, start == end, so gain is 0. This is fine, at least they show up.
            const gain = endVal - startVal;

            gains.push({
                puuid: player.puuid,
                gameName: player.gameName,
                tagLine: player.tagLine,
                profileIconId: player.profileIconId, // Added
                startTier: start.tier,
                startRank: start.rank,
                startLp: start.lp,
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
    async getPlayerInsights(puuid: string, queueType: 'SOLO' | 'FLEX', page: number = 1, limit: number = 10, sortDir: 'asc' | 'desc' = 'desc') {
        const player = await prisma.player.findUnique({ where: { puuid } });
        if (!player) return null;

        // Count Total for Pagination
        const totalMatches = await prisma.matchScore.count({
            where: {
                playerId: puuid,
                queueType: queueType
            }
        });

        // Optimized Query with Pagination & Correct Sorting
        const scores: any[] = await prisma.matchScore.findMany({
            where: {
                playerId: puuid,
                queueType: queueType
            } as any,
            orderBy: {
                match: {
                    gameCreation: sortDir // Sort by Actual Game Date
                }
            },
            skip: (page - 1) * limit,
            take: limit,
            include: { match: true }
        });

        // Calc Stats (Ideally should be aggregated separately or cached, but for now we calc on page 1 or separate query?)
        // Issue: If we paginate, 'avgScore' and 'winRate' must reflect TOTAL stats, not just this page.
        // So we need a separate aggregation query for stats, and one for history list.

        // Aggregation Query (All Time)
        // Using Prisma aggregate for performance
        const aggregations = await prisma.matchScore.aggregate({
            where: { playerId: puuid, queueType: queueType } as any,
            _avg: { matchScore: true, kills: true, deaths: true, assists: true },
            _sum: { kills: true, deaths: true, assists: true },
            _min: { matchScore: true },
            _max: { matchScore: true },
            _count: { isVictory: true } // Only counts rows, need conditional for wins
        });

        // Count wins specifically
        const wins = await prisma.matchScore.count({
            where: { playerId: puuid, queueType: queueType, isVictory: true } as any
        });

        // Best/Worst (Could be optimized but simple min/max works from agg)

        // KDA Calc (Total)
        const totalK = aggregations._sum.kills || 0;
        const totalD = aggregations._sum.deaths || 0;
        const totalA = aggregations._sum.assists || 0;
        const avgKda = totalD === 0 ? (totalK + totalA) : ((totalK + totalA) / totalD).toFixed(2);

        const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0.0";

        // Enhanced Match History Map (Paginated)
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
                avgScore: (aggregations._avg.matchScore || 0).toFixed(1),
                winRate: `${winRate}%`,
                totalGames: totalMatches,
                avgKda,
                bestScore: aggregations._max.matchScore ?? 0,
                worstScore: aggregations._min.matchScore ?? 0
            },
            history: matchHistory,
            pagination: {
                page,
                limit,
                total: totalMatches,
                totalPages: Math.ceil(totalMatches / limit)
            },
            insights: {
                consistency: 'Alta',
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

        // 1. Fetch all scores for this week
        const scores = await prisma.matchScore.findMany({
            where: {
                queueType: queueType,
                createdAt: { gte: monday }
            } as any, // Cast to avoid TS issues with generated types if out of sync
            include: { player: true }
        });

        if (scores.length === 0) return null;

        // 2. Group by Player
        const playerStats: Record<string, {
            player: any,
            games: number,
            wins: number,
            totalScore: number, // For MVP
            kills: number,
            deaths: number,
            assists: number,
            totalDmg: number,
            totalVision: number
        }> = {};

        scores.forEach((s: any) => {
            if (!playerStats[s.playerId]) {
                playerStats[s.playerId] = {
                    player: s.player,
                    games: 0, wins: 0, totalScore: 0,
                    kills: 0, deaths: 0, assists: 0,
                    totalDmg: 0, totalVision: 0
                };
            }
            const p = playerStats[s.playerId];
            p.games++;
            p.totalScore += (s.matchScore || 0);
            if (s.isVictory) p.wins++;
            p.kills += (s.kills || 0);
            p.deaths += (s.deaths || 0);
            p.assists += (s.assists || 0);

            // Extract JSON metrics safely
            const metrics = s.metrics as any;
            p.totalDmg += (metrics?.totalDamageDealtToChampions || 0);
            p.totalVision += (metrics?.visionScore || 0);
        });

        const statsArray = Object.values(playerStats);
        const minGames = 2; // Min valid for highlights
        const validStats = statsArray.filter(s => s.games >= minGames);

        // 3. Calculate Highlights

        // A) MVP (Highest Average Score)
        const mvp = validStats.sort((a, b) => (b.totalScore / b.games) - (a.totalScore / a.games))[0];

        // B) KDA King
        const kdaKing = validStats.sort((a, b) => {
            const kdaA = a.deaths === 0 ? (a.kills + a.assists) : (a.kills + a.assists) / a.deaths;
            const kdaB = b.deaths === 0 ? (b.kills + b.assists) : (b.kills + b.assists) / b.deaths;
            return kdaB - kdaA;
        })[0];

        // C) Most Active (Addicted)
        const mostActive = statsArray.sort((a, b) => b.games - a.games)[0];

        // D) Highest Damage (Avg per game)
        const highestDmg = validStats.sort((a, b) => (b.totalDmg / b.games) - (a.totalDmg / a.games))[0];

        // E) LP Machine (Pdl Gain this week) -> Reuse logic logic but optimize
        // calling getPdlGainRanking for this week
        const pdlRanking = await this.getPdlGainRanking(queueType, 1, monday);
        const lpMachineData = pdlRanking.length > 0 ? pdlRanking[0] : null;

        // Resolve LP Machine Player details
        let lpMachine = null;
        if (lpMachineData) {
            const p = await prisma.player.findUnique({ where: { puuid: lpMachineData.puuid } });
            if (p) {
                lpMachine = { ...p, value: `+${lpMachineData.pdlGain}`, label: 'PDL Ganho' };
            }
        }

        return {
            period: { start: monday.toISOString(), end: new Date().toISOString() },
            periodLabel: `Semana de ${monday.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`,

            mvp: mvp ? {
                ...mvp.player,
                value: (mvp.totalScore / mvp.games).toFixed(1),
                label: 'Pontos/Jogo'
            } : null,

            kdaKing: kdaKing ? {
                ...kdaKing.player,
                value: ((kdaKing.kills + kdaKing.assists) / (kdaKing.deaths || 1)).toFixed(2),
                label: 'KDA'
            } : null,

            mostActive: mostActive ? {
                ...mostActive.player,
                value: mostActive.games,
                label: 'Partidas'
            } : null,

            highestDmg: highestDmg ? {
                ...highestDmg.player,
                value: (highestDmg.totalDmg / highestDmg.games).toFixed(0),
                label: 'Dano/Jogo'
            } : null,

            lpMachine: lpMachine // Already formatted
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
