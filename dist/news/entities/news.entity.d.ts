export declare enum NewsType {
    NEWS = "news",
    ANNOUNCEMENT = "announcement"
}
export declare enum NewsStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
export interface NewsItem {
    id: string;
    title: string;
    content: string;
    type: NewsType;
    status: NewsStatus;
    priority: number;
    created_by: string;
    created_at: string;
    updated_at: string;
}
