"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CricketApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CricketApiService = void 0;
const common_1 = require("@nestjs/common");
const match_entity_1 = require("./entities/match.entity");
let CricketApiService = CricketApiService_1 = class CricketApiService {
    logger = new common_1.Logger(CricketApiService_1.name);
    apiKey = 'e948ee13-2b48-4a8e-8d57-0b81de92e36b';
    baseUrl = 'https://api.cricapi.com/v1';
    async fetchCurrentMatches() {
        try {
            const url = `${this.baseUrl}/currentMatches?apikey=${this.apiKey}`;
            this.logger.log(`Fetching matches from CricAPI: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`CricAPI request failed: ${response.status}`);
            }
            const data = await response.json();
            if (data.status !== 'success' || !data.data) {
                throw new Error('Invalid response from CricAPI');
            }
            this.logger.log(`Fetched ${data.data.length} matches from CricAPI`);
            return data.data.map((match) => this.mapCricApiMatchToEntity(match));
        }
        catch (error) {
            this.logger.error('Failed to fetch matches from CricAPI', error);
            throw error;
        }
    }
    mapCricApiMatchToEntity(apiMatch) {
        const teamInfo = apiMatch.teamInfo || [];
        const teams = apiMatch.teams || [];
        const homeTeam = teamInfo[0] || { name: teams[0] || 'Unknown', shortName: teams[0] || 'UNK' };
        const awayTeam = teamInfo[1] || { name: teams[1] || 'Unknown', shortName: teams[1] || 'UNK' };
        let status = match_entity_1.MatchStatus.SCHEDULED;
        if (apiMatch.status?.toLowerCase().includes('live')) {
            status = match_entity_1.MatchStatus.LIVE;
        }
        else if (apiMatch.status?.toLowerCase().includes('completed') || apiMatch.status?.toLowerCase().includes('result')) {
            status = match_entity_1.MatchStatus.COMPLETED;
        }
        let startTime;
        try {
            startTime = apiMatch.dateTimeGMT
                ? new Date(apiMatch.dateTimeGMT)
                : apiMatch.date
                    ? new Date(apiMatch.date)
                    : new Date();
        }
        catch {
            startTime = new Date();
        }
        let format = 'T20';
        if (apiMatch.matchType) {
            const matchType = apiMatch.matchType.toLowerCase();
            if (matchType.includes('odi'))
                format = 'ODI';
            else if (matchType.includes('test'))
                format = 'Test';
            else if (matchType.includes('t20'))
                format = 'T20';
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
            adminStatus: match_entity_1.AdminStatus.PENDING,
            reviewedBy: undefined,
            adminNote: undefined,
            source: 'cricapi',
        };
    }
};
exports.CricketApiService = CricketApiService;
exports.CricketApiService = CricketApiService = CricketApiService_1 = __decorate([
    (0, common_1.Injectable)()
], CricketApiService);
//# sourceMappingURL=cricket-api.service.js.map