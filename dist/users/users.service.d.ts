import { SupabaseService } from '../supabase/supabase.service';
export declare class UsersService {
    private supabase;
    constructor(supabase: SupabaseService);
    create(userData: any): Promise<any>;
    findAll(): Promise<{
        id: any;
        username: any;
        email: any;
        role: any;
        balance: any;
        kyc_status: any;
        is_suspended: any;
        created_at: any;
    }[]>;
    findById(id: string): Promise<any>;
    findByUsername(username: string): Promise<any>;
    update(id: string, updateData: any): Promise<{
        id: any;
        username: any;
        email: any;
        role: any;
        balance: any;
        kyc_status: any;
        created_at: any;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    setSuspended(id: string, suspended: boolean): Promise<{
        id: any;
        username: any;
        is_suspended: any;
    }>;
}
