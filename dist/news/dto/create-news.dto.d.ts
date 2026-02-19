import { NewsType, NewsStatus } from '../entities/news.entity';
export declare class CreateNewsDto {
    title: string;
    content: string;
    type: NewsType;
    status?: NewsStatus;
    priority?: number;
}
