export enum NewsType {
  NEWS = 'news',
  ANNOUNCEMENT = 'announcement',
}

export enum NewsStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: NewsType;
  status: NewsStatus;
  priority: number; // higher = more important
  created_by: string;
  created_at: string;
  updated_at: string;
}
