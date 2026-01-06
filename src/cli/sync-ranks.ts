// @ts-nocheck
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { RiotService } from '../services/riot.service';

const prisma = new PrismaClient();

// Queue Mappings
const QUEUE_MAP = {
    'RANKED_SOLO_5x5': 'SOLO',
    'RANKED_FLEX_SR': 'FLEX'
};

/*
    Sync Ranks Script (Rebuilt)
    1. Loop active players
    2. Refresh PUUID (Critical for data integrity)
    3. Fetch SummonerID
    4. Sync Ranks
*/

async function main() {
    console.log(`\n🔄 Starting Sync Ranks Job...`);

    const apiKey = process.env.RIOT_API_KEY;
    if (!apiKey) {
        console.error('Error: RIOT_API_KEY is not configured');
        process.exit(1);
    }
    const riotService = new RiotService(apiKey);

    try {
        const players = await prisma.player.findMany({ where: { isActive: true } });
        console.log(`Checking ${players.length} active players...`);

        for (const player of players) {
            // Rate Limit Delay
            await new Promise(r => setTimeout(r, 200));

            try {
                // 1. Always Refresh PUUID (The "Fix")
                // This guarantees we have the correct string for the SummonerV4 call
                let currentPuuid = player.puuid;
                let summonerId = player.summonerId;

                try {
                    // Try to fetch Summoner directly first? 
                    // No, based on debugging, we MUST ensure the PUUID is fresh/correct if we had issues.
                    // But to be efficient, let's try stored PUUID first, if it fails, THEN refresh.
                    // WAIT. The debugging showed "DB PUUID" failing and "Fresh PUUID" working even if strings look equal.
                    // So we MUST Refresh.
                    const freshPuuid = await riotService.getPuuid(player.gameName, player.tagLine);

                    if (freshPuuid !== currentPuuid) {
                        console.log(`[FIX] PUUID Mismatch/Refresh for ${player.gameName}`);
                        await prisma.player.update({
                            where: { puuid: currentPuuid },
                            data: { puuid: freshPuuid }
                        });
                        currentPuuid = freshPuuid;
                    }

                    // Now Fetch Summoner ID using the (possibly updated) PUUID
                    const sumData = await riotService.getSummonerByPuuid(currentPuuid);
                    const sDataAny = sumData as any;
                    if (!sDataAny || !sDataAny.id) {
                        // Should not happen with fresh PUUID, but if it does...
                        throw new Error(`API returned invalid Summoner Data (Missing ID) for ${player.gameName}`);
                    }

                    summonerId = sDataAny.id;

                    // Update DB with SummonerID if missing or changed
                    if (summonerId !== player.summonerId) {
                        await prisma.player.update({
                            where: { puuid: currentPuuid },
                            data: { summonerId }
                        });
                        // console.log(`[INIT] SummonerID Resolved.`);
                    }

                } catch (e: any) {
                    console.error(`[WARN] Failed to resolve identity for ${player.gameName}: ${e.message}`);
                    continue; // Skip this player if we can't identify them
                }

                // 2. Fetch League Entries
                const entries = await riotService.getLeagueEntries(summonerId);

                // 3. Process Queues
                const queuesToSync = ['RANKED_SOLO_5x5', 'RANKED_FLEX_SR'];
                let soloEntry = null;

                for (const qType of queuesToSync) {
                    // @ts-ignore
                    const mappedQueue = QUEUE_MAP[qType];
                    const entry = entries.find(e => e.queueType === qType);

                    if (qType === 'RANKED_SOLO_5x5') soloEntry = entry;

                    if (!entry) {
                        // console.log(`[SYNC] ${player.gameName} ${mappedQueue} -> UNRANKED`);
                        continue;
                    }

                    const lastSnap = await prisma.rankSnapshot.findFirst({
                        where: { playerId: currentPuuid, queueType: mappedQueue },
                        orderBy: { createdAt: 'desc' }
                    });

                    const currentHash = `${entry.tier}-${entry.rank}-${entry.leaguePoints}`;
                    const lastHash = lastSnap ? `${lastSnap.tier}-${lastSnap.rank}-${lastSnap.lp}` : 'NONE';

                    if (currentHash !== lastHash) {
                        await prisma.rankSnapshot.create({
                            data: {
                                playerId: currentPuuid,
                                queueType: mappedQueue,
                                tier: entry.tier,
                                rank: entry.rank,
                                lp: entry.leaguePoints
                            }
                        });
                        console.log(`[SYNC] ${player.gameName} ${mappedQueue} -> ${entry.tier} ${entry.rank} ${entry.leaguePoints} LP (${lastSnap ? 'UPDATED' : 'NEW'})`);
                    } else {
                        // console.log(`[SYNC] ${player.gameName} ${mappedQueue} -> UNCHANGED`);
                    }
                }

                // 4. Update Player Model (SOLO)
                if (soloEntry) {
                    await prisma.player.update({
                        where: { puuid: currentPuuid },
                        data: {
                            tier: soloEntry.tier,
                            rank: soloEntry.rank
                        }
                    });
                }

            } catch (pError: any) {
                console.error(`Error processing ${player.gameName}: ${pError.message}`);
            }
        }
    } catch (error: any) {
        console.error("Fatal Error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
