import axios, { AxiosInstance } from 'axios';
import Bottleneck from 'bottleneck';

export class RiotService {
    private readonly regionUrl = 'https://americas.api.riotgames.com'; // Default to Americas for BR/NA
    private readonly platformUrl = 'https://br1.api.riotgames.com'; // Default to BR1 for Summoner V4
    private readonly apiKey: string;
    private readonly limiter: Bottleneck;
    private readonly axiosInstance: AxiosInstance;

    constructor(apiKey: string) {
        this.apiKey = apiKey;

        // Safe Rate Limiting (Align with 100 requests every 2 minutes)
        // 100 reqs / 120 sec = 0.83 reqs/sec => 1 req every 1200ms.
        // We use 12500ms to be safe.
        this.limiter = new Bottleneck({
            minTime: 1250, // 1 request every 1.25 seconds (Guarantees < 100/2min)
            maxConcurrent: 1, // Strict Sequential
        });

        // Retry Strategy for 429
        this.limiter.on('failed', async (error: any, jobInfo) => {
            const status = error.response?.status;
            if (status === 429) {
                const retryAfter = parseInt(error.response?.headers['retry-after'] || '10', 10);
                console.warn(`⏳ Rate Limit Hit. Waiting ${retryAfter}s...`);
                return retryAfter * 1000 + 1000; // Wait + Buffer
            }
            if (status >= 500) return 5000; // Retry server errors
            return null; // Don't retry others (404, 403, etc)
        });

        this.axiosInstance = axios.create({
            headers: {
                'X-Riot-Token': this.apiKey,
            },
        });
    }

    private async executeRequest<T>(url: string): Promise<T> {
        return this.limiter.schedule(async () => {
            try {
                // Pre-flight check could go here if we tracked global state, 
                // but diff-check is mostly business logic (DB vs API).

                const response = await this.axiosInstance.get<T>(url);
                return response.data;
            } catch (error: any) {
                if (error.response?.status === 429) {
                    // Re-throw to be caught by limiter 'failed' listener or caller
                    throw error;
                }
                if (error.response?.status === 404) {
                    // 404 is valid result (not found), don't abort, just throw
                    throw error;
                }

                console.error(`API Error [${url}]: ${error.response?.status} - ${JSON.stringify(error.response?.data, null, 2)}`);
                throw error;
            }
        });
    }

    /**
     * Resolves GameName + TagLine to Account DTO (Account-V1)
     */
    async getAccountByRiotId(gameName: string, tagLine: string): Promise<{ puuid: string; gameName: string; tagLine: string }> {
        const url = `${this.regionUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
        return this.executeRequest<{ puuid: string; gameName: string; tagLine: string }>(url);
    }

    /**
     * Resolves GameName + TagLine to PUUID (Legacy Helper)
     */
    async getPuuid(gameName: string, tagLine: string): Promise<string> {
        const account = await this.getAccountByRiotId(gameName, tagLine);
        return account.puuid;
    }

    /**
   * Fetches Ranked Match IDs (Match-V5)
   * Supports specific queueIds: 420 (Solo) and 440 (Flex)
   * Region Routing: Uses 'americas' for Match-V5 (cluster) and specific platform (e.g. 'br1') for Account-V1
   */
    async getRecentMatchIds(puuid: string, queueId?: number, count: number = 20): Promise<string[]> {
        let url = `${this.regionUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
        if (queueId) {
            url += `&queue=${queueId}`;
        }
        return this.executeRequest<string[]>(url);
    }

    /**
     * Fetches Match Details (Match-V5)
     */
    async getMatchDetails(matchId: string): Promise<any> {
        const url = `${this.regionUrl}/lol/match/v5/matches/${matchId}`;
        return this.executeRequest<any>(url);
    }

    /**
     * Get Summoner by PUUID (Summoner-V4)
     * Needed to get 'id' (SummonerID) for League-V4
     */
    async getSummonerByPuuid(puuid: string): Promise<any> {
        const url = `${this.platformUrl}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
        console.log(`[RiotService] Fetching Summoner: ${url}`);
        return this.executeRequest<any>(url);
    }

    /**
     * Get League Entries (League-V4)
     * Returns all ranked entries (Solo/Flex)
     */
    async getLeagueEntries(summonerId: string): Promise<any[]> {
        const url = `${this.platformUrl}/lol/league/v4/entries/by-summoner/${summonerId}`;
        return this.executeRequest<any[]>(url);
    }

    async getLeagueEntriesByPuuid(puuid: string): Promise<any[]> {
        const url = `${this.platformUrl}/lol/league/v4/entries/by-puuid/${puuid}`;
        return this.executeRequest<any[]>(url);
    }

    /**
     * Get Champion Mastery (Mastery-V4)
     * Returns top champions for a player
     */
    async getChampionMasteries(puuid: string, count: number = 10): Promise<any[]> {
        // Correct endpoint for Mastery V4
        const url = `${this.platformUrl}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=${count}`;
        return this.executeRequest<any[]>(url);
    }
}
