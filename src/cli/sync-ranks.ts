// 
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { RiotService } from '../services/riot.service';

const prisma = new PrismaClient();

// Queue Mappings
const QUEUE_MAP = {
    'RANKED_SOLO_5x5': 'SOLO',
    'RANKED_FLEX_SR': 'FLEX'
};

interface SummonerDTO {
    id: string;
    accountId: string;
    puuid: string;
    name: string;
    profileIconId: number;
    revisionDate: number;
    summonerLevel: number;
}

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
                // 1. Verify PUUID Integrity
                const freshPuuid = await riotService.getPuuid(player.gameName, player.tagLine);

                if (freshPuuid !== player.puuid) {
                    console.error(`[CRITICAL] PUUID Mismatch for ${player.gameName}. DB=${player.puuid} API=${freshPuuid}`);
                    console.error(`Skipping sync to prevent data corruption.`);
                    continue;
                }

                // 2. Fetch Summoner ID (using validated PUUID)
                let summonerId = player.summonerId;

                // Explicitly cast to internal interface to help TS/Runtime boundary
                const sumData = await riotService.getSummonerByPuuid(player.puuid) as SummonerDTO;

                if (!sumData || !sumData.id) {
                    // Log keys to help debug "Phantom ID" if it happens again
                    if (sumData) console.log("Summoner Keys:", Object.keys(sumData));
                    throw new Error(`API returned invalid Summoner Data (Missing ID) for ${player.gameName}`);
                }

                summonerId = sumData.id;

                // Update DB with SummonerID only (NEVER update PUUID here)
                if (summonerId !== player.summonerId) {
                    await prisma.player.update({
                        where: { puuid: player.puuid },
                        data: { summonerId }
                    });
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
                        where: { playerId: player.puuid, queueType: mappedQueue },
                        orderBy: { createdAt: 'desc' }
                    });

                    const currentHash = `${entry.tier}-${entry.rank}-${entry.leaguePoints}`;
                    const lastHash = lastSnap ? `${lastSnap.tier}-${lastSnap.rank}-${lastSnap.lp}` : 'NONE';

                    if (currentHash !== lastHash) {
                        await prisma.rankSnapshot.create({
                            data: {
                                playerId: player.puuid,
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
                        where: { puuid: player.puuid },
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
