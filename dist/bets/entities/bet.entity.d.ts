import { User } from '../../users/entities/user.entity';
import { Selection } from '../../matches/entities/selection.entity';
export declare enum BetStatus {
    PENDING = "pending",
    WON = "won",
    LOST = "lost",
    VOID = "void",
    CASHED_OUT = "cashed_out"
}
export declare class Bet {
    id: string;
    stake: number;
    odds: number;
    potentialPayout: number;
    status: BetStatus;
    engineCanWin: boolean;
    engineRandom: number;
    user: User;
    selection: Selection;
    placedAt: Date;
    updatedAt: Date;
}
