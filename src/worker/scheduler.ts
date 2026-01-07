import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import { join } from 'path';
import { CronJob } from 'cron';

const prisma = new PrismaClient();

// Flag to prevent overlapping jobs (extra safety)
let isJobRunning = false;

async function runScript(scriptName: string, args: string[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log(`\n🚀 [SCHEDULER] Starting Job: ${scriptName}`);
        const start = Date.now();

        const child = spawn('npx', ['ts-node', join(__dirname, '../cli', scriptName), ...args], {
            stdio: 'inherit',
            shell: true,
            env: { ...process.env, PATH: process.env.PATH }
        });

        child.on('close', (code) => {
            const duration = ((Date.now() - start) / 1000).toFixed(2);
            if (code === 0) {
                console.log(`✅ [SCHEDULER] Finished ${scriptName} in ${duration}s`);
                resolve();
            } else {
                console.error(`❌ [SCHEDULER] Failed ${scriptName} (Exit Code: ${code})`);
                reject(new Error(`Script ${scriptName} failed with code ${code}`));
            }
        });

        child.on('error', (err) => {
            console.error(`❌ [SCHEDULER] Error spawning ${scriptName}:`, err);
            reject(err);
        });
    });
}

/**
 * Validates system state and runs initial sync if needed.
 */
async function checkBootstrap() {
    console.log('🔍 Checking System Bootstrap Status...');

    const bootState = await prisma.systemState.findUnique({ where: { key: 'BOOTSTRAPPED' } });

    if (!bootState || bootState.value !== 'true') {
        console.log('⚠️ System NOT Bootstrapped. Starting First Run Protocol...');

        try {
            // 1. Sync Players (Create DB entries)
            await runScript('sync-players.ts');

            // 2. Sync Ranks (Get initial Tier/LP)
            await runScript('sync-ranks.ts');

            // 3. Ingest Batch (Limited to 25 matches for speed/safety)
            // We need to pass a flag or env var to ingest-batch to limit it.
            // Or we create a specific argument parsing in ingest-batch.
            // For now, let's assume we pass an ENV var via the child process
            process.env.MATCH_LIMIT = '25';
            // Note: We need to modify ingest-batch.ts to respect this env var!
            await runScript('ingest-batch.ts');
            delete process.env.MATCH_LIMIT; // Clean up

            // 4. Calculate Scores/Ranking
            // Currently we don't have a separate "Calc Baseline" script, 
            // but ingest-batch computes scores. 
            // We might want to run a specific "ranking-season.ts" if it exists?
            // Checking file list... "ranking-season.ts" exists.
            await runScript('ranking-season.ts');

            // 5. Mark Complete
            await prisma.systemState.upsert({
                where: { key: 'BOOTSTRAPPED' },
                update: { value: 'true' },
                create: { key: 'BOOTSTRAPPED', value: 'true' }
            });

            console.log('✨ Bootstrap Complete! System is ready for production cycles.');

        } catch (error) {
            console.error('❌ Bootstrap Failed!', error);
            // We allow retry on next restart
            process.exit(1);
        }
    } else {
        console.log('✅ System already bootstrapped.');
    }
}

async function startScheduler() {
    console.log('⏰ Scheduler Starting (Queue Mode)...');

    // Ensure Bootstrap before accepting cron jobs
    await checkBootstrap();

    // Define Jobs
    // Note: We use CronJob but we WRAP execution in a generic handler 
    // to ensure NO overlaps if previous job is stuck.

    const wrapJob = (name: string, script: string) => async () => {
        if (isJobRunning) {
            console.log(`⚠️ Skip ${name}: Another job is running.`);
            return;
        }
        isJobRunning = true;
        try {
            await runScript(script);
        } catch (e) {
            console.error(`Error in job ${name}:`, e);
        } finally {
            isJobRunning = false;
        }
    };

    // 1. Ingest & Rank Sync (Every 6 Hours)
    // 0 */6 * * * -> At minute 0 past hour 0, 6, 12, and 18.
    new CronJob('0 */6 * * *', async () => {
        if (isJobRunning) return;
        isJobRunning = true;
        try {
            // Serial Execution
            await runScript('sync-ranks.ts');
            await runScript('ingest-batch.ts');
        } finally {
            isJobRunning = false;
        }
    }, null, true, 'America/Sao_Paulo');

    // 2. Daily Snapshot (00:00)
    // We assume snapshot.ts creates the PdlDailyStats? 
    // Actually existing code has `sync-players` doing stats?
    // Let's stick to the plan: "snapshot:daily" -> likely `snapshot.ts`
    new CronJob('0 0 * * *', wrapJob('Daily Snapshot', 'snapshot.ts'), null, true, 'America/Sao_Paulo');

    // 3. Player Sync (04:00 - Low Traffic)
    new CronJob('0 4 * * *', wrapJob('Player Sync', 'sync-players.ts'), null, true, 'America/Sao_Paulo');

    // 4. Weekly Insights (Monday 06:00)
    // new CronJob('0 6 * * 1', wrapJob('Weekly Insights', 'calc-insights.ts'), null, true, 'America/Sao_Paulo');

    console.log('📅 Cron Jobs Scheduled.');

    // Keep process alive
    process.stdin.resume();
}

startScheduler();
