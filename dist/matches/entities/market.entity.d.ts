import { Match } from './match.entity';
import { Selection } from './selection.entity';
export declare enum MarketStatus {
    OPEN = "open",
    SUSPENDED = "suspended",
    CLOSED = "closed",
    SETTLED = "settled"
}
export declare class Market {
    id: string;
    marketType: string;
    name: string;
    status: MarketStatus;
    isSgpEligible: boolean;
    match: Match;
    selections: Selection[];
    createdAt: Date;
    updatedAt: Date;
}
