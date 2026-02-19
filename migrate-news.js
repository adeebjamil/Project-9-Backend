/**
 * Migration: Create news table for News & Announcements feature.
 * Run this SQL in your Supabase SQL Editor:
 * https://supabase.com/dashboard/project/ouuftqrkmryoaysxzofw/sql/new
 */

const SQL = `
CREATE TABLE IF NOT EXISTS public.news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'news' CHECK (type IN ('news', 'announcement')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  priority INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policy (service role key bypasses RLS, but let's be safe)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" ON public.news
  FOR ALL USING (true) WITH CHECK (true);

-- Index for fast public queries
CREATE INDEX IF NOT EXISTS idx_news_status_type ON public.news (status, type);
CREATE INDEX IF NOT EXISTS idx_news_priority ON public.news (priority DESC);
`;

console.log('='.repeat(60));
console.log('MIGRATION: Create news table');
console.log('='.repeat(60));
console.log('');
console.log('Please run the following SQL in your Supabase SQL Editor:');
console.log('');
console.log(SQL);
