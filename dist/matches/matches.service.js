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
exports.MatchesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const match_entity_1 = require("./entities/match.entity");
const market_entity_1 = require("./entities/market.entity");
const selection_entity_1 = require("./entities/selection.entity");
const users_service_1 = require("../users/users.service");
const user_entity_1 = require("../users/entities/user.entity");
const cricket_api_service_1 = require("./cricket-api.service");
let MatchesService = class MatchesService {
    supabase;
    usersService;
    cricketApiService;
    constructor(supabase, usersService, cricketApiService) {
        this.supabase = supabase;
        this.usersService = usersService;
        this.cricketApiService = cricketApiService;
    }
    async seed() {
        const users = await this.usersService.findAll();
        const adminExists = users.some((u) => u.role === user_entity_1.UserRole.ADMIN);
        if (!adminExists) {
            await this.usersService.create({
                username: 'admin',
                email: 'admin@fortune11.com',
                password: 'admin123',
                role: user_entity_1.UserRole.ADMIN,
                balance: 1000000,
            });
            console.log('Admin user created: admin / admin123');
        }
        const { count } = await this.supabase.db
            .from('matches')
            .select('*', { count: 'exact', head: true });
        if (count && count > 0)
            return { message: 'Already seeded' };
        const { data: match, error: matchErr } = await this.supabase.db
            .from('matches')
            .insert({
            external_id: 'seed-1',
            competition_id: 'seed-comp-1',
            teams: { home: { id: 'ind', name: 'India', shortName: 'IND' }, away: { id: 'aus', name: 'Australia', shortName: 'AUS' } },
            format: 'T20',
            start_time: new Date().toISOString(),
            venue: 'Mumbai',
            status: match_entity_1.MatchStatus.LIVE,
            source: 'seed',
            admin_status: match_entity_1.AdminStatus.APPROVED,
        })
            .select()
            .single();
        if (matchErr)
            throw new Error(matchErr.message);
        const { data: market, error: marketErr } = await this.supabase.db
            .from('markets')
            .insert({
            match_id: match.id,
            market_type: 'MATCH_WINNER',
            name: 'Match Winner',
            status: market_entity_1.MarketStatus.OPEN,
        })
            .select()
            .single();
        if (marketErr)
            throw new Error(marketErr.message);
        await this.supabase.db.from('selections').insert([
            { market_id: market.id, name: 'India', odds: 1.85, status: selection_entity_1.SelectionStatus.ACTIVE },
            { market_id: market.id, name: 'Australia', odds: 1.95, status: selection_entity_1.SelectionStatus.ACTIVE },
        ]);
        return { message: 'Seeded successfully' };
    }
    async findAll(status) {
        let query = this.supabase.db
            .from('matches')
            .select('*, markets(*, selections(*))')
            .eq('admin_status', match_entity_1.AdminStatus.APPROVED);
        if (status) {
            query = query.eq('status', status);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.supabase.db
            .from('matches')
            .select('*, markets(*, selections(*))')
            .eq('id', id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`Match with ID ${id} not found`);
        return data;
    }
    async importFromCricApi() {
        const matches = await this.cricketApiService.fetchCurrentMatches();
        let imported = 0;
        let skipped = 0;
        for (const matchData of matches) {
            const { data: existing } = await this.supabase.db
                .from('matches')
                .select('id')
                .eq('external_id', matchData.externalId)
                .maybeSingle();
            if (existing) {
                skipped++;
                continue;
            }
            const { error } = await this.supabase.db.from('matches').insert({
                external_id: matchData.externalId,
                competition_id: matchData.competitionId,
                teams: matchData.teams,
                format: matchData.format,
                start_time: matchData.startTime,
                venue: matchData.venue,
                status: matchData.status,
                source: matchData.source,
                admin_status: match_entity_1.AdminStatus.PENDING,
            });
            if (!error)
                imported++;
        }
        return { imported, skipped };
    }
    async findAllForAdmin() {
        const { data, error } = await this.supabase.db
            .from('matches')
            .select('*, markets(*, selections(*))')
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data;
    }
    async updateAdminStatus(id, adminStatus, adminNote, reviewedBy) {
        const { data, error } = await this.supabase.db
            .from('matches')
            .update({ admin_status: adminStatus, admin_note: adminNote, reviewed_by: reviewedBy })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.NotFoundException(`Match with ID ${id} not found`);
        return data;
    }
    async bulkUpdateAdminStatus(adminStatus, reviewedBy) {
        const { data, error } = await this.supabase.db
            .from('matches')
            .update({ admin_status: adminStatus, reviewed_by: reviewedBy })
            .neq('admin_status', adminStatus)
            .select();
        if (error)
            throw new Error(error.message);
        return { updated: data?.length || 0 };
    }
};
exports.MatchesService = MatchesService;
exports.MatchesService = MatchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        users_service_1.UsersService,
        cricket_api_service_1.CricketApiService])
], MatchesService);
//# sourceMappingURL=matches.service.js.map