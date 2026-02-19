import { Injectable, Logger } from '@nestjs/common';
import { Match, MatchStatus, AdminStatus } from './entities/match.entity';

interface CricApiTeamInfo {
    id?: number;
    name: string;
    shortName?: string;
    img?: string;
}

interface CricApiMatch {
    id: string;
    name: string;
    matchType: string;
    status: string;
    venue: string;
    date?: string;
    dateTimeGMT?: string;
    teams: string[];
    teamInfo?: CricApiTeamInfo[];
    score?: any[];
    series_id?: string;
}

interface CricApiResponse {
    apikey: string;
    data: CricApiMatch[];
    status: string;
    info?: any;
}

@Injectable()
export class CricketApiService {
    private readonly logger = new Logger(CricketApiService.name);
    private readonly apiKey = 'e948ee13-2b48-4a8e-8d57-0b81de92e36b';
    private readonly baseUrl = 'https://api.cricapi.com/v1';

    async fetchCurrentMatches(): Promise<Partial<Match>[]> {
        try {
            const url = `${this.baseUrl}/currentMatches?apikey=${this.apiKey}`;
            this.logger.log(`Fetching matches from CricAPI: ${url}`);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`CricAPI request failed: ${response.status}`);
            }

            const data: CricApiResponse = await response.json();
            
            if (data.status !== 'success' || !data.data) {
                throw new Error('Invalid response from CricAPI');
            }

            this.logger.log(`Fetched ${data.data.length} matches from CricAPI`);

            return data.data.map((match) => this.mapCricApiMatchToEntity(match));
        } catch (error) {
            this.logger.error('Failed to fetch matches from CricAPI', error);
            throw error;
        }
    }

    private mapCricApiMatchToEntity(apiMatch: CricApiMatch): Partial<Match> {
        // Extract team information
        const teamInfo = apiMatch.teamInfo || [];
        const teams = apiMatch.teams || [];

        const homeTeam = teamInfo[0] || { name: teams[0] || 'Unknown', shortName: teams[0] || 'UNK' };
        const awayTeam = teamInfo[1] || { name: teams[1] || 'Unknown', shortName: teams[1] || 'UNK' };

        // Determine match status
        let status: MatchStatus = MatchStatus.SCHEDULED;
        if (apiMatch.status?.toLowerCase().includes('live')) {
            status = MatchStatus.LIVE;
        } else if (apiMatch.status?.toLowerCase().includes('completed') || apiMatch.status?.toLowerCase().includes('result')) {
            status = MatchStatus.COMPLETED;
        }

        // Parse start time
        let startTime: Date;
        try {
            startTime = apiMatch.dateTimeGMT 
                ? new Date(apiMatch.dateTimeGMT) 
                : apiMatch.date 
                    ? new Date(apiMatch.date) 
                    : new Date();
        } catch {
            startTime = new Date();
        }

        // Map match format
        let format = 'T20';
        if (apiMatch.matchType) {
            const matchType = apiMatch.matchType.toLowerCase();
            if (matchType.includes('odi')) format = 'ODI';
            else if (matchType.includes('test')) format = 'Test';
            else if (matchType.includes('t20')) format = 'T20';
        }

        return {
            externalId: `cricapi_${apiMatch.id}`,
            competitionId: apiMatch.series_id || 'unknown',
            teams: {
                home: {
                    id: homeTeam.id?.toString() || 'unknown',
                    name: homeTeam.name,
                    shortName: homeTeam.shortName || homeTeam.name.substring(0, 3).toUpperCase(),
                },
                away: {
                    id: awayTeam.id?.toString() || 'unknown',
                    name: awayTeam.name,
                    shortName: awayTeam.shortName || awayTeam.name.substring(0, 3).toUpperCase(),
                },
            },
            format,
            startTime,
            venue: apiMatch.venue || 'TBD',
            status,
            liveScore: apiMatch.score || null,
            adminStatus: AdminStatus.PENDING,
            reviewedBy: undefined,
            adminNote: undefined,
            source: 'cricapi',
        };
    }
}
