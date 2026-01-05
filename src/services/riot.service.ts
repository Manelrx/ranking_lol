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

        // Limits: 20 reqs/1sec, 100 reqs/2min. Using conservative settings.
        this.limiter = new Bottleneck({
            minTime: 50, // Max 20/sec
            reservoir: 20,
            reservoirRefreshAmount: 20,
            reservoirRefreshInterval: 1000,
            maxConcurrent: 1, // Sequential to be safe
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
                const response = await this.axiosInstance.get<T>(url);
                return response.data;
            } catch (error: any) {
                if (error.response?.status === 429) {
                    console.warn('Rate Limit Exceeded. Warinig: Production should handle Retry-After header.');
                }
                throw new Error(`Riot API Error [${url}]: ${error.response?.status} - ${error.response?.statusText}`);
            }
        });
    }

    /**
     * Resolves GameName + TagLine to PUUID (Account-V1)
     */
    async getPuuid(gameName: string, tagLine: string): Promise<string> {
        const url = `${this.regionUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
        const data = await this.executeRequest<{ puuid: string }>(url);
        return data.puuid;
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
}
