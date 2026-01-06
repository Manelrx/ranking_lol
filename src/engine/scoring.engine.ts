/**
 * MatchScore Calculation Engine
 * CANONICAL IMPLEMENTATION (60-30-10 Rule)
 * 
 * Rules:
 * 1. Score is 0-100 Integer.
 * 2. Immutable.
 * 3. Comparison vs Lane Average (Opponent).
 * 4. Structure:
 *    - Victory: Perf (60) + Obj (30) + Disc (10) = 100.
 *    - Defeat: Cap 40. KP < 35% = 0.
 */

// --- Interfaces ---

export interface Participant {
    puuid: string;
    riotIdGameName: string;
    riotIdTagLine: string;
    teamId: number;
    teamPosition: string; // "TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"
    win: boolean;

    // Base Stats
    kills: number;
    deaths: number;
    assists: number;
    totalMinionsKilled: number;
    neutralMinionsKilled: number;
    goldEarned: number;
    totalDamageDealtToChampions: number;
    totalDamageTaken: number;
    visionScore: number;
    timePlayed: number; // Seconds
    totalTimeSpentDead: number;

    // Team Stats (for KP)
    // You might need to derive team kills from the MatchDTO usually, 
    // but here we assume the helper creates a context or we sum everyone.

    // Objectives
    challenges?: {
        turretTakedowns?: number;
        dragonTakedowns?: number;
        baronTakedowns?: number;
        riftHeraldTakedowns?: number;
        [key: string]: any;
    };
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
        performance: number;
        objectives: number;
        discipline: number;
        isVictory: boolean;
        capApplied?: string;
    };
    metrics: {
        [key: string]: number; // Raw per-minute or ratio values
    };
    ratios: {
        [key: string]: number; // The computed ratios vs opponent
    };
}

// --- Configuration ---

type Lane = 'TOP' | 'JUNGLE' | 'MIDDLE' | 'BOTTOM' | 'UTILITY';

interface LaneConfig {
    [key: string]: number;
}

const LAYER_WEIGHTS: Record<Lane, LaneConfig> = {
    TOP: {
        cspm: 15,
        dpm: 15,
        tankiness: 10, // Tempo vivo / dano recebido
        kp: 10,
        vspm: 10
    },
    MIDDLE: {
        cspm: 15,
        dpm: 20,
        kp: 10,
        vspm: 10,
        gpm: 5
    },
    BOTTOM: { // ADC
        cspm: 20,
        dpm: 20,
        kp: 10,
        vspm: 5,
        gpm: 5
    },
    UTILITY: { // SUP
        vspm: 25,
        kp: 15,
        objPart: 10, // Participação em objetivos (Special metric?) Assuming Takedowns/TeamTakedowns? Or vs Opponent
        gpm: 5,
        dpm: 5
    },
    JUNGLE: {
        globalObj: 25, // Objetivos globais
        vspm: 15,
        kp: 10,
        gpm: 5,
        dpm: 5
    }
};

// --- Canonical Calculation Functions ---

/**
 * 2️⃣ FUNÇÃO CANÔNICA DE CÁLCULO POR MÉTRICA (%)
 * @param ratio valorJogador / valorOponente
 * @param weight Peso máximo da métrica
 */
const metricScore = (ratio: number, weight: number): number => {
    // Points of control
    const piso = weight * 0.2;
    // const base = weight * 0.7; // Not explicitly used in linear interp logic provided but implies the structure
    const teto = weight;

    // 0.7 or lower => Piso
    // 1.3 or higher => Teto
    if (ratio <= 0.7) return piso;
    if (ratio >= 1.3) return teto;

    // Linear interpolation between 0.7 and 1.3
    const t = (ratio - 0.7) / (1.3 - 0.7);
    return piso + t * (teto - piso);
};

// --- Helpers ---

const getLane = (p: Participant): Lane => {
    const validLanes: Lane[] = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
    return validLanes.includes(p.teamPosition as Lane) ? (p.teamPosition as Lane) : 'MIDDLE'; // Fallback
};

const toPerMin = (val: number, seconds: number) => {
    if (seconds <= 0) return 0;
    return val / (seconds / 60);
};

const getOpponent = (p: Participant, all: Participant[]): Participant | null => {
    return all.find(x => x.teamPosition === p.teamPosition && x.teamId !== p.teamId) || null;
};

const getTeamKills = (teamId: number, all: Participant[]) => {
    return all.filter(p => p.teamId === teamId).reduce((sum, p) => sum + p.kills, 0);
};

// --- Core Logic ---

export const calculateMatchScore = (targetPuuid: string, match: MatchDTO): MatchScoreResult | null => {
    const p = match.info.participants.find(part => part.puuid === targetPuuid);
    if (!p) throw new Error("Participant not found");

    // 8️⃣ EXCLUSÕES - Duration < 10 mins
    if (match.info.gameDuration < 600) {
        console.warn("Match duration < 10min. Score Invalid.");
        return null;
    }

    const opponent = getOpponent(p, match.info.participants);

    // Derived Stats
    const durationMin = match.info.gameDuration / 60;
    const teamKills = getTeamKills(p.teamId, match.info.participants);
    const kp = teamKills > 0 ? (p.kills + p.assists) / teamKills : 0;
    const kpPercent = kp * 100;

    // 🔴 AJUSTE OBRIGATÓRIO #1 — OPONENTE DE LANE INEXISTENTE
    if (!opponent) {
        // console.warn(`No opponent found for ${p.teamPosition}. Score Invalid.`);
        return null;
    }

    const opp = opponent;
    const oppTeamKills = getTeamKills(opponent.teamId, match.info.participants);
    const oppKp = oppTeamKills > 0 ? (opp.kills + opp.assists) / oppTeamKills : 0;

    // Metrics Collection
    const metrics: any = {
        cspm: toPerMin(p.totalMinionsKilled + p.neutralMinionsKilled, match.info.gameDuration),
        dpm: toPerMin(p.totalDamageDealtToChampions, match.info.gameDuration),
        gpm: toPerMin(p.goldEarned, match.info.gameDuration),
        vspm: toPerMin(p.visionScore, match.info.gameDuration),
        kp: kp,
        // Special: Tankiness (Tempo vivo / Dano Recebido) -> TimeAlive / DamageTaken
        // Avoiding div/0: if no damage taken, assume high efficiency? Or cap?
        // Let's use TimeAlive / Max(1, DamageTaken)
        tankiness: (match.info.gameDuration - p.totalTimeSpentDead) / Math.max(1, p.totalDamageTaken),

        // Objectives Counts
        turrets: (p.challenges?.turretTakedowns ?? p.turretKills ?? 0),
        dragons: (p.challenges?.dragonTakedowns ?? p.dragonKills ?? 0),
        barons: (p.challenges?.baronTakedowns ?? p.baronKills ?? 0),
        heralds: (p.challenges?.riftHeraldTakedowns ?? 0),

        // Special: Total Objectives for Jungle/Sup logic
        objTotal: (p.challenges?.turretTakedowns || 0) + (p.challenges?.dragonTakedowns || 0) + (p.challenges?.baronTakedowns || 0) + (p.challenges?.riftHeraldTakedowns || 0)
    };

    const oppMetrics: any = {
        cspm: toPerMin(opp.totalMinionsKilled + opp.neutralMinionsKilled, match.info.gameDuration),
        dpm: toPerMin(opp.totalDamageDealtToChampions, match.info.gameDuration),
        gpm: toPerMin(opp.goldEarned, match.info.gameDuration),
        vspm: toPerMin(opp.visionScore, match.info.gameDuration),
        kp: oppKp,
        tankiness: (match.info.gameDuration - opp.totalTimeSpentDead) / Math.max(1, opp.totalDamageTaken),

        turrets: (opp.challenges?.turretTakedowns ?? opp.turretKills ?? 0),
        dragons: (opp.challenges?.dragonTakedowns ?? opp.dragonKills ?? 0),
        barons: (opp.challenges?.baronTakedowns ?? opp.baronKills ?? 0),
        heralds: (opp.challenges?.riftHeraldTakedowns ?? 0),

        objTotal: (opp.challenges?.turretTakedowns || 0) + (opp.challenges?.dragonTakedowns || 0) + (opp.challenges?.baronTakedowns || 0) + (opp.challenges?.riftHeraldTakedowns || 0)
    };

    // Calculate Ratios
    const calcRatio = (myVal: number, oppVal: number) => {
        if (oppVal === 0) return myVal > 0 ? 1.3 : 1.0; // If opp 0, I am infinite. Cap at 1.3 equivalent.
        return myVal / oppVal;
    };

    const ratios: any = {
        cspm: calcRatio(metrics.cspm, oppMetrics.cspm),
        dpm: calcRatio(metrics.dpm, oppMetrics.dpm),
        gpm: calcRatio(metrics.gpm, oppMetrics.gpm),
        vspm: calcRatio(metrics.vspm, oppMetrics.vspm),
        kp: calcRatio(metrics.kp, oppMetrics.kp),
        tankiness: calcRatio(metrics.tankiness, oppMetrics.tankiness),
        turrets: calcRatio(metrics.turrets, oppMetrics.turrets),
        dragons: calcRatio(metrics.dragons, oppMetrics.dragons),
        barons: calcRatio(metrics.barons, oppMetrics.barons),
        heralds: calcRatio(metrics.heralds, oppMetrics.heralds),
        objTotal: calcRatio(metrics.objTotal, oppMetrics.objTotal) // For Sup "Participação em objetivos" / Jg "Objetivos globais"
    };

    const lane = getLane(p);
    const weights = LAYER_WEIGHTS[lane];
    const isWin = p.win;

    // --- 4️⃣ PERFORMANCE (60 pts) ---
    let perfScore = 0;

    // We map the config keys to our metrics keys
    // Mapping: 
    // "objPart" (Sup) -> ratios.objTotal
    // "globalObj" (Jg) -> ratios.objTotal
    // others direct match

    const calculatePerfItem = (key: string, weight: number): number => {
        let r = 0;
        if (key === 'objPart' || key === 'globalObj') r = ratios.objTotal;
        else if (ratios[key] !== undefined) r = ratios[key];
        else return 0; // Should not happen if config aligns

        // Defeat Logic Check: "Só métricas com ratio > 1.0 pontuam"
        if (!isWin && r <= 1.0) return 0;

        return metricScore(r, weight);
    };

    Object.entries(weights).forEach(([key, weight]) => {
        perfScore += calculatePerfItem(key, weight);
    });

    // --- 6️⃣ OBJETIVOS (30 pts) ---
    // Torres (10), Drag (10), Arauto (5), Barão (5)
    // Always active independent of lane (Section 6)

    // Defeat Logic: "Até 10 pts" (Applied later)

    // 🔴 AJUSTE OBRIGATÓRIO #2 — OBJETIVOS NA DERROTA
    const calcObjScore = (ratio: number, weight: number) => {
        if (!isWin && ratio <= 1.0) return 0;
        return metricScore(ratio, weight);
    };

    const objScores = {
        turrets: calcObjScore(ratios.turrets, 10),
        dragons: calcObjScore(ratios.dragons, 10),
        heralds: calcObjScore(ratios.heralds, 5),
        barons: calcObjScore(ratios.barons, 5)
    };

    let objectivesScore = objScores.turrets + objScores.dragons + objScores.heralds + objScores.barons;


    // --- 5️⃣ DISCIPLINA (10 pts) ---
    // Less deaths -> 10, Equal -> 5, More -> 0
    let disciplineScore = 0;
    if (p.deaths < opp.deaths) disciplineScore = 10;
    else if (p.deaths === opp.deaths) disciplineScore = 5;
    else disciplineScore = 0;

    // --- 7️⃣ DERROTA / VICTORY FINALIZATION ---

    let finalScore = 0;
    let capApplied = undefined;

    if (isWin) {
        finalScore = perfScore + objectivesScore + disciplineScore;
        // Cap 100
        finalScore = Math.min(100, finalScore);
    } else {
        // Defeat Rules
        // 1. KP Check
        if (kpPercent < 35) {
            return {
                matchScore: 0,
                breakdown: { performance: 0, objectives: 0, discipline: 0, isVictory: false, capApplied: "KP < 35%" },
                metrics,
                ratios
            };
        }

        // 2. Caps per block
        // Performance: Cap 20
        const perfFinal = Math.min(20, perfScore);

        // Objectives: Cap 10
        const objFinal = Math.min(10, objectivesScore);

        // Discipline: Cap 10 (Already max 10, but safe logic)
        const discFinal = Math.min(10, disciplineScore);

        // Total Defeat Cap 40
        let total = perfFinal + objFinal + discFinal;
        if (total > 40) {
            total = 40;
            capApplied = "Defeat Cap 40";
        }

        finalScore = total;

        // Override breakdown for display
        perfScore = perfFinal;
        objectivesScore = objFinal;
        disciplineScore = discFinal;
    }

    return {
        matchScore: Math.floor(finalScore),
        breakdown: {
            performance: Math.floor(perfScore),
            objectives: Math.floor(objectivesScore),
            discipline: disciplineScore,
            isVictory: isWin,
            ...(capApplied ? { capApplied } : {})
        },
        metrics,
        ratios
    };
};
