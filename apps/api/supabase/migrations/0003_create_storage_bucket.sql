-- Creates the videos storage bucket for video file uploads.
-- Run in Supabase SQL Editor after 0002_add_analyses_reports_chat.sql

insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;
