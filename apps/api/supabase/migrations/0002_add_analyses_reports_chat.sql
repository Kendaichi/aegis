-- Run in Supabase SQL Editor after 0001_create_videos_table.sql

create table if not exists frame_analyses (
  frame_id          uuid        primary key default gen_random_uuid(),
  video_id          text        not null references videos(video_id) on delete cascade,
  frame_index       integer     not null,
  timestamp_seconds float       not null,
  severity          text        not null check (severity in ('none','minor','moderate','severe','destroyed')),
  description       text        not null,
  detected_hazards  text[]      not null default '{}',
  confidence        float       not null check (confidence between 0 and 1),
  created_at        timestamptz not null default now(),
  unique (video_id, frame_index)
);

create table if not exists reports (
  report_id        text        primary key,
  video_id         text        not null references videos(video_id) on delete cascade,
  summary          text        not null,
  overall_severity text        not null check (overall_severity in ('none','minor','moderate','severe','destroyed')),
  key_findings     text[]      not null default '{}',
  recommendations  text[]      not null default '{}',
  incident_type    text,
  lat              float,
  lng              float,
  created_at       timestamptz not null default now()
);

create table if not exists chat_sessions (
  session_id uuid        primary key default gen_random_uuid(),
  video_id   text        references videos(video_id) on delete set null,
  report_id  text        references reports(report_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists chat_messages (
  message_id uuid        primary key default gen_random_uuid(),
  session_id uuid        not null references chat_sessions(session_id) on delete cascade,
  role       text        not null check (role in ('user','assistant','system')),
  content    text        not null,
  created_at timestamptz not null default now()
);
