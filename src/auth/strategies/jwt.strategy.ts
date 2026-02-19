
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private supabase: SupabaseService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
        });
    }

    async validate(payload: any) {
        const { data: user } = await this.supabase.db
            .from('users')
            .select('*')
            .eq('id', payload.sub)
            .single();

        if (!user) {
            throw new UnauthorizedException('Account not found.');
        }

        if (user.is_suspended) {
            throw new UnauthorizedException('Your account has been suspended. Contact support.');
        }

        // Single-device session enforcement
        if (user.current_session_id && user.current_session_id !== payload.sessionId) {
            throw new UnauthorizedException('Session expired. You have logged in from another device.');
        }

        return {
            userId: payload.sub,
            username: payload.username,
            role: payload.role,
            id: payload.sub,
        };
    }
}
