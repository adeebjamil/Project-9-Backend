"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const supabase_service_1 = require("../supabase/supabase.service");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async create(userData) {
        const { username, email, password, role, balance } = userData;
        const { data: existing } = await this.supabase.db
            .from('users')
            .select('id')
            .or(`username.eq.${username},email.eq.${email}`)
            .maybeSingle();
        if (existing) {
            throw new common_1.ConflictException('Username or email already exists');
        }
        const password_hash = await bcrypt.hash(password, 10);
        const { data, error } = await this.supabase.db
            .from('users')
            .insert({
            username,
            email,
            password_hash,
            role: role || user_entity_1.UserRole.USER,
            balance: balance ?? 50000,
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async findAll() {
        const { data, error } = await this.supabase.db
            .from('users')
            .select('id, username, email, role, balance, kyc_status, is_suspended, created_at')
            .order('created_at', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data;
    }
    async findById(id) {
        const { data, error } = await this.supabase.db
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException('User not found');
        return data;
    }
    async findByUsername(username) {
        const { data } = await this.supabase.db
            .from('users')
            .select('*')
            .eq('username', username)
            .maybeSingle();
        return data;
    }
    async update(id, updateData) {
        const { username, email, role, balance, password } = updateData;
        const fields = {};
        if (username !== undefined)
            fields.username = username;
        if (email !== undefined)
            fields.email = email;
        if (role !== undefined)
            fields.role = role;
        if (balance !== undefined)
            fields.balance = Number(balance);
        if (password)
            fields.password_hash = await (await import('bcrypt')).hash(password, 10);
        if (Object.keys(fields).length === 0) {
            throw new Error('No fields to update');
        }
        const { data, error } = await this.supabase.db
            .from('users')
            .update(fields)
            .eq('id', id)
            .select('id, username, email, role, balance, kyc_status, created_at')
            .single();
        if (error)
            throw new common_1.NotFoundException(error.message);
        return data;
    }
    async remove(id) {
        const { error } = await this.supabase.db
            .from('users')
            .delete()
            .eq('id', id);
        if (error)
            throw new common_1.NotFoundException(error.message);
        return { message: 'User deleted successfully' };
    }
    async setSuspended(id, suspended) {
        const updates = { is_suspended: suspended };
        if (suspended)
            updates.current_session_id = null;
        const { data, error } = await this.supabase.db
            .from('users')
            .update(updates)
            .eq('id', id)
            .select('id, username, is_suspended')
            .single();
        if (error)
            throw new common_1.NotFoundException(error.message);
        return data;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map