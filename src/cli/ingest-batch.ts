import 'dotenv/config';
import { RiotService } from '../services/riot.service';
import { calculateMatchScore, MatchDTO, Participant } from '../engine/scoring.engine';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MAX_MATCHES_PER_PLAYER = 20;

// Extended interface for ingestion (same as in ingest-match.ts)
interface IngestMatchDTO extends MatchDTO {
    info: {
        gameDuration: number;
        gameCreation: number;
        queueId: number;
        participants: Participant[];
    };
}

import { SEASON_CONFIG } from '../config/season';

// Helper: Season Validation
const isInActiveSeason = (gameCreation: number): boolean => {
    // Configurable Season Dates (from src/config/season.ts)
    const seasonStart = new Date(`${SEASON_CONFIG.START_DATE}T00:00:00Z`).getTime();
    const seasonEnd = new Date(`${SEASON_CONFIG.END_DATE}T23:59:59Z`).getTime();
    return gameCreation >= seasonStart && gameCreation <= seasonEnd;
};

// Helper: Canonical Duration (from participants)
const getMatchDurationSeconds = (participants: Participant[]): number => {
    return Math.max(...participants.map(p => p.timePlayed ?? 0));
};

async function main() {
    const apiKey = process.env.RIOT_API_KEY;
    if (!apiKey) {
        console.error('Error: RIOT_API_KEY is not configured in .env');
        process.exit(1);
    }

    const riotService = new RiotService(apiKey);

    console.log('Starting Batch Ingestion Job...');

    // Summary Counters
    const summary = {
        playersProcessed: 0,
        matchesFound: 0,
        matchesSaved: 0,
        matchesAlreadyProcessed: 0,
        matchesIgnored: 0,
        errors: 0
    };

    try {
        // 1. Fetch Active Players
        const players = await prisma.player.findMany({
            where: { isActive: true }
        });

        console.log(`Found ${players.length} active players.`);

        // 2. Sequential Player Loop
        for (const player of players) {
            summary.playersProcessed++;
            const logPrefix = `[Player ${player.gameName}]`;
            console.log(`${logPrefix} Processing...`);

            try {
                // Fetch Match IDs (Solo & Flex) - Limit 20 each to be safe, then merge and cap
                const soloIds = await riotService.getRecentMatchIds(player.puuid, 420, MAX_MATCHES_PER_PLAYER);
                const flexIds = await riotService.getRecentMatchIds(player.puuid, 440, MAX_MATCHES_PER_PLAYER);

                // Merge and dedup
                const allIds = Array.from(new Set([...soloIds, ...flexIds]));
                // Slice to strict MAX if needed, though usually we want to process as much recent as allowed. 
                // User said "Limit matches per player... Evita puxar histórico desnecessário". 
                // Let's take the top MAX_MATCHES_PER_PLAYER most recent (assuming API returns recent first).
                const targetIds = allIds.slice(0, MAX_MATCHES_PER_PLAYER);

                summary.matchesFound += targetIds.length;

                // 3. Sequential Match Loop
                for (const matchId of targetIds) {
                    const matchPrefix = `${logPrefix} [Match ${matchId}]`;

                    try {
                        // Check Database first (Idempotency & Logs)
                        const existingScore = await prisma.matchScore.findUnique({
                            where: {
                                playerId_matchId: {
                                    playerId: player.puuid,
                                    matchId: matchId
                                }
                            }
                        });

                        if (existingScore) {
                            console.log(`${matchPrefix} already processed`);
                            summary.matchesAlreadyProcessed++;
                            continue;
                        }

                        // Fetch Details
                        // We cast to our extended interface
                        const match = await riotService.getMatchDetails(matchId) as unknown as IngestMatchDTO;

                        // --- CHECKS ---

                        // 1. Season Check
                        if (!isInActiveSeason(match.info.gameCreation)) {
                            console.log(`${matchPrefix} ignored (outside season)`);
                            summary.matchesIgnored++;
                            continue;
                        }

                        const correctDuration = getMatchDurationSeconds(match.info.participants);

                        // 2. Duration Check
                        if (correctDuration < 600) {
                            console.log(`${matchPrefix} ignored (duration < 10min)`);
                            summary.matchesIgnored++;
                            continue;
                        }

                        // PATCH: Update match object with correct duration so Engine sees it too
                        match.info.gameDuration = correctDuration;

                        // Calculate Score
                        const result = calculateMatchScore(player.puuid, match);

                        if (!result) {
                            // Can happen if "No opponent found" or other internal checks in engine
                            // We assume engine logs warnings, calling script logs explicit reason if known or generic.
                            // The engine currently returns null for < 10min (handled above) or No Opponent.
                            // We can infer it's likely "no lane opponent" or similar structural issue.
                            console.log(`${matchPrefix} ignored (engine returned null - likely no lane opponent)`);
                            summary.matchesIgnored++;
                            continue;
                        }

                        // --- PERSISTENCE ---

                        // Determine Queue Type explicitly
                        let queueType = 'OTHER';
                        if (match.info.queueId === 420) queueType = 'SOLO';
                        else if (match.info.queueId === 440) queueType = 'FLEX';

                        // Upsert Match
                        await prisma.match.upsert({
                            where: { matchId: matchId },
                            update: {},
                            create: {
                                matchId: matchId,
                                queueType: queueType,
                                gameCreation: new Date(match.info.gameCreation),
                                gameDuration: correctDuration // Store canonical duration
                            }
                        });

                        // Derive Lane (Redundant but required for schema)
                        // Using same logic as ingest-match: trust participant position if valid
                        const pData = match.info.participants.find(p => p.puuid === player.puuid);
                        if (!pData) throw new Error("Participant missing in match data"); // Should not happen if score calc worked

                        const validLanes = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
                        const lane = validLanes.includes(pData.teamPosition) ? pData.teamPosition : 'MIDDLE';

                        // Ensure we use the properties from the updated interface
                        // Note: pData is Participant, which has championId/championName now.

                        // Create Score
                        await prisma.matchScore.create({
                            data: {
                                playerId: player.puuid,
                                matchId: matchId,
                                lane: lane,
                                championId: pData.championId,
                                championName: pData.championName,
                                isVictory: result.breakdown.isVictory,
                                matchScore: result.matchScore,
                                performanceScore: result.breakdown.performance,
                                objectivesScore: result.breakdown.objectives,
                                disciplineScore: result.breakdown.discipline,
                                metrics: {
                                    ...result.metrics,
                                    kills: pData.kills,
                                    deaths: pData.deaths,
                                    assists: pData.assists,
                                    championName: pData.championName,
                                    championId: pData.championId
                                } as any,
                                ratios: result.ratios
                            }
                        });

                        console.log(`${matchPrefix} saved`);
                        summary.matchesSaved++;

                        // Optional: small delay to be nice to API if not bottlenecked enough?
                        // Bottleneck handles 20/sec, we are fine.

                    } catch (matchError: any) {
                        console.error(`${matchPrefix} Error: ${matchError.message}`);
                        // Do NOT throw, continue to next match
                        summary.errors++;
                    }
                } // End Match Loop

            } catch (playerError: any) {
                console.error(`${logPrefix} Failed to process player: ${playerError.message}`);
                // Continue to next player
                summary.errors++;
            }
        } // End Player Loop

    } catch (error: any) {
        console.error('Fatal Job Error:', error.message);
    } finally {
        await prisma.$disconnect();

        // Final Summary
        console.log('\n--- Batch Job Finished ---');
        console.log(`Players Processed: ${summary.playersProcessed}`);
        console.log(`Matches Found (Total): ${summary.matchesFound}`);
        console.log(`Matches Saved: ${summary.matchesSaved}`);
        console.log(`Matches Already Processed: ${summary.matchesAlreadyProcessed}`);
        console.log(`Matches Ignored: ${summary.matchesIgnored}`);
        console.log(`Errors: ${summary.errors}`);
        console.log('--------------------------');
    }
}

main();
