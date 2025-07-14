create extension if not exists "pgcrypto";

create table public.strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  summary jsonb,
  code jsonb,
  chat_history jsonb,
  analytics jsonb,
  tags text[],
  is_public boolean default false,
  thumbnail text,
  likes integer default 0,
  copies integer default 0,
  price numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_strategies_user_id on public.strategies(user_id);
create index if not exists idx_strategies_is_public on public.strategies(is_public);
