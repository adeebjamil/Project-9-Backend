export interface EngineOutcome {
    canWin: boolean;
    randomValue: number;
    threshold: number;
}
export declare class GameEngineService {
    private readonly logger;
    private readonly WIN_PROBABILITY;
    determineOutcome(): EngineOutcome;
    adjustOdds(rawOdds: number): number;
    resolveSettlement(engineCanWin: boolean, selectionActuallyWon: boolean): 'won' | 'lost';
    getEngineConfig(): {
        winProbability: number;
        lossProbability: number;
        winPercentage: string;
        lossPercentage: string;
        description: string;
    };
}
