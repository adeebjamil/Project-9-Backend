import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsType } from './entities/news.entity';
export declare class NewsController {
    private readonly newsService;
    constructor(newsService: NewsService);
    findPublished(type?: NewsType): Promise<any[]>;
    findAllForAdmin(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateNewsDto, req: any): Promise<any>;
    update(id: string, dto: UpdateNewsDto): Promise<any>;
    delete(id: string): Promise<{
        deleted: boolean;
    }>;
}
