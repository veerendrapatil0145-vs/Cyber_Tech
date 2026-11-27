import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import { caseAnswerKeys, gradeCaseVerdict } from './server/caseAnswers.ts';

dotenv.config();

interface TeamRecord {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
  slot?: number;
}

interface CaseScoreRecord {
  score: number;
  maxScore?: number;
  sequenceScore?: number;
  summaryScore?: number;
  hintsUsed: number;
  elapsedSeconds: number;
  submittedAt: string;
  timelineMatches: number;
  totalTimeline: number;
  keyCluesFound?: number;
  totalKeyClues?: number;
  explanations: Array<{
    title: string;
    correct: boolean;
    explanation: string;
  }>;
}

interface RankingRecord {
  id: string;
  teamId: string;
  teamName: string;
  ownerId: string;
  memberIds: string[];
  mode: 'Team';
  score: number;
  elapsedSeconds: number;
  caseScores: Record<string, CaseScoreRecord>;
  updatedAt: string;
}

interface GameRecord {
  id: string;
  name: string;
  caseId: string;
  inviteCode: string;
  status: 'open' | 'live' | 'paused' | 'ended';
  durationMinutes?: number;
  participantCount: number;
  participantTeamIds: string[];
  createdAt: string;
}

function normalizeGameDurationMinutes(raw: unknown, name?: string): number {
  const fromRaw = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
  if (Number.isFinite(fromRaw) && fromRaw >= 1) {
    return Math.max(1, Math.min(300, Math.round(fromRaw)));
  }
  const match = typeof name === 'string' ? name.match(/\((\d+)\s*m\)/i)?.[1] : undefined;
  if (match) {
    const parsed = Number(match);
    if (Number.isFinite(parsed) && parsed >= 1) {
      return Math.max(1, Math.min(300, Math.round(parsed)));
    }
  }
  return 30;
}

interface AnnouncementRecord {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

interface SessionProgress {
  report: string;
  selectedEvidence: number[];
  timelineOrder: string[];
}

interface InvestigationSessionRecord {
  id: string;
  teamId: string;
  caseId: string;
  startedAt: number;
  accumulatedElapsedSeconds?: number;
  runningSince?: number | null;
  hintsUsed: number;
  lastWriter: string;
  progress: SessionProgress;
  completed: boolean;
}

function getSessionElapsedSeconds(session: InvestigationSessionRecord, isLiveNow: boolean): number {
  if (typeof session.accumulatedElapsedSeconds === 'number') {
    const activeExtra =
      isLiveNow && typeof session.runningSince === 'number'
        ? Math.max(0, Math.floor((Date.now() - session.runningSince) / 1000))
        : 0;
    return session.accumulatedElapsedSeconds + activeExtra;
  }
  return Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000));
}

interface ArenaDatabase {
  teams: TeamRecord[];
  rankings: RankingRecord[];
  games: GameRecord[];
  announcements: AnnouncementRecord[];
  sessions: InvestigationSessionRecord[];
  nextTeamSlot?: number;
}

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'ARENA-ADMIN-2026';
const REGISTRATION_ACCESS_CODE = process.env.REGISTRATION_ACCESS_CODE || 'Avion_2026';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://erfbsolezxmdunjjthgq.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_xiq2MhpCfVsvmRTyAsG4Gg_5THnxlE5';
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'arena.json');

const EMPTY_DB: ArenaDatabase = {
  teams: [],
  rankings: [],
  games: [],
  announcements: [],
  sessions: [],
  nextTeamSlot: 0,
};

let dbCache: ArenaDatabase | null = null;
let writeQueue: Promise<void> = Promise.resolve();
const activeAdminTokens = new Set<string>();
const verifiedSupabaseAdmins = new Map<string, number>();
const sseClients = new Set<Response>();

async function ensureDb(): Promise<ArenaDatabase> {
  if (dbCache) return dbCache;
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ArenaDatabase>;
    const teams = Array.isArray(parsed.teams) ? parsed.teams : [];
    const maxSlot = teams.reduce(
      (max, item, index) => Math.max(max, typeof item.slot === 'number' ? item.slot : index),
      -1
    );
    dbCache = {
      teams,
      rankings: Array.isArray(parsed.rankings) ? parsed.rankings : [],
      games: Array.isArray(parsed.games) ? parsed.games : [],
      announcements: Array.isArray(parsed.announcements) ? parsed.announcements : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      nextTeamSlot:
        typeof parsed.nextTeamSlot === 'number' ? Math.max(parsed.nextTeamSlot, maxSlot + 1) : maxSlot + 1,
    };
  } catch {
    dbCache = structuredClone(EMPTY_DB);
    await persistDb(dbCache);
  }
  return dbCache;
}

async function persistDb(nextDb: ArenaDatabase): Promise<void> {
  dbCache = nextDb;
  const serialized = JSON.stringify(nextDb, null, 2);
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tempFile = `${DB_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tempFile, serialized, 'utf8');
    await fs.rename(tempFile, DB_FILE);
  });
  await writeQueue;
}

function generateInviteCode(length = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  return result;
}

function getPlayerId(req: Request): string {
  const raw = req.header('x-arena-player')?.trim() || '';
  if (/^[a-zA-Z0-9_-]{8,80}$/.test(raw)) {
    return raw;
  }
  return '';
}

function signLocalAdminToken(): string {
  const exp = Date.now() + 24 * 60 * 60 * 1000;
  const payload = String(exp);
  const sig = crypto.createHmac('sha256', ADMIN_PASSCODE).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyLocalAdminToken(token: string): boolean {
  if (!token) return false;
  if (activeAdminTokens.has(token)) return true;
  const [payload, sigHex] = token.split('.');
  if (!payload || !sigHex) return false;
  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expectedHex = crypto.createHmac('sha256', ADMIN_PASSCODE).update(payload).digest('hex');
  return expectedHex === sigHex;
}

function getRequestAdminToken(req: Request): string {
  const headerToken = req.header('x-arena-admin')?.trim() || '';
  const bodyToken =
    req.body && typeof (req.body as { adminToken?: unknown }).adminToken === 'string'
      ? (req.body as { adminToken: string }).adminToken.trim()
      : '';
  return headerToken || bodyToken;
}

function isAdminRequest(req: Request): boolean {
  return verifyLocalAdminToken(getRequestAdminToken(req));
}

async function verifySupabaseAdmin(authHeader: string, adminToken: string): Promise<boolean> {
  if (!authHeader.startsWith('Bearer ') || !SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  const cacheKey = `${authHeader}:${adminToken}`;
  const cachedExpiry = verifiedSupabaseAdmins.get(cacheKey);
  if (cachedExpiry && cachedExpiry > Date.now()) {
    return true;
  }
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/arena`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: authHeader,
        'Content-Type': 'application/json',
        ...(adminToken ? { 'x-arena-admin': adminToken } : {}),
      },
      body: JSON.stringify({
        action: 'adminListTeams',
        ...(adminToken ? { adminToken } : {}),
      }),
    });
    if (!response.ok) return false;
    verifiedSupabaseAdmins.set(cacheKey, Date.now() + 5 * 60 * 1000);
    return true;
  } catch {
    return false;
  }
}

async function isAdminRequestAsync(req: Request): Promise<boolean> {
  if (isAdminRequest(req)) return true;
  const authHeader = req.header('authorization')?.trim() || '';
  const adminToken = getRequestAdminToken(req);
  if (!authHeader) return false;
  if (!adminToken && req.header('x-arena-admin-check') !== '1') return false;
  return verifySupabaseAdmin(authHeader, adminToken);
}

async function syncSupabaseTeamForPlayer(
  db: ArenaDatabase,
  authHeader: string,
  playerId: string,
  requestedTeamId?: string | null
): Promise<TeamRecord | undefined> {
  const localTeam = findTeamForPlayer(db, playerId, requestedTeamId);
  if (localTeam) return localTeam;
  if (!authHeader.startsWith('Bearer ') || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return undefined;
  }
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/arena`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'listMyTeams' }),
    });
    if (!response.ok) return undefined;
    const data = (await response.json()) as {
      teams?: Array<{ id?: string; name?: string; inviteCode?: string }>;
    };
    const remoteTeams = Array.isArray(data.teams) ? data.teams : [];
    const matched = requestedTeamId
      ? remoteTeams.find((entry) => entry.id === requestedTeamId)
      : remoteTeams[0];
    if (!matched?.id || !matched?.name) return undefined;

    let existing = db.teams.find((entry) => entry.id === matched.id);
    if (!existing) {
      existing = {
        id: matched.id,
        name: matched.name,
        inviteCode: matched.inviteCode || generateInviteCode(6),
        ownerId: playerId,
        memberIds: [playerId],
        createdAt: new Date().toISOString(),
      };
      db.teams.push(existing);
    } else {
      existing.name = matched.name;
      if (!existing.memberIds.includes(playerId)) {
        existing.memberIds.push(playerId);
      }
    }
    await persistDb(db);
    return existing;
  } catch {
    return undefined;
  }
}

function maxCaseScoreById(caseId: string): number {
  const num = Number(caseId.replace(/\D+/g, ''));
  if (num >= 1 && num <= 5) return 50;
  if (num >= 6 && num <= 15) return 75;
  return 100;
}

function broadcastEvent(event: string, payload: unknown): void {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(message);
    } catch {
      sseClients.delete(res);
    }
  }
}

function compareRankingRecords(a: RankingRecord, b: RankingRecord): number {
  if (b.score !== a.score) return b.score - a.score;
  const aCases = Object.keys(a.caseScores || {}).length;
  const bCases = Object.keys(b.caseScores || {}).length;
  if (bCases !== aCases) return bCases - aCases;
  if (aCases > 0 && bCases > 0 && a.elapsedSeconds !== b.elapsedSeconds) {
    return a.elapsedSeconds - b.elapsedSeconds;
  }
  return a.teamName.localeCompare(b.teamName);
}

function buildAdminFullRankings(db: ArenaDatabase): RankingRecord[] {
  const byTeamId = new Map<string, RankingRecord>();
  for (const entry of db.rankings) {
    byTeamId.set(entry.teamId, entry);
  }
  const merged: RankingRecord[] = db.teams.map((team) => {
    const existing = byTeamId.get(team.id);
    if (existing) {
      return {
        ...existing,
        teamName: team.name,
        memberIds: [...team.memberIds],
      };
    }
    return {
      id: `rank_${team.id}`,
      teamId: team.id,
      teamName: team.name,
      ownerId: team.ownerId,
      memberIds: [...team.memberIds],
      mode: 'Team',
      score: 0,
      elapsedSeconds: 0,
      caseScores: {},
      updatedAt: team.createdAt,
    };
  });
  const activeTeamIds = new Set(db.teams.map((team) => team.id));
  for (const entry of db.rankings) {
    if (!activeTeamIds.has(entry.teamId)) {
      merged.push(entry);
    }
  }
  return merged.sort(compareRankingRecords);
}

function buildPublicState(db: ArenaDatabase, isAdmin: boolean, playerId = '') {
  const sortedScoredRankings = [...db.rankings].sort(compareRankingRecords);
  const playerRankIndex = playerId
    ? sortedScoredRankings.findIndex(
        (entry) => entry.ownerId === playerId || entry.memberIds.includes(playerId)
      )
    : -1;
  const visibleRankings = isAdmin
    ? buildAdminFullRankings(db).slice(0, 500)
    : playerId
    ? sortedScoredRankings.filter(
        (entry) => entry.ownerId === playerId || entry.memberIds.includes(playerId)
      )
    : undefined;

  return {
    ...(visibleRankings !== undefined ? { rankings: visibleRankings } : {}),
    ...(playerId ? { myRank: playerRankIndex >= 0 ? playerRankIndex + 1 : 0 } : {}),
    games: [...db.games]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 20),
    announcements: [...db.announcements]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8),
    stats: {
      registered_teams: db.teams.length,
    },
    isAdmin,
  };
}

function findTeamForPlayer(
  db: ArenaDatabase,
  playerId: string,
  teamId?: string | null
): TeamRecord | undefined {
  if (teamId) {
    return db.teams.find((team) => team.id === teamId && team.memberIds.includes(playerId));
  }
  return db.teams.find((team) => team.memberIds.includes(playerId));
}

async function startServer() {
  await ensureDb();

  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.add(res);
    res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

    const keepAlive = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        clearInterval(keepAlive);
        sseClients.delete(res);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

  app.get('/api/state', async (req, res) => {
    const db = await ensureDb();
    const isAdmin = await isAdminRequestAsync(req);
    res.json(buildPublicState(db, isAdmin, getPlayerId(req)));
  });

  app.get('/api/session', async (req, res) => {
    const playerId = getPlayerId(req);
    const teamId = typeof req.query.teamId === 'string' ? req.query.teamId : '';
    const caseId = typeof req.query.caseId === 'string' ? req.query.caseId : '';
    if (!playerId || !teamId || !caseId) {
      res.status(400).json({ error: 'Missing player, team, or case identifier.' });
      return;
    }

    const db = await ensureDb();
    const team = findTeamForPlayer(db, playerId, teamId);
    if (!team) {
      res.status(403).json({ error: 'You are not a member of this team.' });
      return;
    }

    const session = db.sessions.find((entry) => entry.teamId === teamId && entry.caseId === caseId);
    if (!session) {
      res.json({ session: null });
      return;
    }

    res.json({
      session: {
        ...session,
        elapsedSeconds: Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000)),
      },
    });
  });

  app.post('/api/arena', async (req, res) => {
    const playerId = getPlayerId(req);
    const { action, ...payload } = (req.body || {}) as Record<string, unknown>;

    if (typeof action !== 'string') {
      res.status(400).json({ error: 'Missing arena action.' });
      return;
    }

    const db = await ensureDb();

    if (action === 'adminLogin') {
      const passcode = typeof payload.passcode === 'string' ? payload.passcode.trim() : '';
      if (!passcode || passcode !== ADMIN_PASSCODE) {
        res.status(403).json({ error: 'Invalid organizer passcode.' });
        return;
      }
      const token = signLocalAdminToken();
      activeAdminTokens.add(token);
      res.json({ adminToken: token, isAdmin: true });
      return;
    }

    if (!playerId) {
      res.status(401).json({ error: 'Missing player session identifier.' });
      return;
    }

    if (action === 'listMyTeams') {
      const sortedIds = [...db.teams]
        .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
        .map((t) => t.id);
      const teams = db.teams
        .filter((team) => team.memberIds.includes(playerId))
        .map((team) => ({
          ...team,
          slot: typeof team.slot === 'number' ? team.slot : Math.max(0, sortedIds.indexOf(team.id)),
        }));
      res.json({ teams });
      return;
    }

    if (action === 'createTeam') {
      const accessCode = typeof payload.accessCode === 'string' ? payload.accessCode.trim() : '';
      if (!accessCode || accessCode !== REGISTRATION_ACCESS_CODE) {
        res.status(403).json({
          error: 'Invalid access code. Please contact the organizer for the valid access code.',
        });
        return;
      }
      const rawName = typeof payload.name === 'string' ? payload.name.trim() : '';
      if (rawName.length < 2 || rawName.length > 30) {
        res.status(400).json({ error: 'Team name must be between 2 and 30 characters.' });
        return;
      }
      const existingName = db.teams.find(
        (team) => team.name.toLowerCase() === rawName.toLowerCase()
      );
      if (existingName) {
        res.status(409).json({ error: 'A team with that name already exists.' });
        return;
      }

      const existingMembership = db.teams.find((team) => team.memberIds.includes(playerId));
      if (existingMembership) {
        const sortedIds = [...db.teams]
          .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
          .map((t) => t.id);
        res.json({
          ...existingMembership,
          slot:
            typeof existingMembership.slot === 'number'
              ? existingMembership.slot
              : Math.max(0, sortedIds.indexOf(existingMembership.id)),
        });
        return;
      }

      let inviteCode = generateInviteCode(6);
      while (db.teams.some((team) => team.inviteCode === inviteCode)) {
        inviteCode = generateInviteCode(6);
      }

      const assignedSlot =
        typeof db.nextTeamSlot === 'number' ? db.nextTeamSlot : db.teams.length;
      db.nextTeamSlot = assignedSlot + 1;

      const team: TeamRecord = {
        id: `team_${crypto.randomUUID().slice(0, 8)}`,
        name: rawName,
        inviteCode,
        ownerId: playerId,
        memberIds: [playerId],
        createdAt: new Date().toISOString(),
        slot: assignedSlot,
      };

      db.teams.push(team);
      await persistDb(db);
      broadcastEvent('state', buildPublicState(db, false));
      res.json(team);
      return;
    }

    if (action === 'joinTeam') {
      res.status(403).json({
        error: 'Only one player can play per team. Invite codes are disabled.',
      });
      return;
    }

    if (action === 'leaveTeam') {
      const teamId = typeof payload.teamId === 'string' ? payload.teamId : '';
      const team = findTeamForPlayer(db, playerId, teamId || undefined);
      if (!team) {
        res.json({ left: true });
        return;
      }
      team.memberIds = team.memberIds.filter((id) => id !== playerId);
      const ranking = db.rankings.find((entry) => entry.teamId === team.id);
      if (ranking) {
        ranking.memberIds = ranking.memberIds.filter((id) => id !== playerId);
      }
      if (team.memberIds.length === 0) {
        db.teams = db.teams.filter((entry) => entry.id !== team.id);
      }
      await persistDb(db);
      broadcastEvent('state', buildPublicState(db, false));
      res.json({ left: true });
      return;
    }

    if (action === 'beginInvestigation') {
      const caseId = typeof payload.caseId === 'string' ? payload.caseId : '';
      const requestedTeamId = typeof payload.teamId === 'string' ? payload.teamId : null;
      const team = await syncSupabaseTeamForPlayer(
        db,
        req.header('authorization') || '',
        playerId,
        requestedTeamId
      );
      if (!team) {
        res.status(403).json({ error: 'Register a team before starting an investigation.' });
        return;
      }
      if (!caseAnswerKeys[caseId]) {
        res.status(404).json({ error: 'Case file not found.' });
        return;
      }

      const hasLiveGame =
        db.games.length > 0
          ? db.games.some((entry) => entry.status === 'live')
          : payload.isLiveGame !== false;
      const now = Date.now();
      let session = db.sessions.find((entry) => entry.teamId === team.id && entry.caseId === caseId);
      if (!session) {
        session = {
          id: `sess_${crypto.randomUUID().slice(0, 8)}`,
          teamId: team.id,
          caseId,
          startedAt: now,
          accumulatedElapsedSeconds: 0,
          runningSince: hasLiveGame ? now : null,
          hintsUsed: 0,
          lastWriter: playerId,
          progress: {
            report: '',
            selectedEvidence: [],
            timelineOrder: [],
          },
          completed: false,
        };
        db.sessions.push(session);
        await persistDb(db);
      } else if (typeof session.accumulatedElapsedSeconds !== 'number') {
        session.accumulatedElapsedSeconds = Math.max(0, Math.floor((now - session.startedAt) / 1000));
        session.runningSince = hasLiveGame ? now : null;
        await persistDb(db);
      }

      res.json({
        progress: session.progress,
        hintsUsed: session.hintsUsed,
        elapsedSeconds: getSessionElapsedSeconds(session, hasLiveGame),
      });
      return;
    }

    if (action === 'saveInvestigationProgress') {
      const caseId = typeof payload.caseId === 'string' ? payload.caseId : '';
      const requestedTeamId = typeof payload.teamId === 'string' ? payload.teamId : null;
      const team = await syncSupabaseTeamForPlayer(
        db,
        req.header('authorization') || '',
        playerId,
        requestedTeamId
      );
      if (!team) {
        res.status(403).json({ error: 'Team membership required.' });
        return;
      }
      const session = db.sessions.find((entry) => entry.teamId === team.id && entry.caseId === caseId);
      if (!session || session.completed) {
        res.json({ ok: true });
        return;
      }

      const report = typeof payload.report === 'string' ? payload.report.slice(0, 500) : '';
      const selectedEvidence = Array.isArray(payload.selectedEvidence)
        ? payload.selectedEvidence.filter((item): item is number => typeof item === 'number')
        : [];
      const timelineOrder = Array.isArray(payload.timelineOrder)
        ? payload.timelineOrder.filter((item): item is string => typeof item === 'string')
        : [];

      session.progress = {
        report,
        selectedEvidence,
        timelineOrder,
      };
      session.lastWriter = playerId;
      await persistDb(db);
      broadcastEvent('session', { teamId: team.id, caseId, lastWriter: playerId });
      res.json({ ok: true });
      return;
    }

    if (action === 'useInvestigationHint') {
      const caseId = typeof payload.caseId === 'string' ? payload.caseId : '';
      const requestedTeamId = typeof payload.teamId === 'string' ? payload.teamId : null;
      const team = await syncSupabaseTeamForPlayer(
        db,
        req.header('authorization') || '',
        playerId,
        requestedTeamId
      );
      if (!team) {
        res.status(403).json({ error: 'Team membership required.' });
        return;
      }
      const session = db.sessions.find((entry) => entry.teamId === team.id && entry.caseId === caseId);
      if (!session) {
        res.status(404).json({ error: 'Start the investigation before requesting a hint.' });
        return;
      }
      const maxHints = caseAnswerKeys[caseId]?.maxHints ?? 2;
      if (session.hintsUsed < maxHints) {
        session.hintsUsed += 1;
        session.lastWriter = playerId;
        await persistDb(db);
        broadcastEvent('session', { teamId: team.id, caseId, lastWriter: playerId });
      }
      res.json({ hintsUsed: session.hintsUsed });
      return;
    }

    if (action === 'submitInvestigation') {
      const caseId = typeof payload.caseId === 'string' ? payload.caseId : '';
      const requestedTeamId = typeof payload.teamId === 'string' ? payload.teamId : null;
      const team = await syncSupabaseTeamForPlayer(
        db,
        req.header('authorization') || '',
        playerId,
        requestedTeamId
      );
      if (!team) {
        res.status(403).json({ error: 'Register a team before submitting a verdict.' });
        return;
      }

      const answerKey = caseAnswerKeys[caseId];
      if (!answerKey) {
        res.status(404).json({ error: 'Case answer key not found.' });
        return;
      }

      let ranking = db.rankings.find((entry) => entry.teamId === team.id);
      if (ranking && Object.hasOwn(ranking.caseScores, caseId)) {
        const existingResult = ranking.caseScores[caseId];
        const sorted = [...db.rankings].sort(compareRankingRecords);
        const rank = sorted.findIndex((entry) => entry.teamId === team.id) + 1;
        res.json({
          ...existingResult,
          rank,
          message: 'This case was already closed by your team. Returning verified result.',
        });
        return;
      }

      const timelineOrder = Array.isArray(payload.timelineOrder)
        ? payload.timelineOrder.filter((item): item is string => typeof item === 'string')
        : [];
      const reportText = typeof payload.report === 'string' ? payload.report : '';

      const hasLiveGame =
        db.games.length > 0
          ? db.games.some((entry) => entry.status === 'live')
          : payload.isLiveGame !== false;
      const session = db.sessions.find((entry) => entry.teamId === team.id && entry.caseId === caseId);
      const clientHints =
        typeof payload.hintsUsed === 'number' && Number.isFinite(payload.hintsUsed)
          ? Math.max(0, Math.min(answerKey.maxHints ?? 2, Math.round(payload.hintsUsed)))
          : 0;
      const hintsUsed = Math.max(session?.hintsUsed ?? 0, clientHints);
      const clientElapsed =
        typeof payload.elapsedSeconds === 'number' && Number.isFinite(payload.elapsedSeconds)
          ? Math.max(1, Math.min(3600, Math.round(payload.elapsedSeconds)))
          : 60;
      const elapsedSeconds = session
        ? Math.max(1, getSessionElapsedSeconds(session, hasLiveGame))
        : clientElapsed;

      const graded = gradeCaseVerdict(caseId, timelineOrder, reportText, hintsUsed, elapsedSeconds);
      if (!graded) {
        res.status(404).json({ error: 'Case answer key not found.' });
        return;
      }

      const caseResult: CaseScoreRecord = {
        score: graded.score,
        maxScore: graded.maxScore,
        sequenceScore: graded.sequenceScore,
        summaryScore: graded.summaryScore,
        hintsUsed: graded.hintsUsed,
        elapsedSeconds: graded.elapsedSeconds,
        submittedAt: graded.submittedAt,
        timelineMatches: graded.timelineMatches,
        totalTimeline: graded.totalTimeline,
        explanations: graded.explanations,
      };

      if (!ranking) {
        ranking = {
          id: `rank_${team.id}`,
          teamId: team.id,
          teamName: team.name,
          ownerId: team.ownerId,
          memberIds: [...team.memberIds],
          mode: 'Team',
          score: graded.score,
          elapsedSeconds: graded.elapsedSeconds,
          caseScores: { [caseId]: caseResult },
          updatedAt: new Date().toISOString(),
        };
        db.rankings.push(ranking);
      } else {
        ranking.teamName = team.name;
        ranking.caseScores[caseId] = caseResult;
        ranking.score = Object.values(ranking.caseScores).reduce(
          (sum, entry) => sum + entry.score,
          0
        );
        ranking.elapsedSeconds = Object.values(ranking.caseScores).reduce(
          (sum, entry) => sum + entry.elapsedSeconds,
          0
        );
        ranking.memberIds = [...team.memberIds];
        ranking.updatedAt = new Date().toISOString();
      }

      if (session) {
        session.completed = true;
      }

      await persistDb(db);
      broadcastEvent('state', buildPublicState(db, false));

      const sorted = [...db.rankings].sort(compareRankingRecords);
      const rank = sorted.findIndex((entry) => entry.teamId === team.id) + 1;

      res.json({
        ...caseResult,
        rank,
        message: graded.message,
      });
      return;
    }

    if (action === 'syncLocalScores') {
      const requestedTeamId = typeof payload.teamId === 'string' ? payload.teamId : null;
      const team = await syncSupabaseTeamForPlayer(
        db,
        req.header('authorization') || '',
        playerId,
        requestedTeamId
      );
      if (!team) {
        res.status(403).json({ error: 'Register a team before syncing scores.' });
        return;
      }
      const incoming =
        payload.caseScores && typeof payload.caseScores === 'object'
          ? (payload.caseScores as Record<string, Partial<CaseScoreRecord>>)
          : {};

      let ranking = db.rankings.find((entry) => entry.teamId === team.id);
      let changed = false;
      for (const [caseId, item] of Object.entries(incoming)) {
        if (!caseAnswerKeys[caseId] || !item || typeof item !== 'object') continue;
        if (ranking && Object.hasOwn(ranking.caseScores, caseId)) continue;
        const maxScore = maxCaseScoreById(caseId);
        const safeScore =
          typeof item.score === 'number' && Number.isFinite(item.score)
            ? Math.max(0, Math.min(maxScore, Math.round(item.score)))
            : 0;
        const safeElapsed =
          typeof item.elapsedSeconds === 'number' && Number.isFinite(item.elapsedSeconds)
            ? Math.max(1, Math.min(3600, Math.round(item.elapsedSeconds)))
            : 60;
        const caseResult: CaseScoreRecord = {
          score: safeScore,
          maxScore,
          sequenceScore:
            typeof item.sequenceScore === 'number' ? item.sequenceScore : undefined,
          summaryScore:
            typeof item.summaryScore === 'number' ? item.summaryScore : undefined,
          hintsUsed:
            typeof item.hintsUsed === 'number' ? Math.max(0, Math.round(item.hintsUsed)) : 0,
          elapsedSeconds: safeElapsed,
          submittedAt:
            typeof item.submittedAt === 'string' ? item.submittedAt : new Date().toISOString(),
          timelineMatches:
            typeof item.timelineMatches === 'number' ? item.timelineMatches : 0,
          totalTimeline:
            typeof item.totalTimeline === 'number'
              ? item.totalTimeline
              : caseAnswerKeys[caseId].correctTimeline.length,
          explanations: Array.isArray(item.explanations) ? item.explanations : [],
        };
        if (!ranking) {
          ranking = {
            id: `rank_${team.id}`,
            teamId: team.id,
            teamName: team.name,
            ownerId: team.ownerId,
            memberIds: [...team.memberIds],
            mode: 'Team',
            score: 0,
            elapsedSeconds: 0,
            caseScores: {},
            updatedAt: new Date().toISOString(),
          };
          db.rankings.push(ranking);
        }
        ranking.caseScores[caseId] = caseResult;
        changed = true;
      }

      if (changed && ranking) {
        ranking.teamName = team.name;
        ranking.score = Object.values(ranking.caseScores).reduce(
          (sum, entry) => sum + entry.score,
          0
        );
        ranking.elapsedSeconds = Object.values(ranking.caseScores).reduce(
          (sum, entry) => sum + entry.elapsedSeconds,
          0
        );
        ranking.memberIds = [...team.memberIds];
        ranking.updatedAt = new Date().toISOString();
        await persistDb(db);
        broadcastEvent('state', buildPublicState(db, false));
      }

      res.json({ synced: changed });
      return;
    }

    if (action === 'joinGame') {
      const code =
        typeof payload.inviteCode === 'string' ? payload.inviteCode.trim().toUpperCase() : '';
      const game = db.games.find((entry) => entry.inviteCode === code);
      if (!game) {
        res.status(404).json({ error: 'No event lobby matches that invitation code.' });
        return;
      }
      if (game.status === 'ended') {
        res.status(400).json({ error: 'This event lobby has already ended.' });
        return;
      }
      const team = findTeamForPlayer(db, playerId);
      if (team && !game.participantTeamIds.includes(team.id)) {
        game.participantTeamIds.push(team.id);
        game.participantCount = game.participantTeamIds.length;
        await persistDb(db);
        broadcastEvent('state', buildPublicState(db, false));
      }
      res.json(game);
      return;
    }

    if (
      action === 'adminCreateGame' ||
      action === 'adminSetGameStatus' ||
      action === 'adminAnnounce' ||
      action === 'adminListTeams'
    ) {
      if (!isAdminRequest(req)) {
        res.status(403).json({ error: 'Administrator passcode verification required.' });
        return;
      }

      if (action === 'adminCreateGame') {
        const name = typeof payload.name === 'string' ? payload.name.trim() : '';
        const caseId = typeof payload.caseId === 'string' ? payload.caseId : 'case-01';
        const rawCode =
          typeof payload.inviteCode === 'string' ? payload.inviteCode.trim().toUpperCase() : '';
        const inviteCode = rawCode || generateInviteCode(6);
        const durationMinutes = normalizeGameDurationMinutes(payload.durationMinutes, name);

        if (!name) {
          res.status(400).json({ error: 'Event name is required.' });
          return;
        }
        if (!caseAnswerKeys[caseId]) {
          res.status(400).json({ error: 'Selected case does not exist.' });
          return;
        }
        if (db.games.some((game) => game.inviteCode === inviteCode)) {
          res.status(409).json({ error: 'An event with that invitation code already exists.' });
          return;
        }

        const hadOnlyEndedGames =
          db.games.length > 0 && db.games.every((entry) => entry.status === 'ended');

        const game: GameRecord = {
          id: `game_${crypto.randomUUID().slice(0, 8)}`,
          name,
          caseId,
          inviteCode,
          status: 'open',
          durationMinutes,
          participantCount: 0,
          participantTeamIds: [],
          createdAt: new Date().toISOString(),
        };
        db.games.unshift(game);
        if (hadOnlyEndedGames) {
          db.sessions = db.sessions.filter((session) => session.completed);
        }
        await persistDb(db);
        broadcastEvent('state', buildPublicState(db, false));
        res.json(game);
        return;
      }

      if (action === 'adminSetGameStatus') {
        const gameId = typeof payload.gameId === 'string' ? payload.gameId : '';
        const status = payload.status;
        if (
          status !== 'open' &&
          status !== 'live' &&
          status !== 'paused' &&
          status !== 'ended'
        ) {
          res.status(400).json({ error: 'Invalid event status.' });
          return;
        }
        const game = db.games.find((entry) => entry.id === gameId);
        if (!game) {
          res.status(404).json({ error: 'Event not found.' });
          return;
        }
        const wasLive = db.games.some((entry) => entry.status === 'live');
        game.status = status;
        if (typeof payload.name === 'string' && payload.name.trim()) {
          game.name = payload.name.trim();
        }
        if (payload.durationMinutes !== undefined) {
          game.durationMinutes = normalizeGameDurationMinutes(payload.durationMinutes, game.name);
        }
        const isNowLive = db.games.some((entry) => entry.status === 'live');
        const now = Date.now();
        if (wasLive && !isNowLive) {
          for (const session of db.sessions) {
            if (session.completed) continue;
            if (typeof session.accumulatedElapsedSeconds !== 'number') {
              session.accumulatedElapsedSeconds = Math.max(
                0,
                Math.floor((now - session.startedAt) / 1000)
              );
              session.runningSince = null;
            } else if (typeof session.runningSince === 'number') {
              session.accumulatedElapsedSeconds += Math.max(
                0,
                Math.floor((now - session.runningSince) / 1000)
              );
              session.runningSince = null;
            }
          }
        } else if (!wasLive && isNowLive) {
          for (const session of db.sessions) {
            if (session.completed) continue;
            if (typeof session.accumulatedElapsedSeconds !== 'number') {
              session.accumulatedElapsedSeconds = Math.max(
                0,
                Math.floor((now - session.startedAt) / 1000)
              );
            }
            if (session.runningSince === null || session.runningSince === undefined) {
              session.runningSince = now;
            }
          }
        }
        await persistDb(db);
        broadcastEvent('state', buildPublicState(db, false));
        res.json(game);
        return;
      }

      if (action === 'adminAnnounce') {
        const title = typeof payload.title === 'string' ? payload.title.trim() : '';
        const message = typeof payload.message === 'string' ? payload.message.trim() : '';
        if (!title || !message) {
          res.status(400).json({ error: 'Title and message are required.' });
          return;
        }
        const announcement: AnnouncementRecord = {
          id: `ann_${crypto.randomUUID().slice(0, 8)}`,
          title,
          message,
          createdAt: new Date().toISOString(),
        };
        db.announcements.unshift(announcement);
        await persistDb(db);
        broadcastEvent('state', buildPublicState(db, false));
        res.json(announcement);
        return;
      }

      if (action === 'adminListTeams') {
        res.json({
          teams: db.teams.map((team) => ({
            id: team.id,
            name: team.name,
            memberCount: team.memberIds.length,
            createdAt: team.createdAt,
          })),
          rankings: buildAdminFullRankings(db).slice(0, 500),
        });
        return;
      }
    }

    res.status(400).json({ error: `Unknown arena action: ${action}` });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cyber Mystery Arena listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start Cyber Mystery Arena server:', error);
  process.exit(1);
});
