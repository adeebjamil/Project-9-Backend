import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private supabase: SupabaseService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { username, email, password } = registerDto;
        return this.usersService.create({ username, email, password, role: UserRole.USER });
    }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findByUsername(username);
        if (!user) return null;

        if (user.is_suspended) {
            throw new UnauthorizedException('Your account has been suspended. Contact support.');
        }

        if (await bcrypt.compare(pass, user.password_hash)) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const sessionId = crypto.randomUUID();

        await this.supabase.db
            .from('users')
            .update({ current_session_id: sessionId })
            .eq('id', user.id);

        const payload = {
            username: user.username,
            sub: user.id,
            role: user.role,
            sessionId,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                balance: Number(user.balance),
            },
        };
    }
}
