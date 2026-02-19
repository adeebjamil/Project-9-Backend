import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Market } from './market.entity';

export enum MatchStatus {
    SCHEDULED = 'scheduled',
    LIVE = 'live',
    COMPLETED = 'completed',
    ABANDONED = 'abandoned',
}

export enum AdminStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    SUSPENDED = 'suspended',
}

@Entity('matches')
export class Match {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    externalId: string; // From EntitySport API

    @Column()
    competitionId: string;

    @Column({ type: 'json' })
    teams: {
        home: { id: string; name: string; shortName: string };
        away: { id: string; name: string; shortName: string };
    };

    @Column()
    format: string; // T20, ODI, Test

    @Column('timestamp')
    startTime: Date;

    @Column()
    venue: string;

    @Column({
        type: 'enum',
        enum: MatchStatus,
        default: MatchStatus.SCHEDULED,
    })
    status: MatchStatus;

    @Column({ type: 'json', nullable: true })
    liveScore: any;

    @Column({
        type: 'enum',
        enum: AdminStatus,
        default: AdminStatus.PENDING,
    })
    adminStatus: AdminStatus;

    @Column({ nullable: true })
    adminNote: string;

    @Column({ nullable: true })
    reviewedBy: string; // User ID who reviewed

    @Column({ nullable: true })
    source: string; // 'cricapi' | 'seed' | 'manual'

    @OneToMany(() => Market, (market) => market.match)
    markets: Market[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
