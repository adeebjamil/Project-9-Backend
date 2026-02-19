import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { SupabaseService } from '../supabase/supabase.service';
export declare class AuthService {
    private usersService;
    private supabase;
    private jwtService;
    constructor(usersService: UsersService, supabase: SupabaseService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<any>;
    validateUser(username: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            email: any;
            role: any;
            balance: number;
        };
    }>;
}
