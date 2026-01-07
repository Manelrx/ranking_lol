import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { RiotService } from '../services/riot.service';
import { TRACKED_PLAYERS } from '../config/players';

const prisma = new PrismaClient();
const riotService = new RiotService(process.env.RIOT_API_KEY!);

async function main() {
    console.log('🔄 Iniciando Sincronização de Jogadores...');

    // 1. Desativar jogadores que não estão na lista (Opcional, ou apenas marcar isActive=false)
    // Por segurança, vamos apenas Upsert os da lista e garantir que estão ativos.

    let added = 0;
    let updated = 0;
    let errors = 0;

    for (const p of TRACKED_PLAYERS) {
        try {
            console.log(`Verificando: ${p.gameName} #${p.tagLine}`);

            // Tenta buscar no Banco primeiro
            const existing = await prisma.player.findFirst({
                where: {
                    gameName: { equals: p.gameName, mode: 'insensitive' },
                    tagLine: { equals: p.tagLine, mode: 'insensitive' }
                }
            });

            if (existing) {
                // Atualizar status se mudou
                if (existing.isActive !== p.isActive) {
                    await prisma.player.update({
                        where: { puuid: existing.puuid },
                        data: { isActive: p.isActive }
                    });
                    console.log(` -> Status atualizado para: ${p.isActive}`);
                    updated++;
                } else {
                    console.log(` -> OK (Já existe)`);
                }
            } else {
                // Novo Jogador - Precisa buscar PUUID na Riot
                if (!p.isActive) continue; // Não adiciona inativos novos

                console.log(` -> Novo jogador! Buscando PUUID na Riot...`);
                const account = await riotService.getAccountByRiotId(p.gameName, p.tagLine);

                if (!account) {
                    console.error(` -> ERRO: Conta não encontrada na Riot: ${p.gameName}#${p.tagLine}`);
                    errors++;
                    continue;
                }

                await prisma.player.create({
                    data: {
                        puuid: account.puuid,
                        gameName: account.gameName,
                        tagLine: account.tagLine,
                        displayName: `${account.gameName} #${account.tagLine}`,
                        isActive: true
                    }
                });
                console.log(` -> CRIADO: ${account.gameName} (${account.puuid})`);
                added++;
            }

        } catch (err: any) {
            console.error(`Erro ao processar ${p.gameName}: ${err.message}`);
            errors++;
        }
    }

    console.log('\n--- Resumo ---');
    console.log(`Adicionados: ${added}`);
    console.log(`Atualizados: ${updated}`);
    console.log(`Erros: ${errors}`);

    // Opcional: Desativar quem NÃO está na lista
    // const activePuuids = ...
    // await prisma.player.updateMany({ where: { puuid: { notIn: activePuuids } }, data: { isActive: false } })
    // Deixando comentado por segurança por enquanto.
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
