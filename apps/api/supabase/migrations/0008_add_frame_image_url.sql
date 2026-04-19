-- Store persistent Supabase Storage URL for each extracted frame JPEG.
-- Replaces the previous approach of serving frames from ephemeral local disk.

alter table frame_analyses
  add column if not exists image_url text;

comment on column frame_analyses.image_url is
  'Public Supabase Storage URL for the extracted frame JPEG; null for legacy rows.';

-- Public bucket for frame JPEGs — browser needs direct access without signed URLs.
insert into storage.buckets (id, name, public)
values ('frames', 'frames', true)
on conflict (id) do nothing;
