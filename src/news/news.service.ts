import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NewsType, NewsStatus } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Create a news item or announcement (admin only)
   */
  async create(dto: CreateNewsDto, userId: string) {
    const { data, error } = await this.supabase.db
      .from('news')
      .insert({
        title: dto.title,
        content: dto.content,
        type: dto.type,
        status: dto.status || NewsStatus.PUBLISHED,
        priority: dto.priority ?? 0,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Update a news item (admin only)
   */
  async update(id: string, dto: UpdateNewsDto) {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.priority !== undefined) updateData.priority = dto.priority;

    const { data, error } = await this.supabase.db
      .from('news')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new NotFoundException(`News item with ID ${id} not found`);
    return data;
  }

  /**
   * Delete a news item (admin only)
   */
  async delete(id: string) {
    const { error } = await this.supabase.db
      .from('news')
      .delete()
      .eq('id', id);

    if (error) throw new NotFoundException(`News item with ID ${id} not found`);
    return { deleted: true };
  }

  /**
   * Get all news items for admin — all statuses
   */
  async findAllForAdmin() {
    const { data, error } = await this.supabase.db
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Get published news items (public)
   */
  async findPublished(type?: NewsType) {
    let query = this.supabase.db
      .from('news')
      .select('*')
      .eq('status', NewsStatus.PUBLISHED)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type) as any;
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Get a single news item by ID (public — must be published)
   */
  async findOne(id: string) {
    const { data, error } = await this.supabase.db
      .from('news')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`News item with ID ${id} not found`);
    return data;
  }
}
