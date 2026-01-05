/**
 * MatchScore Calculation Engine
 * PURE LOGIC - NO DATABASE ACCESS
 * 
 * Rules:
 * 1. Score is 0-100 Integer.
 * 2. Immutable.
 * 3. 4 Blocks: Result (25), Performance (45), Objectives (20), Discipline (10).
 * 4. Comparison vs Lane Average (Context).
 * 5. All Metrics Normalized per Minute.
 */

// --- Interfaces for Raw Data (Minimal subset of Riot V5) ---
export interface Participant {
    puuid: string;
    riotIdGameName: string;
    riotIdTagLine: string;
    teamId: number;
    teamPosition: string; // "TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"
    win: boolean;

    // Performance
    kills: number;
    deaths: number;
    assists: number;
    totalMinionsKilled: number;
    neutralMinionsKilled: number; // For CS
    goldEarned: number;
    totalDamageDealtToChampions: number;
    visionScore: number;
    timePlayed: number; // Seconds

    // Objectives (Participation usually derived or direct)
    challenges?: {
        turretTakedowns?: number;
        dragonTakedowns?: number;
        baronTakedowns?: number;
        riftHeraldTakedowns?: number;
        [key: string]: any;
    };
    // Fallback if challenges are missing (Legacy)
    turretKills?: number;
    dragonKills?: number;
    baronKills?: number;
}

export interface MatchDTO {
    metadata: {
        matchId: string;
    };
    info: {
        gameDuration: number;
        participants: Participant[];
    };
}

export interface MatchScoreResult {
    matchScore: number;
    breakdown: {
        result: number;
        performance: number;
        objectives: number;
        discipline: number;
    };
    laneContext: {
        opponentPuuid: string | null;
        laneAvgKda: number;
        laneAvgCspm: number;
        laneAvgGpm: number;
        laneAvgDpm: number;
        laneAvgVspm: number;
    };
}

// --- Helpers ---
const toPerMin = (value: number, seconds: number): number => {
    if (seconds <= 0) return 0;
    return value / (seconds / 60);
};

const getLaneOpponent = (target: Participant, participants: Participant[]): Participant | null => {
    if (target.teamPosition === 'Invalid' || !target.teamPosition) return null;
    return participants.find(p => p.teamPosition === target.teamPosition && p.teamId !== target.teamId) || null;
};

// --- Logic Blocks ---

const calculateResultScore = (win: boolean): number => {
    return win ? 25 : 10;
};

const calculatePerformanceScore = (p: Participant, opp: Participant | null, duration: number): { score: number, scores: any, averages: any } => {
    // RULE: If no opponent, return fixed 27 points (Average of block)
    if (!opp) {
        const kda = (p.kills + p.assists) / Math.max(1, p.deaths);
        const cspm = toPerMin(p.totalMinionsKilled + p.neutralMinionsKilled, duration);
        const gpm = toPerMin(p.goldEarned, duration);
        const dpm = toPerMin(p.totalDamageDealtToChampions, duration);
        const vspm = toPerMin(p.visionScore, duration);

        return {
            score: 27,
            scores: { note: "No opponent - fixed score" },
            averages: {
                avgKda: kda, avgCspm: cspm, avgGpm: gpm, avgDpm: dpm, avgVspm: vspm
            } // Return self stats as averages to avoid nulls, but score is fixed.
        };
    }

    const maxPerMetric = 9;

    // Metrics
    const kda = (p.kills + p.assists) / Math.max(1, p.deaths);
    const cspm = toPerMin(p.totalMinionsKilled + p.neutralMinionsKilled, duration);
    const gpm = toPerMin(p.goldEarned, duration);
    const dpm = toPerMin(p.totalDamageDealtToChampions, duration);
    const vspm = toPerMin(p.visionScore, duration);

    // Averages (Target + Opponent / 2)
    const oppKda = (opp.kills + opp.assists) / Math.max(1, opp.deaths);
    const oppCspm = toPerMin(opp.totalMinionsKilled + opp.neutralMinionsKilled, duration);
    const oppGpm = toPerMin(opp.goldEarned, duration);
    const oppDpm = toPerMin(opp.totalDamageDealtToChampions, duration);
    const oppVspm = toPerMin(opp.visionScore, duration);

    const avgKda = (kda + oppKda) / 2;
    const avgCspm = (cspm + oppCspm) / 2;
    const avgGpm = (gpm + oppGpm) / 2;
    const avgDpm = (dpm + oppDpm) / 2;
    const avgVspm = (vspm + oppVspm) / 2;

    const calcMetric = (val: number, avg: number): number => {
        if (avg === 0) return maxPerMetric;
        const ratio = val / avg;
        if (ratio >= 1.0) return 9;
        if (ratio >= 0.75) return 6;
        if (ratio >= 0.50) return 4;
        return 2;
    };

    const sKda = calcMetric(kda, avgKda);
    const sCspm = calcMetric(cspm, avgCspm);
    const sGpm = calcMetric(gpm, avgGpm);
    const sDpm = calcMetric(dpm, avgDpm);
    const sVspm = calcMetric(vspm, avgVspm);

    return {
        score: sKda + sCspm + sGpm + sDpm + sVspm, // Max 45
        scores: { sKda, sCspm, sGpm, sDpm, sVspm },
        averages: { avgKda, avgCspm, avgGpm, avgDpm, avgVspm }
    };
};

const calculateObjectivesScore = (p: Participant): number => {
    // Using challenges if available (V5 standard), fallbacks else
    const turrets = p.challenges?.turretTakedowns ?? p.turretKills ?? 0;
    const dragons = p.challenges?.dragonTakedowns ?? p.dragonKills ?? 0;
    const barons = p.challenges?.baronTakedowns ?? p.baronKills ?? 0;
    const heralds = p.challenges?.riftHeraldTakedowns ?? 0;

    // Weights: Turret 2, Dragon 1.5, Baron 3, Herald 2
    const rawScore = (turrets * 2) + (dragons * 1.5) + (barons * 3) + (heralds * 2);

    return Math.min(20, Math.floor(rawScore));
};

const calculateDisciplineScore = (p: Participant, opp: Participant | null): number => {
    // Metric: Deaths vs Lane Average
    const oppDeaths = opp ? opp.deaths : p.deaths;
    const avgDeaths = (p.deaths + oppDeaths) / 2;

    // Rules
    // <= Avg -> 10
    // <= Avg + 2 -> 6
    // > Avg + 2 -> 2

    if (p.deaths <= avgDeaths) return 10;
    if (p.deaths <= avgDeaths + 2) return 6;
    return 2;
};

// --- Main Function ---

export const calculateMatchScore = (targetPuuid: string, match: MatchDTO): MatchScoreResult => {
    const p = match.info.participants.find(part => part.puuid === targetPuuid);
    if (!p) throw new Error("Participant not found in match");

    const duration = match.info.gameDuration; // Seconds
    const opp = getLaneOpponent(p, match.info.participants);

    // 1. Result (Max 25)
    const scoreResult = calculateResultScore(p.win);

    // 2. Performance (Max 45)
    const perfCalc = calculatePerformanceScore(p, opp, duration);
    const scorePerformance = perfCalc.score;

    // 3. Objectives (Max 20)
    const scoreObjectives = calculateObjectivesScore(p);

    // 4. Discipline (Max 10)
    const scoreDiscipline = calculateDisciplineScore(p, opp);

    // Total with Clamp 100
    const totalRaw = scoreResult + scorePerformance + scoreObjectives + scoreDiscipline;
    const matchScore = Math.min(100, Math.floor(totalRaw));

    return {
        matchScore,
        breakdown: {
            result: scoreResult,
            performance: scorePerformance,
            objectives: scoreObjectives,
            discipline: scoreDiscipline
        },
        laneContext: {
            opponentPuuid: opp ? opp.puuid : null,
            laneAvgKda: perfCalc.averages.avgKda,
            laneAvgCspm: perfCalc.averages.avgCspm,
            laneAvgGpm: perfCalc.averages.avgGpm,
            laneAvgDpm: perfCalc.averages.avgDpm,
            laneAvgVspm: perfCalc.averages.avgVspm
        }
    };
};

/**
 * EXPLANATION OF 100 POINT RARITY:
 * 
 * To achieve 100 points, a player must:
 * 1. Win the game (25 pts).
 * 2. Perform BETTER than the lane average in ALL 5 categories (KDA, CS, Gold, Dmg, Vision).
 *    - Example: Having more Vision than the Support AND more CS than the ADC average is extremely hard.
 *    - Getting 9 points in all 5 categories (45 pts) is theoretically possible but practically insane.
 * 3. Participate in sufficient objectives (approx 8-10 takedowns) (20 pts).
 * 4. Die LESS than the lane average (10 pts).
 * 
 * A typical "Hard Carry" usually misses the Vision metric or Discipline metric. 
 * A "Perfect Support" usually misses the CS or Damage metric.
 * Thus, 100 is reserved for true statistical anomalies.
 */
