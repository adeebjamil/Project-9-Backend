"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const news_entity_1 = require("./entities/news.entity");
let NewsService = class NewsService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async create(dto, userId) {
        const { data, error } = await this.supabase.db
            .from('news')
            .insert({
            title: dto.title,
            content: dto.content,
            type: dto.type,
            status: dto.status || news_entity_1.NewsStatus.PUBLISHED,
            priority: dto.priority ?? 0,
            created_by: userId,
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async update(id, dto) {
        const updateData = { updated_at: new Date().toISOString() };
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.content !== undefined)
            updateData.content = dto.content;
        if (dto.type !== undefined)
            updateData.type = dto.type;
        if (dto.status !== undefined)
            updateData.status = dto.status;
        if (dto.priority !== undefined)
            updateData.priority = dto.priority;
        const { data, error } = await this.supabase.db
            .from('news')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.NotFoundException(`News item with ID ${id} not found`);
        return data;
    }
    async delete(id) {
        const { error } = await this.supabase.db
            .from('news')
            .delete()
            .eq('id', id);
        if (error)
            throw new common_1.NotFoundException(`News item with ID ${id} not found`);
        return { deleted: true };
    }
    async findAllForAdmin() {
        const { data, error } = await this.supabase.db
            .from('news')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data || [];
    }
    async findPublished(type) {
        let query = this.supabase.db
            .from('news')
            .select('*')
            .eq('status', news_entity_1.NewsStatus.PUBLISHED)
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false });
        if (type) {
            query = query.eq('type', type);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return data || [];
    }
    async findOne(id) {
        const { data, error } = await this.supabase.db
            .from('news')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`News item with ID ${id} not found`);
        return data;
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], NewsService);
//# sourceMappingURL=news.service.js.map