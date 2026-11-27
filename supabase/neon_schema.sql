-- Clean PostgreSQL schema for Neon (Cyber Mystery Arena)
-- Used by supabase/functions/arena/index.ts via @neondatabase/serverless

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Teams
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  owner_id UUID,
  member_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.teams
  DROP COLUMN IF EXISTS invite_code;

CREATE INDEX IF NOT EXISTS teams_created_at_idx ON public.teams (created_at ASC);
CREATE INDEX IF NOT EXISTS teams_member_ids_gin_idx ON public.teams USING GIN (member_ids);

-- 2. Rankings
CREATE TABLE IF NOT EXISTS public.rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID UNIQUE NOT NULL,
  team_name TEXT NOT NULL DEFAULT 'Team',
  owner_id UUID,
  member_ids UUID[] NOT NULL DEFAULT '{}',
  mode TEXT NOT NULL DEFAULT 'Team',
  score INTEGER NOT NULL DEFAULT 0,
  elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  case_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rankings_score_idx ON public.rankings (score DESC);

-- 3. Games
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Arena Event',
  case_id TEXT NOT NULL DEFAULT 'case-01',
  status TEXT NOT NULL DEFAULT 'open',
  participant_count INTEGER NOT NULL DEFAULT 0,
  participant_team_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.games
  DROP COLUMN IF EXISTS invite_code;

CREATE INDEX IF NOT EXISTS games_created_at_idx ON public.games (created_at DESC);

-- 4. Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS announcements_created_at_idx ON public.announcements (created_at DESC);

-- 5. Stats
CREATE TABLE IF NOT EXISTS public.stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  registered_teams INTEGER NOT NULL DEFAULT 0
);

INSERT INTO public.stats (id, registered_teams)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- 6. Investigation Sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  case_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  hints_used INTEGER NOT NULL DEFAULT 0,
  last_writer UUID,
  progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (team_id, case_id)
);
