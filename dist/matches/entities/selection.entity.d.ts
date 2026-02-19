import { Market } from './market.entity';
export declare enum SelectionStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    WIN = "win",
    LOSS = "loss",
    VOID = "void"
}
export declare class Selection {
    id: string;
    name: string;
    odds: number;
    probability: number;
    status: SelectionStatus;
    market: Market;
    createdAt: Date;
    updatedAt: Date;
}
