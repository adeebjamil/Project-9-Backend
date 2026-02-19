import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private supabase: SupabaseService,
    ) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req: any) {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req: any) {
        const user = await this.usersService.findById(req.user.id);
        const { password_hash, ...safe } = user;

        // Calculate exposure (sum of stakes from pending bets)
        let exposure = 0;
        try {
            const { data } = await this.supabase.db
                .from('bets')
                .select('stake')
                .eq('user_id', req.user.id)
                .eq('status', 'pending');
            exposure = (data || []).reduce((sum: number, b: any) => sum + Number(b.stake), 0);
        } catch { /* exposure defaults to 0 */ }

        return { ...safe, exposure };
    }
}
