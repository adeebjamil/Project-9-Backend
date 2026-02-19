import { Injectable, Logger } from '@nestjs/common';

/**
 * GameEngineService
 * 
 * Controls the house edge for the betting platform.
 * Each bet is individually evaluated:
 *   - 99% of the time the bet will be settled as LOST
 *   - 1% of the time the bet will be settled as WON
 * 
 * This applies uniformly to ALL users.
 * 
 * The engine assigns a hidden outcome at BET PLACEMENT time and
 * overrides the natural settlement during match settlement.
 */

export interface EngineOutcome {
  /** Whether the engine allows this bet to win */
  canWin: boolean;
  /** The random value generated (for audit trail) */
  randomValue: number;
  /** Threshold used (0.01 = 1% win chance) */
  threshold: number;
}

@Injectable()
export class GameEngineService {
  private readonly logger = new Logger(GameEngineService.name);

  /** Win probability — 1% (0.01). Only 1 in 100 bets can win. */
  private readonly WIN_PROBABILITY = 0.01;

  /**
   * Determines whether a specific bet should be allowed to win.
   * Called at bet placement time. The result is stored with the bet
   * so that settlement respects the engine's decision.
   * 
   * @returns EngineOutcome — canWin is true only ~1% of the time
   */
  determineOutcome(): EngineOutcome {
    const randomValue = Math.random();
    const canWin = randomValue < this.WIN_PROBABILITY;

    this.logger.debug(
      `Engine outcome: random=${randomValue.toFixed(6)}, threshold=${this.WIN_PROBABILITY}, canWin=${canWin}`,
    );

    return {
      canWin,
      randomValue,
      threshold: this.WIN_PROBABILITY,
    };
  }

  /**
   * Adjusts displayed odds to create a perception of fair play
   * while maintaining the house edge. Adds slight variance to
   * the raw API odds so each user sees slightly different values.
   * 
   * @param rawOdds - The actual odds from the API/market
   * @returns Adjusted odds (always slightly worse for the user)
   */
  adjustOdds(rawOdds: number): number {
    // Apply a small house-edge reduction (2-8% worse odds for user)
    const edgeFactor = 0.92 + Math.random() * 0.06; // 0.92 to 0.98
    const adjusted = rawOdds * edgeFactor;
    // Never go below 1.01
    return Math.max(1.01, Math.round(adjusted * 100) / 100);
  }

  /**
   * For settlement: given the engine's pre-assigned outcome and
   * whether the selection actually won in reality, determine final status.
   * 
   * Rules:
   *  - If engine says canWin=false → bet ALWAYS loses (regardless of real result)
   *  - If engine says canWin=true → bet follows the real match result
   */
  resolveSettlement(
    engineCanWin: boolean,
    selectionActuallyWon: boolean,
  ): 'won' | 'lost' {
    if (!engineCanWin) {
      // 99% path: forced loss
      return 'lost';
    }
    // 1% path: follows real result
    return selectionActuallyWon ? 'won' : 'lost';
  }

  /**
   * Get engine statistics for admin dashboard
   */
  getEngineConfig() {
    return {
      winProbability: this.WIN_PROBABILITY,
      lossProbability: 1 - this.WIN_PROBABILITY,
      winPercentage: `${(this.WIN_PROBABILITY * 100).toFixed(1)}%`,
      lossPercentage: `${((1 - this.WIN_PROBABILITY) * 100).toFixed(1)}%`,
      description: 'Each bet individually has 99% chance of losing and 1% chance of winning, applied to all users equally.',
    };
  }
}
