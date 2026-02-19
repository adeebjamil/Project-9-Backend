import { SupabaseService } from '../supabase/supabase.service';
import { AdminStatus, MatchStatus } from './entities/match.entity';
import { UsersService } from '../users/users.service';
import { CricketApiService } from './cricket-api.service';
export declare class MatchesService {
    private supabase;
    private usersService;
    private cricketApiService;
    constructor(supabase: SupabaseService, usersService: UsersService, cricketApiService: CricketApiService);
    seed(): Promise<{
        message: string;
    }>;
    findAll(status?: MatchStatus): Promise<any[]>;
    findOne(id: string): Promise<any>;
    importFromCricApi(): Promise<{
        imported: number;
        skipped: number;
    }>;
    findAllForAdmin(): Promise<any[]>;
    updateAdminStatus(id: string, adminStatus: AdminStatus, adminNote: string, reviewedBy: string): Promise<any>;
    bulkUpdateAdminStatus(adminStatus: AdminStatus, reviewedBy: string): Promise<{
        updated: number;
    }>;
}
