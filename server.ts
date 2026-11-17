import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import { caseAnswerKeys } from './server/caseAnswers.ts';

dotenv.config();

interface TeamRecord {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
}

interface CaseScoreRecord {
  score: number;
  hintsUsed: number;
  elapsedSeconds: number;
  submittedAt: string;
  correctCount: number;
  totalQuestions: number;
  explanations: Array<{
    question: string;
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
  difficulty: string;
  score: number;
  elapsedSeconds: number;
  caseScores: Record<string, CaseScoreRecord>;
  updatedAt: string;
}

interface GameRecord {
  id: string;
  name: string;
  caseId: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  inviteCode: string;
  status: 'open' | 'live' | 'paused' | 'ended';
  participantCount: number;
  participantTeamIds: string[];
  createdAt: string;
}

interface AnnouncementRecord {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

interface SessionProgress {
  answers: Record<string, number>;
  report: string;
  selectedEvidence: number[];
  timelineOrder: string[];
}

interface InvestigationSessionRecord {
  id: string;
  teamId: string;
  caseId: string;
  startedAt: number;
  hintsUsed: number;
  lastWriter: string;
  progress: SessionProgress;
  completed: boolean;
}

interface ArenaDatabase {
  teams: TeamRecord[];
  rankings: RankingRecord[];
  games: GameRecord[];
  announcements: AnnouncementRecord[];
  sessions: InvestigationSessionRecord[];
}

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'ARENA-ADMIN-2026';
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'arena.json');

const EMPTY_DB: ArenaDatabase = {
  teams: [],
  rankings: [],
  games: [],
  announcements: [],
  sessions: [],
};

let dbCache: ArenaDatabase | null = null;
let writeQueue: Promise<void> = Promise.resolve();
const activeAdminTokens = new Set<string>();
const sseClients = new Set<Response>();

async function ensureDb(): Promise<ArenaDatabase> {
  if (dbCache) return dbCache;
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ArenaDatabase>;
    dbCache = {
      teams: Array.isArray(parsed.teams) ? parsed.teams : [],
      rankings: Array.isArray(parsed.rankings) ? parsed.rankings : [],
      games: Array.isArray(parsed.games) ? parsed.games : [],
      announcements: Array.isArray(parsed.announcements) ? parsed.announcements : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
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

function isAdminRequest(req: Request): boolean {
  const token = req.header('x-arena-admin')?.trim() || '';
  return Boolean(token && activeAdminTokens.has(token));
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

function buildPublicState(db: ArenaDatabase, isAdmin: boolean) {
  const sortedRankings = [...db.rankings].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.elapsedSeconds - b.elapsedSeconds;
  });
  return {
    rankings: sortedRankings.slice(0, 500),
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

function findTeamForPlayer(db: ArenaDatabase, playerId: string, teamId?: string | null): TeamRecord | undefined {
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
    res.json(buildPublicState(db, isAdminRequest(req)));
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
      const token = crypto.randomBytes(24).toString('hex');
      activeAdminTokens.add(token);
      res.json({ adminToken: token, isAdmin: true });
      return;
    }

    if (!playerId) {
      res.status(401).json({ error: 'Missing player session identifier.' });
      return;
    }

    if (action === 'listMyTeams') {
      const teams = db.teams.filter((team) => team.memberIds.includes(playerId));
      res.json({ teams });
      return;
    }

    if (action === 'createTeam') {
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
        res.json(existingMembership);
        return;
      }

      let inviteCode = generateInviteCode(6);
      while (db.teams.some((team) => team.inviteCode === inviteCode)) {
        inviteCode = generateInviteCode(6);
      }

      const team: TeamRecord = {
        id: `team_${crypto.randomUUID().slice(0, 8)}`,
        name: rawName,
        inviteCode,
        ownerId: playerId,
        memberIds: [playerId],
        createdAt: new Date().toISOString(),
      };

      db.teams.push(team);
      await persistDb(db);
      broadcastEvent('state', buildPublicState(db, false));
      res.json(team);
      return;
    }

    if (action === 'joinTeam') {
      const code = typeof payload.inviteCode === 'string' ? payload.inviteCode.trim().toUpperCase() : '';
      const targetTeam = db.teams.find((team) => team.inviteCode === code);
      if (!targetTeam) {
        res.status(404).json({ error: 'No team found with that invitation code.' });
        return;
      }
      if (!targetTeam.memberIds.includes(playerId)) {
        if (targetTeam.memberIds.length >= 4) {
          res.status(400).json({ error: 'This team already has the maximum 4 members.' });
          return;
        }
        targetTeam.memberIds.push(playerId);
        const ranking = db.rankings.find((entry) => entry.teamId === targetTeam.id);
        if (ranking && !ranking.memberIds.includes(playerId)) {
          ranking.memberIds.push(playerId);
        }
        await persistDb(db);
        broadcastEvent('state', buildPublicState(db, false));
      }
      res.json(targetTeam);
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
      const team = findTeamForPlayer(db, playerId, requestedTeamId);
      if (!team) {
        res.status(403).json({ error: 'Register or join a team before starting an investigation.' });
        return;
      }
      if (!caseAnswerKeys[caseId]) {
        res.status(404).json({ error: 'Case file not found.' });
        return;
      }

      let session = db.sessions.find((entry) => entry.teamId === team.id && entry.caseId === caseId);
      if (!session) {
        session = {
          id: `sess_${crypto.randomUUID().slice(0, 8)}`,
          teamId: team.id,
          caseId,
          startedAt: Date.now(),
          hintsUsed: 0,
          lastWriter: playerId,
          progress: {
            answers: {},
            report: '',
            selectedEvidence: [],
            timelineOrder: [],
          },
          completed: false,
        };
        db.sessions.push(session);
        await persistDb(db);
      }

      res.json({
        progress: session.progress,
        hintsUsed: session.hintsUsed,
        elapsedSeconds: Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000)),
      });
      return;
    }

    if (action === 'saveInvestigationProgress') {
      const caseId = typeof payload.caseId === 'string' ? payload.caseId : '';
      const requestedTeamId = typeof payload.teamId === 'string' ? payload.teamId : null;
      const team = findTeamForPlayer(db, playerId, requestedTeamId);
      if (!team) {
        res.status(403).json({ error: 'Team membership required.' });
        return;
      }
      const session = db.sessions.find((entry) => entry.teamId === team.id && entry.caseId === caseId);
      if (!session || session.completed) {
        res.json({ ok: true });
        return;
      }

      const answersInput =
        payload.answers && typeof payload.answers === 'object'
          ? (payload.answers as Record<string, unknown>)
          : {};
      const cleanAnswers: Record<string, number> = {};
      for (const [key, value] of Object.entries(answersInput)) {
        if (key !== 'report' && typeof value === 'number' && Number.isInteger(value)) {
          cleanAnswers[key] = value;
        }
      }
      const report =
        typeof answersInput.report === 'string' ? answersInput.report.slice(0, 500) : '';
      const selectedEvidence = Array.isArray(payload.selectedEvidence)
        ? payload.selectedEvidence.filter((item): item is number => typeof item === 'number')
        : [];
      const timelineOrder = Array.isArray(payload.timelineOrder)
        ? payload.timelineOrder.filter((item): item is string => typeof item === 'string')
        : [];

      session.progress = {
        answers: cleanAnswers,
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
      const team = findTeamForPlayer(db, playerId, requestedTeamId);
      if (!team) {
        res.status(403).json({ error: 'Team membership required.' });
        return;
      }
      const session = db.sessions.find((entry) => entry.teamId === team.id && entry.caseId === caseId);
      if (!session) {
        res.status(404).json({ error: 'Start the investigation before requesting a hint.' });
        return;
      }
      if (session.hintsUsed < 3) {
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
      const team = findTeamForPlayer(db, playerId, requestedTeamId);
      if (!team) {
        res.status(403).json({ error: 'Register or join a team before submitting a verdict.' });
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
        const sorted = [...db.rankings].sort((a, b) => b.score - a.score);
        const rank = sorted.findIndex((entry) => entry.teamId === team.id) + 1;
        res.json({
          ...existingResult,
          rank,
          message: 'This case was already closed by your team. Returning verified result.',
        });
        return;
      }

      const answersInput =
        payload.answers && typeof payload.answers === 'object'
          ? (payload.answers as Record<string, unknown>)
          : {};
      const selectedEvidence = Array.isArray(payload.selectedEvidence)
        ? payload.selectedEvidence.filter((item): item is number => typeof item === 'number')
        : [];
      const timelineOrder = Array.isArray(payload.timelineOrder)
        ? payload.timelineOrder.filter((item): item is string => typeof item === 'string')
        : [];
      const report = typeof payload.report === 'string' ? payload.report.trim() : '';

      if (answerKey.difficulty === 'Hard' && report.length < 40) {
        res.status(400).json({
          error: 'Hard investigations require an investigation report of at least 40 characters.',
        });
        return;
      }

      const session = db.sessions.find((entry) => entry.teamId === team.id && entry.caseId === caseId);
      const hintsUsed = session?.hintsUsed ?? 0;
      const elapsedSeconds = session
        ? Math.max(1, Math.floor((Date.now() - session.startedAt) / 1000))
        : 60;

      let correctCount = 0;
      const explanations = answerKey.questions.map((questionKey) => {
        const submitted = answersInput[questionKey.questionId];
        const correct = submitted === questionKey.correctIndex;
        if (correct) correctCount += 1;
        return {
          question: questionKey.questionId,
          correct,
          explanation: questionKey.explanation,
        };
      });

      const questionPoints = (correctCount / answerKey.questions.length) * 75;

      let timelineMatches = 0;
      for (let i = 0; i < answerKey.correctTimeline.length; i += 1) {
        if (timelineOrder[i] === answerKey.correctTimeline[i]) {
          timelineMatches += 1;
        }
      }
      const timelinePoints = (timelineMatches / answerKey.correctTimeline.length) * 15;

      const keyHits = answerKey.keyEvidenceIndices.filter((idx) =>
        selectedEvidence.includes(idx)
      ).length;
      const evidencePoints =
        answerKey.keyEvidenceIndices.length > 0
          ? (keyHits / answerKey.keyEvidenceIndices.length) * 10
          : 10;

      const rawScore = Math.round(questionPoints + timelinePoints + evidencePoints - hintsUsed * 5);
      const finalScore = Math.max(0, Math.min(100, rawScore));

      const caseResult: CaseScoreRecord = {
        score: finalScore,
        hintsUsed,
        elapsedSeconds,
        submittedAt: new Date().toISOString(),
        correctCount,
        totalQuestions: answerKey.questions.length,
        explanations,
      };

      if (!ranking) {
        ranking = {
          id: `rank_${team.id}`,
          teamId: team.id,
          teamName: team.name,
          ownerId: team.ownerId,
          memberIds: [...team.memberIds],
          mode: 'Team',
          difficulty: answerKey.difficulty,
          score: finalScore,
          elapsedSeconds,
          caseScores: { [caseId]: caseResult },
          updatedAt: new Date().toISOString(),
        };
        db.rankings.push(ranking);
      } else {
        ranking.caseScores[caseId] = caseResult;
        ranking.score = Object.values(ranking.caseScores).reduce(
          (sum, entry) => sum + entry.score,
          0
        );
        ranking.elapsedSeconds = Object.values(ranking.caseScores).reduce(
          (sum, entry) => sum + entry.elapsedSeconds,
          0
        );
        ranking.difficulty = answerKey.difficulty;
        ranking.memberIds = [...team.memberIds];
        ranking.updatedAt = new Date().toISOString();
      }

      if (session) {
        session.completed = true;
      }

      await persistDb(db);
      broadcastEvent('state', buildPublicState(db, false));

      const sorted = [...db.rankings].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.elapsedSeconds - b.elapsedSeconds;
      });
      const rank = sorted.findIndex((entry) => entry.teamId === team.id) + 1;

      res.json({
        ...caseResult,
        rank,
        message: `Scored ${correctCount}/${answerKey.questions.length} questions, ${timelineMatches}/${answerKey.correctTimeline.length} timeline positions, and ${keyHits}/${answerKey.keyEvidenceIndices.length} key clues.`,
      });
      return;
    }

    if (action === 'joinGame') {
      const code = typeof payload.inviteCode === 'string' ? payload.inviteCode.trim().toUpperCase() : '';
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
        const difficulty =
          payload.difficulty === 'Medium' || payload.difficulty === 'Hard'
            ? payload.difficulty
            : 'Easy';
        const rawCode =
          typeof payload.inviteCode === 'string' ? payload.inviteCode.trim().toUpperCase() : '';
        const inviteCode = rawCode || generateInviteCode(6);

        if (!name) {
          res.status(400).json({ error: 'Event name is required.' });
          return;
        }
        if (db.games.some((game) => game.inviteCode === inviteCode)) {
          res.status(409).json({ error: 'An event with that invitation code already exists.' });
          return;
        }

        const game: GameRecord = {
          id: `game_${crypto.randomUUID().slice(0, 8)}`,
          name,
          caseId,
          difficulty,
          inviteCode,
          status: 'open',
          participantCount: 0,
          participantTeamIds: [],
          createdAt: new Date().toISOString(),
        };
        db.games.unshift(game);
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
        game.status = status;
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
            inviteCode: team.inviteCode,
            memberCount: team.memberIds.length,
            createdAt: team.createdAt,
          })),
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
