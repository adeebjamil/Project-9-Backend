
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AdminStatus, MatchStatus } from './entities/match.entity';
import { MarketStatus } from './entities/market.entity';
import { SelectionStatus } from './entities/selection.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { CricketApiService } from './cricket-api.service';

@Injectable()
export class MatchesService {
    constructor(
        private supabase: SupabaseService,
        private usersService: UsersService,
        private cricketApiService: CricketApiService,
    ) { }

    async seed() {
        // Seed Admin User if not exists
        const users = await this.usersService.findAll();
        const adminExists = users.some((u: any) => u.role === UserRole.ADMIN);
        if (!adminExists) {
            await this.usersService.create({
                username: 'admin',
                email: 'admin@fortune11.com',
                password: 'admin123',
                role: UserRole.ADMIN,
                balance: 1000000,
            });
            console.log('Admin user created: admin / admin123');
        }

        const { count } = await this.supabase.db
            .from('matches')
            .select('*', { count: 'exact', head: true });

        if (count && count > 0) return { message: 'Already seeded' };

        // Insert seed match
        const { data: match, error: matchErr } = await this.supabase.db
            .from('matches')
            .insert({
                external_id: 'seed-1',
                competition_id: 'seed-comp-1',
                teams: { home: { id: 'ind', name: 'India', shortName: 'IND' }, away: { id: 'aus', name: 'Australia', shortName: 'AUS' } },
                format: 'T20',
                start_time: new Date().toISOString(),
                venue: 'Mumbai',
                status: MatchStatus.LIVE,
                source: 'seed',
                admin_status: AdminStatus.APPROVED,
            })
            .select()
            .single();

        if (matchErr) throw new Error(matchErr.message);

        const { data: market, error: marketErr } = await this.supabase.db
            .from('markets')
            .insert({
                match_id: match.id,
                market_type: 'MATCH_WINNER',
                name: 'Match Winner',
                status: MarketStatus.OPEN,
            })
            .select()
            .single();

        if (marketErr) throw new Error(marketErr.message);

        await this.supabase.db.from('selections').insert([
            { market_id: market.id, name: 'India', odds: 1.85, status: SelectionStatus.ACTIVE },
            { market_id: market.id, name: 'Australia', odds: 1.95, status: SelectionStatus.ACTIVE },
        ]);

        return { message: 'Seeded successfully' };
    }

    async findAll(status?: MatchStatus) {
        let query = this.supabase.db
            .from('matches')
            .select('*, markets(*, selections(*))')
            .eq('admin_status', AdminStatus.APPROVED);

        if (status) {
            query = query.eq('status', status) as any;
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data;
    }

    async findOne(id: string) {
        const { data, error } = await this.supabase.db
            .from('matches')
            .select('*, markets(*, selections(*))')
            .eq('id', id)
            .single();

        if (error || !data) throw new NotFoundException(`Match with ID ${id} not found`);
        return data;
    }

    async importFromCricApi(): Promise<{ imported: number; skipped: number }> {
        const matches = await this.cricketApiService.fetchCurrentMatches();
        let imported = 0;
        let skipped = 0;

        for (const matchData of matches) {
            const { data: existing } = await this.supabase.db
                .from('matches')
                .select('id')
                .eq('external_id', matchData.externalId)
                .maybeSingle();

            if (existing) { skipped++; continue; }

            const { error } = await this.supabase.db.from('matches').insert({
                external_id: matchData.externalId,
                competition_id: matchData.competitionId,
                teams: matchData.teams,
                format: matchData.format,
                start_time: matchData.startTime,
                venue: matchData.venue,
                status: matchData.status,
                source: matchData.source,
                admin_status: AdminStatus.PENDING,
            });

            if (!error) imported++;
        }

        return { imported, skipped };
    }

    async findAllForAdmin() {
        const { data, error } = await this.supabase.db
            .from('matches')
            .select('*, markets(*, selections(*))')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    async updateAdminStatus(
        id: string,
        adminStatus: AdminStatus,
        adminNote: string,
        reviewedBy: string,
    ) {
        const { data, error } = await this.supabase.db
            .from('matches')
            .update({ admin_status: adminStatus, admin_note: adminNote, reviewed_by: reviewedBy })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new NotFoundException(`Match with ID ${id} not found`);
        return data;
    }

    async bulkUpdateAdminStatus(
        adminStatus: AdminStatus,
        reviewedBy: string,
    ) {
        const { data, error } = await this.supabase.db
            .from('matches')
            .update({ admin_status: adminStatus, reviewed_by: reviewedBy })
            .neq('admin_status', adminStatus)
            .select();

        if (error) throw new Error(error.message);
        return { updated: data?.length || 0 };
    }
}
