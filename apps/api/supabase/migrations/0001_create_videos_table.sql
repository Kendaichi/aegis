-- Creates the videos metadata table.
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New Query).

create table if not exists videos (
  video_id     text        primary key,
  filename     text        not null,
  size_bytes   bigint      not null,
  content_type text,
  storage_path text        not null,
  created_at   timestamptz not null default now()
);

-- Optional: enable Row Level Security (recommended for production)
-- alter table videos enable row level security;
--
-- Allow the service-role key (used by your API) full access:
-- create policy "service role full access"
--   on videos
--   for all
--   using (true)
--   with check (true);
