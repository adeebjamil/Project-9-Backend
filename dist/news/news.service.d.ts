import { SupabaseService } from '../supabase/supabase.service';
import { NewsType } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
export declare class NewsService {
    private supabase;
    constructor(supabase: SupabaseService);
    create(dto: CreateNewsDto, userId: string): Promise<any>;
    update(id: string, dto: UpdateNewsDto): Promise<any>;
    delete(id: string): Promise<{
        deleted: boolean;
    }>;
    findAllForAdmin(): Promise<any[]>;
    findPublished(type?: NewsType): Promise<any[]>;
    findOne(id: string): Promise<any>;
}
