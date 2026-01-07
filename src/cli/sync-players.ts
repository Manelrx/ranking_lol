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
        // Fallback or exit? Let's generic fallback.
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

            // 2. Update Summoner Info (Icon & Level)
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

            // 3. Update Champion Masteries
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

            // 4. Update PDL Daily Stats (Snapshot)
            // We need current Rank from League V4 to do this accurately
            const leagues = await riotService.getLeagueEntries(summoner.id);
            for (const queue of ['SOLO', 'FLEX']) {
                const riotQueueType = queue === 'SOLO' ? 'RANKED_SOLO_5x5' : 'RANKED_FLEX_SR';
                const entry = leagues.find((l: any) => l.queueType === riotQueueType);

                if (!entry) continue;

                const currentLp = entry.leaguePoints; // Need to normalize Tier? 
                // Using simple LP for now, assuming logic handles Tier changes elsewhere or we store raw LP relative to tier?
                // Wait, User wanted "Ganhos e Perdas". Ideally we store Total Normalized LP.
                // But PdlDailyStats usually tracks just LP if we also track Tier.
                // Let's stick to the schema: standard LP. Logic will calc diff based on Tier change.
                // Actually, schema has just `startLp`, `endLp`.

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
                    // Create new daily snapshot (Start = Current because it's first look of day, or fetch yesterday?)
                    // Best effort: Start = Current.
                    await prisma.pdlDailyStats.create({
                        data: {
                            playerId: puuid,
                            queueType: queue,
                            date: today,
                            startLp: currentLp,
                            endLp: currentLp,
                            peakLp: currentLp,
                            wins: 0, // Todo: calc from match ingest
                            losses: 0
                        }
                    });
                }
            }

        } catch (err: any) {
            console.error(`❌ Erro em ${p.gameName}: ${err.message}`);
        }
    }

    console.log('\n✨ Sincronização Evolution Concluída!');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
