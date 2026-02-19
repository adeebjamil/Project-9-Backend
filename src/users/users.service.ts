import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../supabase/supabase.service';
import { UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(private supabase: SupabaseService) { }

    async create(userData: any) {
        const { username, email, password, role, balance } = userData;

        const { data: existing } = await this.supabase.db
            .from('users')
            .select('id')
            .or(`username.eq.${username},email.eq.${email}`)
            .maybeSingle();

        if (existing) {
            throw new ConflictException('Username or email already exists');
        }

        const password_hash = await bcrypt.hash(password, 10);

        const { data, error } = await this.supabase.db
            .from('users')
            .insert({
                username,
                email,
                password_hash,
                role: role || UserRole.USER,
                balance: balance ?? 50000,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async findAll() {
        const { data, error } = await this.supabase.db
            .from('users')
            .select('id, username, email, role, balance, kyc_status, is_suspended, created_at')
            .order('created_at', { ascending: true });
        if (error) throw new Error(error.message);
        return data;
    }

    async findById(id: string) {
        const { data, error } = await this.supabase.db
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw new NotFoundException('User not found');
        return data;
    }

    async findByUsername(username: string) {
        const { data } = await this.supabase.db
            .from('users')
            .select('*')
            .eq('username', username)
            .maybeSingle();
        return data;
    }

    async update(id: string, updateData: any) {
        const { username, email, role, balance, password } = updateData;

        const fields: any = {};
        if (username !== undefined) fields.username = username;
        if (email !== undefined) fields.email = email;
        if (role !== undefined) fields.role = role;
        if (balance !== undefined) fields.balance = Number(balance);
        if (password) fields.password_hash = await (await import('bcrypt')).hash(password, 10);

        if (Object.keys(fields).length === 0) {
            throw new Error('No fields to update');
        }

        const { data, error } = await this.supabase.db
            .from('users')
            .update(fields)
            .eq('id', id)
            .select('id, username, email, role, balance, kyc_status, created_at')
            .single();

        if (error) throw new NotFoundException(error.message);
        return data;
    }

    async remove(id: string) {
        const { error } = await this.supabase.db
            .from('users')
            .delete()
            .eq('id', id);
        if (error) throw new NotFoundException(error.message);
        return { message: 'User deleted successfully' };
    }

    async setSuspended(id: string, suspended: boolean) {
        const updates: any = { is_suspended: suspended };
        // Clear session on suspend so active JWT is invalidated immediately
        if (suspended) updates.current_session_id = null;

        const { data, error } = await this.supabase.db
            .from('users')
            .update(updates)
            .eq('id', id)
            .select('id, username, is_suspended')
            .single();

        if (error) throw new NotFoundException(error.message);
        return data;
    }
}
