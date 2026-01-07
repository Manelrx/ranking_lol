import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { RiotService } from '../services/riot.service';
import { TRACKED_PLAYERS } from '../config/players';
import { DateUtils } from '../lib/date';
import axios from 'axios';

const prisma = new PrismaClient();
const riotService = new RiotService(process.env.RIOT_API_KEY!);

// Cache for Champion ID -> Name
let CHAMPION_MAP: Record<number, string> = {};

async function loadChampionMap() {
    try {
        console.log('🗺️  Baixando DataDragon Champions...');
        const res = await axios.get('https://ddragon.leagueoflegends.com/cdn/14.24.1/data/pt_BR/champion.json');
        const data = res.data.data;
        for (const key in data) {
            const champ = data[key];
            CHAMPION_MAP[parseInt(champ.key)] = champ.name;
        }
        console.log(`✅ ${Object.keys(CHAMPION_MAP).length} campeões mapeados.`);
    } catch (e) {
        console.error('❌ Erro ao baixar DDragon:', e);
    }
}

async function main() {
    console.log('🔄 Iniciando Sincronização Completa (Evolution)...');
    await loadChampionMap();

    const today = DateUtils.normalizeDate(new Date());

    for (const p of TRACKED_PLAYERS) {
        try {
            if (!p.isActive) continue;

            console.log(`\n👤 Processando: ${p.gameName} #${p.tagLine}`);

            // 1. Resolve Account & PUUID
            let puuid = '';
            let player = await prisma.player.findFirst({
                where: { gameName: { equals: p.gameName, mode: 'insensitive' }, tagLine: { equals: p.tagLine, mode: 'insensitive' } }
            });

            if (player) {
                puuid = player.puuid;
            } else {
                console.log('   -> Buscando PUUID...');
                const account = await riotService.getAccountByRiotId(p.gameName, p.tagLine);
                puuid = account.puuid;
                player = await prisma.player.create({
                    data: {
                        puuid,
                        gameName: account.gameName,
                        tagLine: account.tagLine,
                        displayName: `${account.gameName} #${account.tagLine}`,
                        isActive: true
                    }
                });
            }

            // 2. CHECK STALE DATA (24h Cache)
            const now = new Date();
            const lastUpdate = new Date(player.updatedAt);
            const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
            const isFresh = hoursDiff < 24;

            if (false && isFresh && player.profileIconId) {
                console.log('   -> Dados em cache (24h). Pulando atualização estática (Ícone/Maestria).');
            } else {
                // Update Summoner Info (Icon & Level)
                console.log('   -> Atualizando Ícone e Nível...');
                const summoner = await riotService.getSummonerByPuuid(puuid);
                await prisma.player.update({
                    where: { puuid },
                    data: {
                        profileIconId: summoner.profileIconId,
                        summonerLevel: summoner.summonerLevel,
                        isActive: true
                    }
                });

                // Update Champion Masteries
                console.log('   -> Baixando Maestrias...');
                const masteries = await riotService.getChampionMasteries(puuid, 12); // Top 12
                for (const m of masteries) {
                    const champName = CHAMPION_MAP[m.championId] || `Champ ${m.championId}`;

                    await prisma.championMastery.upsert({
                        where: {
                            playerId_championId: { playerId: puuid, championId: m.championId }
                        },
                        create: {
                            playerId: puuid,
                            championId: m.championId,
                            championName: champName,
                            championLevel: m.championLevel,
                            championPoints: m.championPoints,
                            lastPlayTime: m.lastPlayTime
                        },
                        update: {
                            championName: champName,
                            championLevel: m.championLevel,
                            championPoints: m.championPoints,
                            lastPlayTime: m.lastPlayTime
                        }
                    });
                }
            }

            // 4. Update PDL Daily Stats (Snapshot)
            console.log('   -> Verificando PDL (Dynamic)...');

            // Check if we already have a snapshot for today
            const hasSoloToday = await prisma.pdlDailyStats.findUnique({
                where: { playerId_queueType_date: { playerId: puuid, queueType: 'SOLO', date: today } }
            });
            const hasFlexToday = await prisma.pdlDailyStats.findUnique({
                where: { playerId_queueType_date: { playerId: puuid, queueType: 'FLEX', date: today } }
            });

            // If we have both, and user wants "Conservative", maybe we skip League V4 call?
            // "O sistema deve priorizar estabilidade".
            // If we have stats today, we can skip. But if we want real-time updates of "EndLP", we should fetch.
            // Let's implement: If fresh (<1h) skip? Or just respect rate limit?
            // Rate limit in RiotService is strict (10/s). We can afford to call but sequentially.
            // However, to be super safe: check summonerId


            // 5. League V4 (Rank/Tier) - Now using PUUID directly (User feedback)
            console.log('   -> Verificando Liga (League-V4 by PUUID)...');
            const leagues = await riotService.getLeagueEntriesByPuuid(puuid);
            for (const queue of ['SOLO', 'FLEX']) {
                const riotQueueType = queue === 'SOLO' ? 'RANKED_SOLO_5x5' : 'RANKED_FLEX_SR';
                const entry = leagues.find((l: any) => l.queueType === riotQueueType);

                if (!entry) continue;

                const currentLp = entry.leaguePoints;

                // Find existing daily stat
                const daily = await prisma.pdlDailyStats.findUnique({
                    where: { playerId_queueType_date: { playerId: puuid, queueType: queue, date: today } }
                });

                if (daily) {
                    // Update End and Peak
                    await prisma.pdlDailyStats.update({
                        where: { id: daily.id },
                        data: {
                            endLp: currentLp,
                            peakLp: Math.max(daily.peakLp, currentLp)
                        }
                    });
                } else {
                    await prisma.pdlDailyStats.create({
                        data: {
                            playerId: puuid,
                            queueType: queue,
                            date: today,
                            startLp: currentLp,
                            endLp: currentLp,
                            peakLp: currentLp,
                            wins: 0,
                            losses: 0
                        }
                    });
                }

                // --- CRITICAL FIX: Create RankSnapshot for Ranking Table ---
                // We create a snapshot for "Now".
                // Ideally we don't spam snapshots. One per sync/day is fine.
                // Let's check if we have a snapshot for today ~hour?
                // For simplicity/robustness regarding "Latest" query: just create one.
                // Or update the latest one if it was created today?
                // Let's simple create. The service takes the "latest" by `orderBy: { createdAt: 'desc' }`.

                await prisma.rankSnapshot.create({
                    data: {
                        playerId: puuid,
                        queueType: queue,
                        tier: entry.tier,
                        rank: entry.rank,
                        lp: entry.leaguePoints
                    }
                });
                console.log(`   -> Rank Salvo: ${queue} ${entry.tier} ${entry.rank} ${entry.leaguePoints}pdl`);
            }

        } catch (err: any) {
            if (err?.response?.status === 403) {
                console.error(`❌ Erro 403 (Forbidden) em ${p.gameName}. Verifique a API Key.`);
            } else {
                console.error(`❌ Erro em ${p.gameName}: ${err.message}`);
            }
        }
    }

    console.log('\n✨ Sincronização Evolution Concluída!');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
