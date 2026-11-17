-- Cyber Mystery Arena schema for Supabase project: erfbsolezxmdunjjthgq
-- Run this in your Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  invite_code text unique not null,
  owner_id uuid not null,
  member_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.rankings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid unique not null references public.teams(id) on delete cascade,
  team_name text not null,
  owner_id uuid not null,
  member_ids uuid[] not null default '{}',
  mode text not null default 'Team',
  score integer not null default 0,
  elapsed_seconds integer not null default 0,
  case_scores jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  case_id text not null,
  invite_code text unique not null,
  status text not null default 'open',
  participant_count integer not null default 0,
  participant_team_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.stats (
  id integer primary key default 1,
  registered_teams integer not null default 0
);

insert into public.stats (id, registered_teams)
values (1, 0)
on conflict (id) do nothing;

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  case_id text not null,
  started_at timestamptz not null default now(),
  hints_used integer not null default 0,
  last_writer uuid,
  progress jsonb not null default '{}'::jsonb,
  completed boolean not null default false,
  unique (team_id, case_id)
);

-- Enable Row Level Security
alter table public.teams enable row level security;
alter table public.rankings enable row level security;
alter table public.games enable row level security;
alter table public.announcements enable row level security;
alter table public.stats enable row level security;
alter table public.sessions enable row level security;

-- Read policies (writes are performed via the Edge Function using service_role)
drop policy if exists "Public read stats" on public.stats;
create policy "Public read stats" on public.stats
  for select using (true);

drop policy if exists "Authenticated read rankings" on public.rankings;
create policy "Authenticated read rankings" on public.rankings
  for select to authenticated using (true);

drop policy if exists "Authenticated read games" on public.games;
create policy "Authenticated read games" on public.games
  for select to authenticated using (true);

drop policy if exists "Authenticated read announcements" on public.announcements;
create policy "Authenticated read announcements" on public.announcements
  for select to authenticated using (true);

drop policy if exists "Team members read sessions" on public.sessions;
create policy "Team members read sessions" on public.sessions
  for select to authenticated using (
    exists (
      select 1 from public.teams t
      where t.id = sessions.team_id
        and auth.uid() = any(t.member_ids)
    )
  );

-- Enable Realtime on public tables (safe if already added)
do $$
declare
  tbl text;
begin
  foreach tbl in array array['rankings', 'games', 'announcements', 'stats', 'sessions'] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = tbl
    ) then
      execute format('alter publication supabase_realtime add table public.%I', tbl);
    end if;
  end loop;
end $$;

-- Reload PostgREST schema cache immediately
notify pgrst, 'reload schema';
