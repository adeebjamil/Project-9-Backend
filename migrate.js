/**
 * One-time migration script to add is_suspended column to users table.
 * Run this ONCE from the Supabase SQL Editor:
 *
 *   ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;
 *
 * Or run this script if you have a direct DB connection:
 *   node backend/migrate.js
 *
 * Alternatively, paste the SQL below into: https://supabase.com/dashboard/project/ouuftqrkmryoaysxzofw/sql/new
 */

const SQL = `
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;
`;

console.log('='.repeat(60));
console.log('MIGRATION: Add is_suspended column to users table');
console.log('='.repeat(60));
console.log('');
console.log('Please run the following SQL in your Supabase SQL Editor:');
console.log('https://supabase.com/dashboard/project/ouuftqrkmryoaysxzofw/sql/new');
console.log('');
console.log(SQL);
