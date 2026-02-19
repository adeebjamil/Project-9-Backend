
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Market } from './market.entity';

export enum SelectionStatus {
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    WIN = 'win',
    LOSS = 'loss',
    VOID = 'void',
}

@Entity('selections')
export class Selection {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; // e.g., "India", "Draw", "Over 200.5"

    @Column('decimal', { precision: 5, scale: 2 })
    odds: number;

    @Column('decimal', { precision: 5, scale: 4, default: 0 })
    probability: number;

    @Column({
        type: 'enum',
        enum: SelectionStatus,
        default: SelectionStatus.ACTIVE,
    })
    status: SelectionStatus;

    @ManyToOne(() => Market, (market) => market.selections)
    market: Market;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
