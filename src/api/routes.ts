import { FastifyInstance } from 'fastify';
import { RankingService } from '../services/ranking.service';

const rankingService = new RankingService();

export async function rankingRoutes(fastify: FastifyInstance) {

    // 1. Ranking General
    interface RankingQuery { queue?: string; limit?: number; }
    fastify.get<{ Querystring: RankingQuery }>('/api/ranking/season', async (request, reply) => {
        const { queue = 'SOLO', limit = 100 } = request.query;
        // Validate queue
        const q = queue === 'FLEX' ? 'FLEX' : 'SOLO';
        const l = Number(limit) || 100;

        try {
            const data = await rankingService.getSeasonRanking(q, l);
            console.log(`[API] /ranking/season - ${data.length} records`);
            return data;
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    // 2. Ranking By Elo
    interface EloQuery { queue?: string; tier?: string; limit?: number; }
    fastify.get<{ Querystring: EloQuery }>('/api/ranking/season/by-elo', async (request, reply) => {
        const { queue = 'SOLO', tier = 'ALL', limit = 100 } = request.query;
        const q = queue === 'FLEX' ? 'FLEX' : 'SOLO';
        const l = Number(limit) || 100;

        try {
            const data = await rankingService.getRankingByElo(q, tier, l);
            return data;
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    // 3. Player History
    interface PlayerParams { puuid: string; }
    interface HistoryQuery { queue?: string; }
    fastify.get<{ Params: PlayerParams, Querystring: HistoryQuery }>('/api/player/:puuid/history', async (request, reply) => {
        const { puuid } = request.params;
        const { queue = 'SOLO' } = request.query;
        // Validate queue
        const q = queue === 'FLEX' ? 'FLEX' : 'SOLO';

        try {
            const data = await rankingService.getPlayerHistory(puuid, q);
            if (!data) return reply.status(404).send({ error: 'Player not found' });
            return data;
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    // 4. PDL Gain Ranking
    interface PdlQuery { queue?: string; limit?: number; }
    fastify.get<{ Querystring: PdlQuery }>('/api/ranking/pdl-gain', async (request, reply) => {
        const { queue = 'SOLO', limit = 20 } = request.query;
        const q = queue === 'FLEX' ? 'FLEX' : 'SOLO';
        const l = Number(limit) || 20;

        try {
            const data = await rankingService.getPdlGainRanking(q, l);
            return data;
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    // 6. Weekly Highlights
    interface HighlightsQuery { queue?: string; }
    fastify.get<{ Querystring: HighlightsQuery }>('/api/ranking/highlights', async (request, reply) => {
        const { queue = 'SOLO' } = request.query;
        const q = queue === 'FLEX' ? 'FLEX' : 'SOLO';

        try {
            const data = await rankingService.getWeeklyHighlights(q);
            return data;
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    // 5. Player Insights
    fastify.get<{ Params: PlayerParams, Querystring: HistoryQuery }>('/api/player/:puuid/insights', async (request, reply) => {
        const { puuid } = request.params;
        const { queue = 'SOLO' } = request.query;
        const q = queue === 'FLEX' ? 'FLEX' : 'SOLO';

        try {
            const data = await rankingService.getPlayerInsights(puuid, q);
            if (!data) {
                // Return empty/default object instead of 404 to satisfy frontend types
                return {
                    stats: {
                        avgScore: "0",
                        winRate: "0%",
                        totalGames: 0,
                        avgKda: "0",
                        bestScore: 0,
                        worstScore: 0
                    },
                    history: [],
                    insights: {
                        consistency: '-',
                        trend: '-'
                    }
                };
            }
            return data;
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}
