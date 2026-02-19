import { NewsType, NewsStatus } from '../entities/news.entity';
export declare class UpdateNewsDto {
    title?: string;
    content?: string;
    type?: NewsType;
    status?: NewsStatus;
    priority?: number;
}
