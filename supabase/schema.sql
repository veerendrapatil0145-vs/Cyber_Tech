-- Cyber Mystery Arena schema & optimization migration for Supabase project: erfbsolezxmdunjjthgq
-- Run this in your Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  owner_id uuid,
  member_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.teams
  add column if not exists name text,
  add column if not exists owner_id uuid,
  add column if not exists member_ids uuid[] not null default '{}',
  add column if not exists created_at timestamptz not null default now();

-- Remove unused invitation code column from teams
alter table public.teams
  drop column if exists invite_code;

create table if not exists public.rankings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid unique not null,
  team_name text not null default 'Team',
  owner_id uuid,
  member_ids uuid[] not null default '{}',
  mode text not null default 'Team',
  score integer not null default 0,
  elapsed_seconds integer not null default 0,
  case_scores jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.rankings
  add column if not exists team_id uuid,
  add column if not exists team_name text not null default 'Team',
  add column if not exists owner_id uuid,
  add column if not exists member_ids uuid[] not null default '{}',
  add column if not exists mode text not null default 'Team',
  add column if not exists score integer not null default 0,
  add column if not exists elapsed_seconds integer not null default 0,
  add column if not exists case_scores jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists rankings_team_id_uidx on public.rankings (team_id);
create index if not exists rankings_score_idx on public.rankings (score desc);
create index if not exists teams_created_at_idx on public.teams (created_at asc);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Arena Event',
  case_id text not null default 'case-01',
  status text not null default 'open',
  participant_count integer not null default 0,
  participant_team_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.games
  add column if not exists name text not null default 'Arena Event',
  add column if not exists case_id text not null default 'case-01',
  add column if not exists status text not null default 'open',
  add column if not exists participant_count integer not null default 0,
  add column if not exists participant_team_ids uuid[] not null default '{}',
  add column if not exists created_at timestamptz not null default now();

-- Remove unused invitation code column from games
alter table public.games
  drop column if exists invite_code;

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
  team_id uuid not null,
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
      where t.id::text = sessions.team_id::text
        and auth.uid()::text = any(t.member_ids::text[])
    )
  );

-- Disable Realtime publication on arena tables to conserve Nano RAM and Disk IO
do $$
declare
  tbl text;
begin
  foreach tbl in array array['rankings', 'games', 'announcements', 'stats', 'sessions'] loop
    if exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = tbl
    ) then
      execute format('alter publication supabase_realtime drop table public.%I', tbl);
    end if;
  end loop;
end $$;

-- Drop NOT NULL on any legacy pre-existing columns (e.g. games.title) so inserts succeed
do $$
declare
  col record;
begin
  for col in
    select table_name, column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('teams', 'rankings', 'games')
      and is_nullable = 'NO'
      and column_default is null
      and column_name not in ('id', 'team_id', 'name', 'member_ids', 'owner_id')
  loop
    execute format('alter table public.%I alter column %I drop not null', col.table_name, col.column_name);
  end loop;
end $$;

-- Reload PostgREST schema cache immediately
notify pgrst, 'reload schema';
