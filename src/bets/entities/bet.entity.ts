
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Selection } from '../../matches/entities/selection.entity';

export enum BetStatus {
    PENDING = 'pending',
    WON = 'won',
    LOST = 'lost',
    VOID = 'void',
    CASHED_OUT = 'cashed_out',
}

@Entity('bets')
export class Bet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', { precision: 10, scale: 2 })
    stake: number;

    @Column('decimal', { precision: 5, scale: 2 })
    odds: number;

    @Column('decimal', { precision: 10, scale: 2 })
    potentialPayout: number;

    @Column({
        type: 'enum',
        enum: BetStatus,
        default: BetStatus.PENDING,
    })
    status: BetStatus;

    /** Game Engine: whether this bet is allowed to win (set at placement, ~1% true) */
    @Column({ default: false })
    engineCanWin: boolean;

    /** Game Engine: the random value generated (audit trail) */
    @Column('decimal', { precision: 10, scale: 8, nullable: true })
    engineRandom: number;

    @ManyToOne(() => User, (user) => user.bets)
    user: User;

    @ManyToOne(() => Selection)
    selection: Selection;

    @CreateDateColumn()
    placedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
