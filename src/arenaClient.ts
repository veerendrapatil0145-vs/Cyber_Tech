export interface TeamInfo {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
}

export interface CaseScore {
  score: number;
  hintsUsed: number;
  elapsedSeconds: number;
  submittedAt: string;
  timelineMatches?: number;
  totalTimeline?: number;
  keyCluesFound?: number;
  totalKeyClues?: number;
  explanations?: Array<{
    title: string;
    correct: boolean;
    explanation: string;
  }>;
  rank?: number;
  message?: string;
}

export interface RankingEntry {
  id: string;
  teamId: string;
  teamName: string;
  ownerId: string;
  memberIds: string[];
  mode: 'Team';
  score: number;
  elapsedSeconds: number;
  caseScores: Record<string, CaseScore>;
  updatedAt: string;
}

export interface GameLobby {
  id: string;
  name: string;
  caseId: string;
  status: 'open' | 'live' | 'paused' | 'ended';
  participantCount: number;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface ArenaStatePayload {
  rankings: RankingEntry[];
  games: GameLobby[];
  announcements: Announcement[];
  stats: { registered_teams: number };
  isAdmin: boolean;
}

export interface InvestigationSession {
  id: string;
  teamId: string;
  caseId: string;
  hintsUsed: number;
  elapsedSeconds: number;
  lastWriter: string;
  completed: boolean;
  progress: {
    report: string;
    selectedEvidence: number[];
    timelineOrder: string[];
  };
}

const PLAYER_KEY = 'arena-player-id';
const ADMIN_TOKEN_KEY = 'arena-admin-token';

export function getOrCreatePlayerId(): string {
  try {
    const existing = localStorage.getItem(PLAYER_KEY);
    if (existing && /^[a-zA-Z0-9_-]{8,80}$/.test(existing)) {
      return existing;
    }
    const generated =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? `plr_${crypto.randomUUID()}`
        : `plr_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem(PLAYER_KEY, generated);
    return generated;
  } catch {
    return `plr_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }
}

export function getStoredAdminToken(): string {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredAdminToken(token: string): void {
  try {
    if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
    else localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // Ignore storage restriction errors.
  }
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-arena-player': getOrCreatePlayerId(),
  };
  const adminToken = getStoredAdminToken();
  if (adminToken) {
    headers['x-arena-admin'] = adminToken;
  }
  return headers;
}

export async function invokeArena<T = Record<string, unknown>>(
  action: string,
  data: Record<string, unknown> = {}
): Promise<T> {
  const response = await fetch('/api/arena', {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ action, ...data }),
  });

  const body = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return body;
}

export async function fetchArenaState(): Promise<ArenaStatePayload> {
  const response = await fetch('/api/state', {
    headers: buildHeaders(),
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string } & ArenaStatePayload;
  if (!response.ok) {
    throw new Error(body.error || 'Unable to load arena state.');
  }
  return body;
}

export async function fetchSession(
  teamId: string,
  caseId: string
): Promise<InvestigationSession | null> {
  const params = new URLSearchParams({ teamId, caseId });
  const response = await fetch(`/api/session?${params.toString()}`, {
    headers: buildHeaders(),
  });
  if (!response.ok) return null;
  const body = (await response.json().catch(() => ({ session: null }))) as {
    session: InvestigationSession | null;
  };
  return body.session;
}

export function subscribeArenaStream(handlers: {
  onState?: (state: ArenaStatePayload) => void;
  onSession?: (payload: { teamId: string; caseId: string; lastWriter: string }) => void;
}): () => void {
  if (typeof EventSource === 'undefined') return () => {};
  const source = new EventSource('/api/stream');

  source.addEventListener('state', (event) => {
    try {
      const parsed = JSON.parse((event as MessageEvent<string>).data) as ArenaStatePayload;
      handlers.onState?.(parsed);
    } catch {
      // Ignore malformed SSE payload.
    }
  });

  source.addEventListener('session', (event) => {
    try {
      const parsed = JSON.parse((event as MessageEvent<string>).data) as {
        teamId: string;
        caseId: string;
        lastWriter: string;
      };
      handlers.onSession?.(parsed);
    } catch {
      // Ignore malformed SSE payload.
    }
  });

  return () => {
    source.close();
  };
}
