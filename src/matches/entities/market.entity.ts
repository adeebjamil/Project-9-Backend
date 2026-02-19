
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Match } from './match.entity';
import { Selection } from './selection.entity';

export enum MarketStatus {
    OPEN = 'open',
    SUSPENDED = 'suspended',
    CLOSED = 'closed',
    SETTLED = 'settled',
}

@Entity('markets')
export class Market {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    marketType: string; // e.g., "MATCH_WINNER"

    @Column()
    name: string; // Display name like "Match Winner"

    @Column({
        type: 'enum',
        enum: MarketStatus,
        default: MarketStatus.OPEN,
    })
    status: MarketStatus;

    @Column({ default: false })
    isSgpEligible: boolean;

    @ManyToOne(() => Match, (match) => match.markets)
    match: Match;

    @OneToMany(() => Selection, (selection) => selection.market, {
        cascade: true,
    })
    selections: Selection[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
