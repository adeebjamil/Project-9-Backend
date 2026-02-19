
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { GameEngineService } from '../game-engine/game-engine.service';

@Injectable()
export class BetsService {
  constructor(
    private supabase: SupabaseService,
    private gameEngine: GameEngineService,
  ) { }

  async create(userId: string, createBetDto: CreateBetDto) {
    const { selectionId, stake } = createBetDto;

    // 1. Fetch user
    const { data: user, error: userErr } = await this.supabase.db
      .from('users')
      .select('id, balance')
      .eq('id', userId)
      .single();

    if (userErr || !user) throw new NotFoundException('User not found');
    if (Number(user.balance) < stake) throw new BadRequestException('Insufficient balance');

    // 2. Fetch selection + market (to validate status)
    const { data: selection, error: selErr } = await this.supabase.db
      .from('selections')
      .select('*, markets!inner(*)')
      .eq('id', selectionId)
      .single();

    if (selErr || !selection) {
      console.error('Selection fetch error:', selErr);
      throw new NotFoundException('Selection not found');
    }
    if (selection.status && selection.status !== 'active') throw new BadRequestException('Selection is suspended or inactive');
    if (selection.markets?.status && selection.markets.status !== 'open') throw new BadRequestException('Market is closed');

    // 3. GAME ENGINE: Determine hidden outcome (99% loss, 1% win)
    const engineOutcome = this.gameEngine.determineOutcome();

    // 4. Create bet with engine outcome stored
    const potentialPayout = stake * Number(selection.odds);

    // Try with engine columns first, fallback without them
    let bet: any = null;
    let betErr: any = null;

    const betPayload: any = {
      user_id: userId,
      selection_id: selectionId,
      stake,
      odds: selection.odds,
      potential_payout: potentialPayout,
      status: 'pending',
    };

    // Try with engine columns
    const res1 = await this.supabase.db
      .from('bets')
      .insert({
        ...betPayload,
        engine_can_win: engineOutcome.canWin,
        engine_random: engineOutcome.randomValue,
      })
      .select()
      .single();

    if (res1.error) {
      console.warn('Bet insert with engine columns failed, trying without:', res1.error.message);
      // Fallback: insert without engine columns
      const res2 = await this.supabase.db
        .from('bets')
        .insert(betPayload)
        .select()
        .single();

      bet = res2.data;
      betErr = res2.error;
    } else {
      bet = res1.data;
      betErr = null;
    }

    if (betErr || !bet) {
      console.error('Bet creation failed:', betErr);
      throw new BadRequestException(`Failed to create bet: ${betErr?.message || 'Unknown error'}`);
    }

    // 5. Deduct balance ONLY after bet is confirmed created
    const newBalance = Number(user.balance) - stake;
    const { error: balErr } = await this.supabase.db
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (balErr) {
      console.error('Balance deduction failed:', balErr);
      // Rollback: delete the bet
      await this.supabase.db.from('bets').delete().eq('id', bet.id);
      throw new BadRequestException('Failed to deduct balance');
    }

    return {
      ...bet,
      selection_name: selection.name,
      market_name: selection.markets?.name || 'Unknown Market',
      new_balance: newBalance,
    };
  }

  async settle(winningSelectionId: string) {
    // 1. Get winning selection and its market siblings
    const { data: winner, error: winErr } = await this.supabase.db
      .from('selections')
      .select('*, markets!inner(id, selections(id))')
      .eq('id', winningSelectionId)
      .single();

    if (winErr || !winner) throw new NotFoundException('Selection not found');

    const marketId = winner.markets.id;
    const allSelectionIds: string[] = winner.markets.selections.map((s: any) => s.id);
    const losingSelectionIds: string[] = allSelectionIds.filter((id: string) => id !== winningSelectionId);

    // 2. Process bets on the WINNING selection
    //    Engine override: only bets with engine_can_win=true actually win
    const { data: winSideBets } = await this.supabase.db
      .from('bets')
      .select('id, user_id, potential_payout, engine_can_win')
      .eq('selection_id', winningSelectionId)
      .eq('status', 'pending');

    let winnersCount = 0;
    let engineOverrideCount = 0;

    if (winSideBets) {
      for (const bet of winSideBets) {
        const finalResult = this.gameEngine.resolveSettlement(
          bet.engine_can_win ?? true,
          true, // selection actually won
        );

        if (finalResult === 'won') {
          // Credit winnings
          const { data: u } = await this.supabase.db
            .from('users').select('balance').eq('id', bet.user_id).single();
          if (u) {
            await this.supabase.db
              .from('users')
              .update({ balance: Number(u.balance) + Number(bet.potential_payout) })
              .eq('id', bet.user_id);
          }
          await this.supabase.db
            .from('bets')
            .update({ status: 'won', settled_at: new Date().toISOString() })
            .eq('id', bet.id);
          winnersCount++;
        } else {
          // Engine forced this bet to lose even though selection won
          await this.supabase.db
            .from('bets')
            .update({ status: 'lost', settled_at: new Date().toISOString() })
            .eq('id', bet.id);
          engineOverrideCount++;
        }
      }
    }

    // 3. Process bets on LOSING selections — all lose naturally
    if (losingSelectionIds.length > 0) {
      await this.supabase.db
        .from('bets')
        .update({ status: 'lost', settled_at: new Date().toISOString() })
        .in('selection_id', losingSelectionIds)
        .eq('status', 'pending');
    }

    return {
      message: 'Settled successfully',
      winnersCount,
      engineOverrides: engineOverrideCount,
      marketId,
    };
  }

  async findAll(userId: string) {
    // Try deep join first, then fallbacks
    let data: any[] | null = null;
    let deepJoinWorked = false;

    // Attempt 1: deep join, order by created_at
    const res1 = await this.supabase.db
      .from('bets')
      .select('*, selections(*, markets(*, matches(*)))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!res1.error && res1.data) {
      data = res1.data;
      deepJoinWorked = true;
    } else {
      console.warn('Bets findAll attempt 1 failed:', res1.error?.message);

      // Attempt 2: deep join, order by placed_at
      const res2 = await this.supabase.db
        .from('bets')
        .select('*, selections(*, markets(*, matches(*)))')
        .eq('user_id', userId)
        .order('placed_at', { ascending: false });

      if (!res2.error && res2.data) {
        data = res2.data;
        deepJoinWorked = true;
      } else {
        console.warn('Bets findAll attempt 2 failed:', res2.error?.message);

        // Attempt 3: deep join, no ordering
        const res3 = await this.supabase.db
          .from('bets')
          .select('*, selections(*, markets(*, matches(*)))')
          .eq('user_id', userId);

        if (!res3.error && res3.data) {
          data = res3.data;
          deepJoinWorked = true;
        } else {
          console.warn('Bets findAll attempt 3 failed:', res3.error?.message);

          // Attempt 4: flat query without joins
          const res4 = await this.supabase.db
            .from('bets')
            .select('*')
            .eq('user_id', userId);

          if (res4.error) {
            console.error('Bets findAll all attempts failed:', res4.error);
            return [];
          }
          data = res4.data || [];
          deepJoinWorked = false;
        }
      }
    }

    // Map to a flat, frontend-friendly shape
    return (data || []).map((bet: any) => {
      const selectionObj = deepJoinWorked ? bet.selections : null;
      const marketObj = selectionObj?.markets;
      const matchObj = marketObj?.matches;

      return {
        id: bet.id,
        user_id: bet.user_id,
        selection_id: bet.selection_id,
        selection: selectionObj?.name || 'Unknown',
        match_name: matchObj
          ? `${matchObj.teams?.home?.name || matchObj.teams?.[0]?.name || '?'} v ${matchObj.teams?.away?.name || matchObj.teams?.[1]?.name || '?'}`
          : 'Unknown Match',
        match_id: matchObj?.id || null,
        market_name: marketObj?.name || 'Unknown Market',
        odds: Number(bet.odds),
        stake: Number(bet.stake),
        potential_win: Number(bet.potential_payout),
        potential_payout: Number(bet.potential_payout),
        status: bet.status,
        bet_type: 'back',
        created_at: bet.placed_at || bet.created_at,
        placed_at: bet.placed_at || bet.created_at,
        settled_at: bet.settled_at || null,
        engine_can_win: bet.engine_can_win,
      };
    });
  }

  async getExposure(userId: string): Promise<number> {
    const { data, error } = await this.supabase.db
      .from('bets')
      .select('stake')
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error('Exposure query error:', error);
      return 0;
    }

    return (data || []).reduce((sum: number, bet: any) => sum + Number(bet.stake), 0);
  }

  async findOne(id: string, userId: string) {
    const { data, error } = await this.supabase.db
      .from('bets')
      .select('*, selections(*, markets(*, matches(*)))')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new NotFoundException('Bet not found');
    return data;
  }

  async getMatchBetStats() {
    // Get all bets with their selection -> market -> match chain
    const { data: bets, error } = await this.supabase.db
      .from('bets')
      .select('id, stake, status, potential_payout, selections(id, name, markets(id, match_id))');

    if (error) {
      console.error('getMatchBetStats error:', error);
      return [];
    }

    // Aggregate per match
    const statsMap: Record<string, {
      match_id: string;
      total_bets: number;
      total_stake: number;
      total_potential_payout: number;
      pending_bets: number;
      won_bets: number;
      lost_bets: number;
    }> = {};

    for (const bet of bets || []) {
      const matchId = (bet as any).selections?.markets?.match_id;
      if (!matchId) continue;

      if (!statsMap[matchId]) {
        statsMap[matchId] = {
          match_id: matchId,
          total_bets: 0,
          total_stake: 0,
          total_potential_payout: 0,
          pending_bets: 0,
          won_bets: 0,
          lost_bets: 0,
        };
      }

      statsMap[matchId].total_bets++;
      statsMap[matchId].total_stake += Number(bet.stake);
      statsMap[matchId].total_potential_payout += Number(bet.potential_payout);
      if (bet.status === 'pending') statsMap[matchId].pending_bets++;
      if (bet.status === 'won') statsMap[matchId].won_bets++;
      if (bet.status === 'lost') statsMap[matchId].lost_bets++;
    }

    return Object.values(statsMap);
  }
}
