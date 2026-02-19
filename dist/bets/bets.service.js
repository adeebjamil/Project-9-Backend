"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const game_engine_service_1 = require("../game-engine/game-engine.service");
let BetsService = class BetsService {
    supabase;
    gameEngine;
    constructor(supabase, gameEngine) {
        this.supabase = supabase;
        this.gameEngine = gameEngine;
    }
    async create(userId, createBetDto) {
        const { selectionId, stake } = createBetDto;
        const { data: user, error: userErr } = await this.supabase.db
            .from('users')
            .select('id, balance')
            .eq('id', userId)
            .single();
        if (userErr || !user)
            throw new common_1.NotFoundException('User not found');
        if (Number(user.balance) < stake)
            throw new common_1.BadRequestException('Insufficient balance');
        const { data: selection, error: selErr } = await this.supabase.db
            .from('selections')
            .select('*, markets!inner(*)')
            .eq('id', selectionId)
            .single();
        if (selErr || !selection) {
            console.error('Selection fetch error:', selErr);
            throw new common_1.NotFoundException('Selection not found');
        }
        if (selection.status && selection.status !== 'active')
            throw new common_1.BadRequestException('Selection is suspended or inactive');
        if (selection.markets?.status && selection.markets.status !== 'open')
            throw new common_1.BadRequestException('Market is closed');
        const engineOutcome = this.gameEngine.determineOutcome();
        const potentialPayout = stake * Number(selection.odds);
        let bet = null;
        let betErr = null;
        const betPayload = {
            user_id: userId,
            selection_id: selectionId,
            stake,
            odds: selection.odds,
            potential_payout: potentialPayout,
            status: 'pending',
        };
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
            const res2 = await this.supabase.db
                .from('bets')
                .insert(betPayload)
                .select()
                .single();
            bet = res2.data;
            betErr = res2.error;
        }
        else {
            bet = res1.data;
            betErr = null;
        }
        if (betErr || !bet) {
            console.error('Bet creation failed:', betErr);
            throw new common_1.BadRequestException(`Failed to create bet: ${betErr?.message || 'Unknown error'}`);
        }
        const newBalance = Number(user.balance) - stake;
        const { error: balErr } = await this.supabase.db
            .from('users')
            .update({ balance: newBalance })
            .eq('id', userId);
        if (balErr) {
            console.error('Balance deduction failed:', balErr);
            await this.supabase.db.from('bets').delete().eq('id', bet.id);
            throw new common_1.BadRequestException('Failed to deduct balance');
        }
        return {
            ...bet,
            selection_name: selection.name,
            market_name: selection.markets?.name || 'Unknown Market',
            new_balance: newBalance,
        };
    }
    async settle(winningSelectionId) {
        const { data: winner, error: winErr } = await this.supabase.db
            .from('selections')
            .select('*, markets!inner(id, selections(id))')
            .eq('id', winningSelectionId)
            .single();
        if (winErr || !winner)
            throw new common_1.NotFoundException('Selection not found');
        const marketId = winner.markets.id;
        const allSelectionIds = winner.markets.selections.map((s) => s.id);
        const losingSelectionIds = allSelectionIds.filter((id) => id !== winningSelectionId);
        const { data: winSideBets } = await this.supabase.db
            .from('bets')
            .select('id, user_id, potential_payout, engine_can_win')
            .eq('selection_id', winningSelectionId)
            .eq('status', 'pending');
        let winnersCount = 0;
        let engineOverrideCount = 0;
        if (winSideBets) {
            for (const bet of winSideBets) {
                const finalResult = this.gameEngine.resolveSettlement(bet.engine_can_win ?? true, true);
                if (finalResult === 'won') {
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
                }
                else {
                    await this.supabase.db
                        .from('bets')
                        .update({ status: 'lost', settled_at: new Date().toISOString() })
                        .eq('id', bet.id);
                    engineOverrideCount++;
                }
            }
        }
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
    async findAll(userId) {
        let data = null;
        let deepJoinWorked = false;
        const res1 = await this.supabase.db
            .from('bets')
            .select('*, selections(*, markets(*, matches(*)))')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (!res1.error && res1.data) {
            data = res1.data;
            deepJoinWorked = true;
        }
        else {
            console.warn('Bets findAll attempt 1 failed:', res1.error?.message);
            const res2 = await this.supabase.db
                .from('bets')
                .select('*, selections(*, markets(*, matches(*)))')
                .eq('user_id', userId)
                .order('placed_at', { ascending: false });
            if (!res2.error && res2.data) {
                data = res2.data;
                deepJoinWorked = true;
            }
            else {
                console.warn('Bets findAll attempt 2 failed:', res2.error?.message);
                const res3 = await this.supabase.db
                    .from('bets')
                    .select('*, selections(*, markets(*, matches(*)))')
                    .eq('user_id', userId);
                if (!res3.error && res3.data) {
                    data = res3.data;
                    deepJoinWorked = true;
                }
                else {
                    console.warn('Bets findAll attempt 3 failed:', res3.error?.message);
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
        return (data || []).map((bet) => {
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
    async getExposure(userId) {
        const { data, error } = await this.supabase.db
            .from('bets')
            .select('stake')
            .eq('user_id', userId)
            .eq('status', 'pending');
        if (error) {
            console.error('Exposure query error:', error);
            return 0;
        }
        return (data || []).reduce((sum, bet) => sum + Number(bet.stake), 0);
    }
    async findOne(id, userId) {
        const { data, error } = await this.supabase.db
            .from('bets')
            .select('*, selections(*, markets(*, matches(*)))')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException('Bet not found');
        return data;
    }
    async getMatchBetStats() {
        const { data: bets, error } = await this.supabase.db
            .from('bets')
            .select('id, stake, status, potential_payout, selections(id, name, markets(id, match_id))');
        if (error) {
            console.error('getMatchBetStats error:', error);
            return [];
        }
        const statsMap = {};
        for (const bet of bets || []) {
            const matchId = bet.selections?.markets?.match_id;
            if (!matchId)
                continue;
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
            if (bet.status === 'pending')
                statsMap[matchId].pending_bets++;
            if (bet.status === 'won')
                statsMap[matchId].won_bets++;
            if (bet.status === 'lost')
                statsMap[matchId].lost_bets++;
        }
        return Object.values(statsMap);
    }
};
exports.BetsService = BetsService;
exports.BetsService = BetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        game_engine_service_1.GameEngineService])
], BetsService);
//# sourceMappingURL=bets.service.js.map