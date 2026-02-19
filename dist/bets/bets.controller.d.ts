import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { GameEngineService } from '../game-engine/game-engine.service';
export declare class BetsController {
    private readonly betsService;
    private readonly gameEngine;
    constructor(betsService: BetsService, gameEngine: GameEngineService);
    settle(req: any, body: {
        winningSelectionId: string;
    }): Promise<{
        message: string;
        winnersCount: number;
        engineOverrides: number;
        marketId: any;
    }>;
    getMatchBetStats(req: any): Promise<{
        match_id: string;
        total_bets: number;
        total_stake: number;
        total_potential_payout: number;
        pending_bets: number;
        won_bets: number;
        lost_bets: number;
    }[]>;
    create(req: any, createBetDto: CreateBetDto): Promise<any>;
    getEngineConfig(req: any): {
        winProbability: number;
        lossProbability: number;
        winPercentage: string;
        lossPercentage: string;
        description: string;
    };
    findMyBets(req: any): Promise<{
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
    getExposure(req: any): Promise<{
        exposure: number;
    }>;
    findAll(req: any): Promise<{
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
    findOne(req: any, id: string): Promise<any>;
}
