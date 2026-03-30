-- Run this SQL in your Supabase SQL Editor to set up the database

-- 1. Enable pgvector extension
create extension if not exists vector with schema extensions;

-- 2. Transcript chunks table for RAG
create table if not exists transcript_chunks (
  id uuid primary key default gen_random_uuid(),
  episode_slug text not null,
  guest text not null,
  title text not null,
  youtube_url text,
  video_id text,
  publish_date date,
  timestamp_start text not null,
  timestamp_seconds integer not null default 0,
  speaker text not null,
  content text not null,
  keywords text[] default '{}',
  embedding vector(1024),
  created_at timestamptz default now()
);

-- 3. Index for vector similarity search
create index if not exists transcript_chunks_embedding_idx
  on transcript_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists transcript_chunks_episode_idx
  on transcript_chunks (episode_slug);

-- 4. Conversations table
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New conversation',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists conversations_user_idx
  on conversations (user_id, updated_at desc);

-- 5. Messages table
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  citations jsonb default '[]',
  created_at timestamptz default now()
);

create index if not exists messages_conversation_idx
  on messages (conversation_id, created_at asc);

-- 6. Similarity search function
create or replace function match_transcript_chunks(
  query_embedding vector(1024),
  match_threshold float default 0.5,
  match_count int default 8
)
returns table (
  id uuid,
  episode_slug text,
  guest text,
  title text,
  youtube_url text,
  video_id text,
  publish_date date,
  timestamp_start text,
  timestamp_seconds integer,
  speaker text,
  content text,
  keywords text[],
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    tc.id,
    tc.episode_slug,
    tc.guest,
    tc.title,
    tc.youtube_url,
    tc.video_id,
    tc.publish_date,
    tc.timestamp_start,
    tc.timestamp_seconds,
    tc.speaker,
    tc.content,
    tc.keywords,
    1 - (tc.embedding <=> query_embedding) as similarity
  from transcript_chunks tc
  where 1 - (tc.embedding <=> query_embedding) > match_threshold
  order by tc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 7. RLS policies
alter table conversations enable row level security;
alter table messages enable row level security;

create policy "Users can manage their own conversations"
  on conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage messages in their conversations"
  on messages for all
  using (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  )
  with check (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );

-- transcript_chunks is read-only for authenticated users
alter table transcript_chunks enable row level security;

create policy "Authenticated users can read transcript chunks"
  on transcript_chunks for select
  to authenticated
  using (true);

-- 8. Auto-update updated_at on conversations
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_conversations_updated_at
  before update on conversations
  for each row
  execute function update_updated_at_column();
