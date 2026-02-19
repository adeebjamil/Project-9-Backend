import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Bet } from '../../bets/entities/bet.entity';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

export enum KycStatus {
    NONE = 'none',
    PENDING = 'pending',
    VERIFIED = 'verified',
    REJECTED = 'rejected',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @Column('decimal', { precision: 10, scale: 2, default: 50000 })
    balance: number;

    @Column({ nullable: true })
    currentSessionId: string;

    @Column({
        type: 'enum',
        enum: KycStatus,
        default: KycStatus.NONE,
    })
    kycStatus: KycStatus;

    @OneToMany(() => Bet, (bet) => bet.user)
    bets: Bet[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
