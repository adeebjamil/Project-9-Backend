import { Match } from './entities/match.entity';
export declare class CricketApiService {
    private readonly logger;
    private readonly apiKey;
    private readonly baseUrl;
    fetchCurrentMatches(): Promise<Partial<Match>[]>;
    private mapCricApiMatchToEntity;
}
