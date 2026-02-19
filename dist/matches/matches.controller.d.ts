import { MatchesService } from './matches.service';
import { MatchStatus, AdminStatus } from './entities/match.entity';
export declare class MatchesController {
    private readonly matchesService;
    constructor(matchesService: MatchesService);
    seed(): Promise<{
        message: string;
    }>;
    importFromCricApi(): Promise<{
        imported: number;
        skipped: number;
    }>;
    findAllForAdmin(): Promise<any[]>;
    bulkUpdateAdminStatus(updateDto: {
        adminStatus: AdminStatus;
    }, req: any): Promise<{
        updated: number;
    }>;
    findAll(status?: MatchStatus): Promise<any[]>;
    findOne(id: string): Promise<any>;
    updateAdminStatus(id: string, updateDto: {
        adminStatus: AdminStatus;
        adminNote?: string;
    }, req: any): Promise<any>;
}
