import { SupabaseService } from '../supabase/supabase.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { GameEngineService } from '../game-engine/game-engine.service';
export declare class BetsService {
    private supabase;
    private gameEngine;
    constructor(supabase: SupabaseService, gameEngine: GameEngineService);
    create(userId: string, createBetDto: CreateBetDto): Promise<any>;
    settle(winningSelectionId: string): Promise<{
        message: string;
        winnersCount: number;
        engineOverrides: number;
        marketId: any;
    }>;
    findAll(userId: string): Promise<{
        id: any;
        user_id: any;
        selection_id: any;
        selection: any;
        match_name: string;
        match_id: any;
        market_name: any;
        odds: number;
        stake: number;
        potential_win: number;
        potential_payout: number;
        status: any;
        bet_type: string;
        created_at: any;
        placed_at: any;
        settled_at: any;
        engine_can_win: any;
    }[]>;
    getExposure(userId: string): Promise<number>;
    findOne(id: string, userId: string): Promise<any>;
    getMatchBetStats(): Promise<{
        match_id: string;
        total_bets: number;
        total_stake: number;
        total_potential_payout: number;
        pending_bets: number;
        won_bets: number;
        lost_bets: number;
    }[]>;
}
