-- Flat chat history table for frontend persistence.
-- Separate from the backend's chat_sessions/chat_messages tables.

create table if not exists chat_history (
  id         uuid        primary key default gen_random_uuid(),
  video_id   text        not null references videos(video_id) on delete cascade,
  session_id text,
  role       text        not null check (role in ('user', 'assistant')),
  content    text        not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_history_video_id_idx on chat_history (video_id, created_at);

alter table chat_history enable row level security;
create policy "allow all" on chat_history for all using (true) with check (true);
