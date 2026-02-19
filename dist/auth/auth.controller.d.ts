import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { SupabaseService } from '../supabase/supabase.service';
export declare class AuthController {
    private authService;
    private usersService;
    private supabase;
    constructor(authService: AuthService, usersService: UsersService, supabase: SupabaseService);
    register(registerDto: RegisterDto): Promise<any>;
    login(req: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            email: any;
            role: any;
            balance: number;
        };
    }>;
    getProfile(req: any): Promise<any>;
}
