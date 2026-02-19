import { Bet } from '../../bets/entities/bet.entity';
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare enum KycStatus {
    NONE = "none",
    PENDING = "pending",
    VERIFIED = "verified",
    REJECTED = "rejected"
}
export declare class User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    balance: number;
    currentSessionId: string;
    kycStatus: KycStatus;
    bets: Bet[];
    createdAt: Date;
    updatedAt: Date;
}
