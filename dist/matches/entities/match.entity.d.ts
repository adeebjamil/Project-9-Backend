import { Market } from './market.entity';
export declare enum MatchStatus {
    SCHEDULED = "scheduled",
    LIVE = "live",
    COMPLETED = "completed",
    ABANDONED = "abandoned"
}
export declare enum AdminStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    SUSPENDED = "suspended"
}
export declare class Match {
    id: string;
    externalId: string;
    competitionId: string;
    teams: {
        home: {
            id: string;
            name: string;
            shortName: string;
        };
        away: {
            id: string;
            name: string;
            shortName: string;
        };
    };
    format: string;
    startTime: Date;
    venue: string;
    status: MatchStatus;
    liveScore: any;
    adminStatus: AdminStatus;
    adminNote: string;
    reviewedBy: string;
    source: string;
    markets: Market[];
    createdAt: Date;
    updatedAt: Date;
}
