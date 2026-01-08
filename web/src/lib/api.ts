const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333') + '/api';

export interface RankingEntry {
    rank: number;
    puuid: string;
    gameName: string;
    tagLine: string;
    // Identity
    profileIconId?: number | null;
    summonerLevel?: number | null;
    // Stats
    tier: string;
    rankDivision: string;
    lp: number;
    totalScore: number;
    avgScore: number;
    gamesUsed: number;
    wins: number;
    losses: number;
    winRate: string;
    // Main Champion
    mainChampion?: {
        id: number;
        name: string;
        points: number;
        level: number;
    };
}

export interface EloRanking {
    tier: string;
    players: RankingEntry[];
}

export interface PlayerHistoryEntry {
    date: string;
    tier: string;
    rank: string;
    lp: number;
}

export interface PlayerHistory {
    player: {
        displayName: string;
        tier: string;
        rank: string;
        lp: number;
        puuid: string;
        profileIconId?: number | null;
        summonerLevel?: number | null;
    };
    history: PlayerHistoryEntry[];
    masteries: {
        championId: number;
        championName: string;
        level: number;
        points: number;
    }[];
}

export interface PdlGainEntry {
    puuid: string;
    gameName: string;
    tagLine: string;
    tier: string;
    rank: string;
    lp: number;
    pdlGain: number;
    trend: 'UP' | 'DOWN' | 'SAME';
    profileIconId?: number | null;
    // Context
    startTier?: string;
    startRank?: string;
    startLp?: number;
}

export interface PlayerStats {
    avgScore: string;
    winRate: string;
    totalGames: number;
    avgKda: string;
    bestScore: number;
    worstScore: number;
}

export interface MatchHistoryEntry {
    matchId: string;
    date: string;
    lane: string;
    isVictory: boolean;
    score: number;
    kda: string; // Formatted
    kills: number;
    deaths: number;
    assists: number;
    performanceScore: number;
    objectivesScore: number;
    disciplineScore: number;
    championName: string;
    championId?: number;
}

export interface PlayerInsights {
    stats: PlayerStats;
    history: MatchHistoryEntry[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    insights: {
        consistency: string;
        trend: string;
    };
}

export async function getSeasonRanking(queue: 'SOLO' | 'FLEX' = 'SOLO', limit: number = 100): Promise<RankingEntry[]> {
    const res = await fetch(`${API_URL}/ranking/season?queue=${queue}&limit=${limit}&_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch ranking');
    return res.json();
}

export async function getRankingByElo(queue: 'SOLO' | 'FLEX', tier: string, limit: number = 100): Promise<EloRanking> {
    const res = await fetch(`${API_URL}/ranking/season/by-elo?queue=${queue}&tier=${tier}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch elo ranking');
    return res.json();
}

export async function getPdlGainRanking(queue: 'SOLO' | 'FLEX' = 'SOLO', limit: number = 20, period: string = 'GENERAL'): Promise<PdlGainEntry[]> {
    const res = await fetch(`${API_URL}/ranking/pdl-gain?queue=${queue}&limit=${limit}&period=${period}`);
    if (!res.ok) throw new Error('Failed to fetch PDL ranking');
    return res.json();
}

export async function getPlayerHistory(puuid: string, queue: 'SOLO' | 'FLEX' = 'SOLO'): Promise<PlayerHistory> {
    const res = await fetch(`${API_URL}/player/${puuid}/history?queue=${queue}`);
    if (!res.ok) throw new Error('Failed to fetch player history');
    return res.json();
}

export interface HighlightPlayer {
    puuid: string;
    gameName: string;
    tagLine: string;
    profileIconId?: number | null;
    value: string | number;
    label: string;
    championName?: string; // New for Mono
}

export interface PeriodHighlights {
    period: { start: string; end: string };
    periodLabel: string;
    mvp: HighlightPlayer | null;
    kdaKing: HighlightPlayer | null;
    mostActive: HighlightPlayer | null;
    highestDmg: HighlightPlayer | null;
    survivor: HighlightPlayer | null;
    visionary: HighlightPlayer | null;
    stomper: HighlightPlayer | null;
    rich: HighlightPlayer | null;
    farmer: HighlightPlayer | null;
    lpMachine: HighlightPlayer | null;
    highestScore: HighlightPlayer | null;

    // New Metrics (Phase 20)
    mono: HighlightPlayer | null;
    ocean: HighlightPlayer | null;
    objective: HighlightPlayer | null;
}

export async function getPlayerInsights(puuid: string, queue: 'SOLO' | 'FLEX' = 'SOLO', page: number = 1, limit: number = 10, sort: 'asc' | 'desc' = 'desc'): Promise<PlayerInsights> {
    const res = await fetch(`${API_URL}/player/${puuid}/insights?queue=${queue}&page=${page}&limit=${limit}&sort=${sort}`);
    if (!res.ok) throw new Error('Failed to fetch player insights');
    return res.json();
}

export const getHighlights = async (queue: 'SOLO' | 'FLEX' = 'SOLO', period: "WEEKLY" | "MONTHLY" | "GENERAL" = "WEEKLY"): Promise<PeriodHighlights> => {
    const res = await fetch(`${API_URL}/ranking/insights?queue=${queue}&period=${period}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch highlights");
    return res.json();
};

// PDL Evolution Types
export interface PdlSnapshot {
    tier: string;
    rank: string;
    lp: number;
    date: string; // ISO
}

export interface PdlEvolution {
    start: PdlSnapshot;
    current: PdlSnapshot;
    gain: number;
    gainLabel: string;
}

export async function getPdlEvolution(puuid: string, queue: 'SOLO' | 'FLEX' = 'SOLO'): Promise<PdlEvolution | null> {
    const res = await fetch(`${API_URL}/player/${puuid}/pdl-evolution?queue=${queue}`);
    if (!res.ok) return null; // Return null if not found/error, allowing UI to hide it
    return res.json();
}

export async function getSystemStatus(): Promise<{ lastUpdate: string | null; nextUpdate: string | null }> {
    const res = await fetch(`${API_URL}/status?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return { lastUpdate: null, nextUpdate: null };
    return res.json();
}
