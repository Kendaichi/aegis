-- Adds assessment-level metadata to videos and per-frame GPS to frame_analyses.
-- Run in Supabase SQL Editor after 0003_create_storage_bucket.sql.

-- ---------------------------------------------------------------------------
-- videos: treat each video row as an "assessment" for the desktop UI.
-- ---------------------------------------------------------------------------
alter table videos
  add column if not exists title         text,
  add column if not exists location_name text,
  add column if not exists incident_type text,
  add column if not exists lat           float,
  add column if not exists lng           float,
  add column if not exists status        text not null default 'pending'
    check (status in ('pending','analyzing','complete')),
  add column if not exists assessment_code text unique;

alter table videos
  add constraint videos_lat_range check (lat is null or (lat between -90 and 90)),
  add constraint videos_lng_range check (lng is null or (lng between -180 and 180));

create index if not exists videos_status_idx        on videos (status);
create index if not exists videos_incident_type_idx on videos (incident_type);

-- Backfill a sensible default for existing rows so the UI has something to show.
update videos
set title = coalesce(title, filename)
where title is null;

-- ---------------------------------------------------------------------------
-- frame_analyses: per-frame GPS for map pins.
-- ---------------------------------------------------------------------------
alter table frame_analyses
  add column if not exists lat float,
  add column if not exists lng float;

alter table frame_analyses
  add constraint frame_analyses_lat_range check (lat is null or (lat between -90 and 90)),
  add constraint frame_analyses_lng_range check (lng is null or (lng between -180 and 180));
