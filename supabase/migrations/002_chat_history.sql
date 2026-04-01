-- Extend profiles table with missing columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'scout',
  ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update the auto-create trigger to set full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, full_name, energy_balance, plan, xp, level)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    10000,
    'scout',
    0,
    1
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Chat threads (one per conversation)
create table if not exists public.chat_threads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'New Chat',
  hero_slug text not null default 'master',
  agent_slug text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chat messages (one per message in a thread)
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references public.chat_threads(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  model_used text,
  created_at timestamptz default now()
);

-- RLS policies
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

create policy "Users see own threads" on public.chat_threads
  for all using (auth.uid() = user_id);

create policy "Users see own messages" on public.chat_messages
  for all using (auth.uid() = user_id);

-- Auto-update updated_at on threads
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger chat_threads_updated_at
  before update on public.chat_threads
  for each row execute function update_updated_at();
