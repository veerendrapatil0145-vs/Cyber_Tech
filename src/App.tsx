import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Camera,
  Check,
  CircleHelp,
  ClipboardList,
  Clock3,
  Code2,
  Compass,
  CreditCard,
  Database,
  Eye,
  FileText,
  Fingerprint,
  Flag,
  FolderSearch,
  Globe2,
  HardDrive,
  Headphones,
  KeyRound,
  LayoutDashboard,
  Lightbulb,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Pause,
  Plus,
  QrCode,
  Radio,
  Scale,
  ScanSearch,
  Search,
  Send,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  Square,
  Sun,
  Target,
  Terminal,
  Trophy,
  Users,
  Wifi,
  X,
  Zap,
  ZoomIn,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import heroForensicDeskImg from './assets/images/hero_cybersec_circuit_1795336448818.jpg';
import authCampusArchiveImg from './assets/images/cybersec_light_canvas_1795336276523.jpg';
import caseArchiveBackdropImg from './assets/images/cybersec_soc_backdrop_1795336277843.jpg';
import { getCaseMaxScore, type CaseDifficulty, type InvestigationCase } from './cases';
import { getCachedCases, getCachedCaseById } from './caseCache';
import { gradeCaseVerdictLocally } from './caseAnswerFallback';
import {
  createLocalUser,
  getOrCreateLocalPlayerId,
  isSupabaseInCooldown,
  recordSupabaseFailure,
  resetSupabaseBackoff,
} from './localPlayerAuth';
import { isAdminUser, supabase, supabaseConfigured } from './supabase.js';

const cases = getCachedCases();

type PageName =
  | 'Home'
  | 'Dashboard'
  | 'Play Investigation'
  | 'My History'
  | 'Investigation'
  | 'Admin';

interface TeamInfo {
  id: string;
  name: string;
  slot?: number;
}

interface CaseScore {
  score: number;
  maxScore?: number;
  sequenceScore?: number;
  summaryScore?: number;
  timelineMatches?: number;
  totalTimeline?: number;
  submittedSummary?: string;
  hintsUsed?: number;
  elapsedSeconds?: number;
  submittedAt?: string;
  rank?: number;
  message?: string;
  explanations?: Array<{
    title?: string;
    correct?: boolean;
    explanation: string;
  }>;
}

interface RankingEntry {
  id: string;
  teamId?: string;
  teamName?: string;
  memberIds?: string[];
  ownerId?: string;
  mode?: string;
  score?: number;
  elapsedSeconds?: number;
  caseScores?: Record<string, CaseScore>;
}

interface GameLobby {
  id: string;
  name: string;
  participantCount?: number;
  caseId?: string;
  status?: string;
  durationMinutes?: number;
  createdAt?: string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  createdAt?: string | { toDate?: () => Date };
}

interface AdminTeamSummary {
  id: string;
  name: string;
  memberCount: number;
}

const navigation: Array<{
  label: Exclude<PageName, 'Investigation' | 'Admin'>;
  icon: typeof LayoutDashboard;
}> = [
  { label: 'Home', icon: Compass },
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Play Investigation', icon: FolderSearch },
  { label: 'My History', icon: Archive },
];

function evidenceIconForType(type: string) {
  const upper = type.toUpperCase();
  if (
    upper.includes('CCTV') ||
    upper.includes('PHOTO') ||
    upper.includes('IMAGE') ||
    upper.includes('SCREENSHOT') ||
    upper.includes('LIVESTREAM')
  ) {
    return Camera;
  }
  if (upper.includes('WI-FI') || upper.includes('WIFI') || upper.includes('ROUTER')) return Wifi;
  if (upper.includes('EMAIL')) return Mail;
  if (upper.includes('USB') || upper.includes('METADATA')) return HardDrive;
  if (upper.includes('BANK')) return CreditCard;
  if (upper.includes('AUDIO')) return Headphones;
  if (upper.includes('QR')) return QrCode;
  if (upper.includes('KEY')) return KeyRound;
  if (upper.includes('OSINT')) return Globe2;
  if (upper.includes('CHAT')) return MessageSquare;
  if (
    upper.includes('APP') ||
    upper.includes('WEBSITE') ||
    upper.includes('PORTAL') ||
    upper.includes('ADMIN') ||
    upper.includes('DEVICE') ||
    upper.includes('BROWSER') ||
    upper.includes('SCREEN LOG') ||
    upper.includes('MEDIA')
  ) {
    return Terminal;
  }
  return ClipboardList;
}

const iconByName = {
  scan: Target,
  mail: Mail,
  database: Database,
  fingerprint: Fingerprint,
  shield: Shield,
  code: Code2,
  globe: Globe2,
  footprints: Eye,
  key: KeyRound,
  sun: Sun,
} as const;

const DEFAULT_GAME_DURATION_MINUTES = 30;

function clampGameDurationMinutes(value: unknown, fallback = DEFAULT_GAME_DURATION_MINUTES): number {
  const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(num) || num < 1) return fallback;
  return Math.max(1, Math.min(300, Math.round(num)));
}

function formatGameDurationLabel(minutes: number): string {
  if (minutes === 60) return '60 min (1 hr)';
  if (minutes === 120) return '120 min (2 hrs)';
  if (minutes === 180) return '180 min (3 hrs)';
  if (minutes % 60 === 0 && minutes > 60) {
    return `${minutes} min (${minutes / 60} hrs)`;
  }
  return `${minutes} min`;
}

function parseDurationMinutesFromGame(game?: Pick<GameLobby, 'durationMinutes' | 'name'> | null): number | null {
  if (!game) return null;
  if (typeof game.durationMinutes === 'number' && Number.isFinite(game.durationMinutes) && game.durationMinutes >= 1) {
    return clampGameDurationMinutes(game.durationMinutes);
  }
  const match = typeof game.name === 'string' ? game.name.match(/\((\d+)\s*m\)/i)?.[1] : undefined;
  if (match) {
    return clampGameDurationMinutes(Number(match));
  }
  return null;
}

interface LocalSessionRecord {
  startedAt: number;
  hintsUsed: number;
  completed: boolean;
  progress: {
    report: string;
    selectedEvidence: number[];
    timelineOrder: string[];
  };
}

function isMissingRemoteCaseError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('case file not found') ||
    lower.includes('case answer key not found') ||
    lower.includes('start the investigation first') ||
    lower.includes('sessions') ||
    lower.includes('schema cache') ||
    lower.includes('pgrst205')
  );
}

function stored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

interface GameClockState {
  started: boolean;
  accumulatedSeconds: number;
  runningSince: number | null;
  gameId?: string | null;
  ended?: boolean;
}

const EMPTY_GAME_CLOCK: GameClockState = {
  started: false,
  accumulatedSeconds: 0,
  runningSince: null,
  gameId: null,
  ended: false,
};

function readStoredGameClock(teamId: string): GameClockState {
  const saved = stored<Partial<GameClockState> | null>(`arena-game-clock-${teamId}`, null);
  if (saved && typeof saved.started === 'boolean') {
    return {
      started: saved.started,
      accumulatedSeconds:
        typeof saved.accumulatedSeconds === 'number' && Number.isFinite(saved.accumulatedSeconds)
          ? Math.max(0, saved.accumulatedSeconds)
          : 0,
      runningSince:
        typeof saved.runningSince === 'number' && Number.isFinite(saved.runningSince)
          ? saved.runningSince
          : null,
      gameId: typeof saved.gameId === 'string' ? saved.gameId : null,
      ended: Boolean(saved.ended),
    };
  }
  const legacyStart = stored<number | null>(`arena-game-start-${teamId}`, null);
  if (typeof legacyStart === 'number' && Number.isFinite(legacyStart)) {
    return {
      started: true,
      accumulatedSeconds: Math.max(0, Math.floor((Date.now() - legacyStart) / 1000)),
      runningSince: null,
      gameId: null,
      ended: false,
    };
  }
  return EMPTY_GAME_CLOCK;
}

function computeClockElapsed(clock: GameClockState, now = Date.now()): number {
  if (!clock.started) return 0;
  const activeExtra =
    clock.runningSince !== null ? Math.max(0, Math.floor((now - clock.runningSince) / 1000)) : 0;
  return clock.accumulatedSeconds + activeExtra;
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  if (safe >= 3600) {
    const hrs = Math.floor(safe / 3600);
    const mins = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

const DIFFICULTY_TIERS: CaseDifficulty[] = ['Easy', 'Medium', 'Hard'];

function hashTeamSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function gcdInt(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x || 1;
}

function getCoprimeStrides(length: number): number[] {
  const strides: number[] = [];
  for (let s = 1; s < length; s += 1) {
    if (gcdInt(s, length) === 1) {
      strides.push(s);
    }
  }
  return strides.length ? strides : [1];
}

function permuteTierCases(
  tierCases: InvestigationCase[],
  seed: number,
  tierIndex: number
): InvestigationCase[] {
  const count = tierCases.length;
  if (count <= 1) return tierCases;
  const strides = getCoprimeStrides(count);
  const tierStartOffsets = [0, 3, 7];
  const tierStrideShifts = [1, 1, 2];
  const block = Math.floor(seed / count);
  const start = (seed + (tierStartOffsets[tierIndex] ?? 0)) % count;
  const stride = strides[(block + (tierStrideShifts[tierIndex] ?? 0)) % strides.length];
  const ordered: InvestigationCase[] = [];
  for (let step = 0; step < count; step += 1) {
    ordered.push(tierCases[(start + step * stride) % count]);
  }
  return ordered;
}

function orderCasesForTeam(
  allCases: InvestigationCase[],
  team: TeamInfo | null,
  inProgressCaseId: string | null,
  completedIds: string[]
): InvestigationCase[] {
  const orderedAll: InvestigationCase[] = [];
  DIFFICULTY_TIERS.forEach((tier, tierIndex) => {
    const tierCases = allCases.filter((item) => item.difficulty === tier);
    const seed =
      typeof team?.slot === 'number' && team.slot >= 0
        ? team.slot
        : hashTeamSeed(`${team?.id || 'solo'}:${tier}`);
    const permuted = permuteTierCases(tierCases, seed, tierIndex);
    if (inProgressCaseId && !completedIds.includes(inProgressCaseId)) {
      const pinnedIndex = permuted.findIndex((item) => item.id === inProgressCaseId);
      if (pinnedIndex > 0) {
        const [pinned] = permuted.splice(pinnedIndex, 1);
        permuted.unshift(pinned);
      }
    }
    orderedAll.push(...permuted);
  });
  return orderedAll;
}

function playSignal(muted: boolean, frequency = 620) {
  if (muted || typeof window === 'undefined') return;
  const AudioContextCtor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;
  const audioContext = new AudioContextCtor();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.035, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.13);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.13);
  oscillator.onended = () => {
    void audioContext.close();
  };
}

const mapRanking = (row: Record<string, unknown>): RankingEntry => ({
  ...(row as unknown as RankingEntry),
  teamId: (row.team_id as string) ?? (row.teamId as string),
  teamName: (row.team_name as string) ?? (row.teamName as string),
  memberIds: (row.member_ids as string[]) ?? (row.memberIds as string[]),
  ownerId: (row.owner_id as string) ?? (row.ownerId as string),
  elapsedSeconds: (row.elapsed_seconds as number) ?? (row.elapsedSeconds as number),
  caseScores: (row.case_scores as Record<string, CaseScore>) ?? (row.caseScores as Record<string, CaseScore>),
});

const mapGame = (row: Record<string, unknown>): GameLobby => {
  const name = (row.name as string) ?? (row.title as string) ?? 'Event';
  const rawDuration = (row.duration_minutes as number) ?? (row.durationMinutes as number);
  const parsedFromName = name.match(/\((\d+)\s*m\)/i)?.[1];
  const durationMinutes =
    typeof rawDuration === 'number' && Number.isFinite(rawDuration) && rawDuration >= 1
      ? clampGameDurationMinutes(rawDuration)
      : parsedFromName
      ? clampGameDurationMinutes(Number(parsedFromName))
      : undefined;
  return {
    ...(row as unknown as GameLobby),
    name,
    participantCount: (row.participant_count as number) ?? (row.participantCount as number),
    caseId: (row.case_id as string) ?? (row.caseId as string),
    durationMinutes,
    createdAt: (row.created_at as string) ?? (row.createdAt as string),
  };
};

const mapAnnouncement = (row: Record<string, unknown>): AnnouncementItem => ({
  ...(row as unknown as AnnouncementItem),
  createdAt: (row.created_at as string) ?? (row.createdAt as string),
});

const mapSession = (row: Record<string, unknown>) => ({
  ...row,
  hintsUsed: (row.hints_used as number) ?? (row.hintsUsed as number),
  lastWriter: (row.last_writer as string) ?? (row.lastWriter as string),
  progress: row.progress as
    | {
        report?: string;
        selectedEvidence?: number[];
        timelineOrder?: string[];
      }
    | undefined,
});

function formatAnnouncementDate(createdAt?: string | { toDate?: () => Date }): string {
  if (!createdAt) return 'ARENA NOTICE';
  if (typeof createdAt === 'string') {
    const parsed = new Date(createdAt);
    return Number.isNaN(parsed.getTime()) ? 'ARENA NOTICE' : parsed.toLocaleDateString();
  }
  return createdAt.toDate?.().toLocaleDateString() || 'ARENA NOTICE';
}

type CaseTab = 'Evidence' | 'Suspects';

interface PersistedNavState {
  activeView: PageName;
  selectedCaseId: string | null;
  activeTab: CaseTab;
  difficultyFilter?: CaseDifficulty;
}

interface CachedTeamRecord {
  userId: string;
  team: TeamInfo;
}

interface CachedSharedArenaState {
  games: GameLobby[];
  announcements: AnnouncementItem[];
  registeredCount: number | null;
  leaderboard: RankingEntry[];
}

const NAV_STORAGE_KEY = 'arena-nav-state';
const TEAM_CACHE_STORAGE_KEY = 'arena-team-cache';
const ARENA_SHARED_CACHE_KEY = 'arena-shared-cache';
const SESSION_HYDRATED_KEY = 'arena-session-hydrated';

function readCachedTeamRecord(): CachedTeamRecord | null {
  if (typeof window === 'undefined') return null;
  const cached = stored<CachedTeamRecord | null>(TEAM_CACHE_STORAGE_KEY, null);
  if (cached?.team?.id && cached?.team?.name && typeof cached.userId === 'string') {
    return cached;
  }
  return null;
}

function saveCachedTeamRecord(userId: string, team: TeamInfo | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (team && userId) {
      localStorage.setItem(TEAM_CACHE_STORAGE_KEY, JSON.stringify({ userId, team }));
    } else {
      localStorage.removeItem(TEAM_CACHE_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota errors.
  }
}

function readCachedSharedArenaState(): CachedSharedArenaState {
  if (typeof window === 'undefined') {
    return { games: [], announcements: [], registeredCount: null, leaderboard: [] };
  }
  const cached = stored<Partial<CachedSharedArenaState> | null>(ARENA_SHARED_CACHE_KEY, null);
  return {
    games: Array.isArray(cached?.games) ? cached.games : [],
    announcements: Array.isArray(cached?.announcements) ? cached.announcements : [],
    registeredCount: typeof cached?.registeredCount === 'number' ? cached.registeredCount : null,
    leaderboard: Array.isArray(cached?.leaderboard) ? cached.leaderboard : [],
  };
}

function writeCachedSharedArenaState(next: CachedSharedArenaState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARENA_SHARED_CACHE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors.
  }
}

function parseHashToRoute(rawHash: string): { page: PageName; caseId: string | null } | null {
  const cleaned = rawHash.replace(/^#/, '').split('?')[0].replace(/\/+$/, '') || '';
  if (!cleaned || cleaned === '/') return null;
  const normalized = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  if (normalized === '/home') return { page: 'Home', caseId: null };
  if (normalized === '/dashboard') return { page: 'Dashboard', caseId: null };
  if (normalized === '/lobby' || normalized === '/cases') {
    return { page: 'Play Investigation', caseId: null };
  }
  if (normalized === '/history') return { page: 'My History', caseId: null };
  if (normalized === '/admin' || normalized === '/leaderboard') {
    return { page: 'Admin', caseId: null };
  }
  if (normalized.startsWith('/case/')) {
    const rawId = decodeURIComponent(normalized.slice('/case/'.length)).trim();
    if (rawId && getCachedCaseById(rawId)) {
      return { page: 'Investigation', caseId: rawId };
    }
    return { page: 'Play Investigation', caseId: null };
  }
  return null;
}

function hashForRoute(page: PageName, caseId: string | null): string {
  switch (page) {
    case 'Home':
      return '#/home';
    case 'Dashboard':
      return '#/dashboard';
    case 'Play Investigation':
      return '#/lobby';
    case 'My History':
      return '#/history';
    case 'Admin':
      return '#/admin';
    case 'Investigation':
      return caseId ? `#/case/${encodeURIComponent(caseId)}` : '#/lobby';
  }
}

function persistNavState(next: PersistedNavState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors.
  }
}

function readInitialNavigationSnapshot(hasTeam: boolean) {
  if (typeof window === 'undefined') {
    return {
      page: 'Home' as PageName,
      activeCase: null as InvestigationCase | null,
      caseTab: 'Evidence' as CaseTab,
      difficultyFilter: 'Easy' as CaseDifficulty,
    };
  }
  const saved = stored<PersistedNavState | null>(NAV_STORAGE_KEY, null);
  const hashRoute = parseHashToRoute(window.location.hash);
  const caseTab: CaseTab = saved?.activeTab === 'Suspects' ? 'Suspects' : 'Evidence';
  const difficultyFilter: CaseDifficulty =
    saved?.difficultyFilter === 'Medium' || saved?.difficultyFilter === 'Hard'
      ? saved.difficultyFilter
      : 'Easy';

  if (!hasTeam) {
    return {
      page: 'Home' as PageName,
      activeCase: null as InvestigationCase | null,
      caseTab,
      difficultyFilter,
    };
  }

  const candidatePage: PageName = hashRoute?.page || saved?.activeView || 'Home';
  const candidateCaseId = hashRoute?.page
    ? hashRoute.caseId
    : saved?.selectedCaseId || null;

  if (candidatePage === 'Investigation' && candidateCaseId) {
    const matched = getCachedCaseById(candidateCaseId);
    if (matched) {
      return {
        page: 'Investigation' as PageName,
        activeCase: matched,
        caseTab,
        difficultyFilter: matched.difficulty,
      };
    }
    return {
      page: 'Play Investigation' as PageName,
      activeCase: null as InvestigationCase | null,
      caseTab,
      difficultyFilter,
    };
  }

  return {
    page: (candidatePage === 'Investigation' ? 'Play Investigation' : candidatePage) as PageName,
    activeCase: null as InvestigationCase | null,
    caseTab,
    difficultyFilter,
  };
}

function readInitialCaseHydration(
  initialCase: InvestigationCase | null,
  initialTeam: TeamInfo | null,
  initialLocalRankings: Record<string, Record<string, CaseScore>>,
  initialLeaderboard: RankingEntry[]
) {
  if (!initialCase || !initialTeam || typeof window === 'undefined') {
    return {
      report: '',
      selectedEvidence: [] as number[],
      timelineOrder: [] as string[],
      hintCount: 0,
      elapsed: 0,
      result: null as CaseScore | null,
      sessionReady: false,
    };
  }

  const localSolved =
    initialLocalRankings[initialTeam.id]?.[initialCase.id] ||
    initialLocalRankings.solo?.[initialCase.id];
  const remoteSolved = initialLeaderboard.find(
    (entry) => entry.teamId === initialTeam.id || entry.id === `team_${initialTeam.id}`
  )?.caseScores?.[initialCase.id];
  const solvedScore = localSolved || remoteSolved || null;
  if (solvedScore) {
    return {
      report: '',
      selectedEvidence: [] as number[],
      timelineOrder: [...initialCase.timeline],
      hintCount: 0,
      elapsed: 0,
      result: {
        ...solvedScore,
        message: 'This case is already closed. Your verified result is shown below.',
      } as CaseScore,
      sessionReady: false,
    };
  }

  const savedProgress = stored<{
    caseId?: string;
    report?: string;
    selectedEvidence?: number[];
    timelineOrder?: string[];
    hintCount?: number;
  } | null>('arena-progress', null);
  const resumeLocal = savedProgress?.caseId === initialCase.id ? savedProgress : null;

  const sessions = stored<Record<string, LocalSessionRecord>>('arena-local-sessions', {});
  const sessionKey = `${initialTeam.id}:${initialCase.id}`;
  let localSess = sessions[sessionKey];
  if (!localSess) {
    localSess = {
      startedAt: Date.now(),
      hintsUsed: resumeLocal?.hintCount || 0,
      completed: false,
      progress: {
        report: resumeLocal?.report || '',
        selectedEvidence: resumeLocal?.selectedEvidence || [],
        timelineOrder: resumeLocal?.timelineOrder?.length
          ? resumeLocal.timelineOrder
          : [...initialCase.timeline],
      },
    };
    try {
      sessions[sessionKey] = localSess;
      localStorage.setItem('arena-local-sessions', JSON.stringify(sessions));
    } catch {
      // Ignore storage errors.
    }
  }

  const restoredReport = resumeLocal?.report ?? localSess.progress?.report ?? '';
  const restoredEvidence =
    resumeLocal?.selectedEvidence ?? localSess.progress?.selectedEvidence ?? [];
  const restoredTimeline = resumeLocal?.timelineOrder?.length
    ? resumeLocal.timelineOrder
    : localSess.progress?.timelineOrder?.length
    ? localSess.progress.timelineOrder
    : [...initialCase.timeline];
  const restoredHints = Math.max(resumeLocal?.hintCount || 0, localSess.hintsUsed || 0);
  const restoredElapsed = Math.max(0, Math.floor((Date.now() - localSess.startedAt) / 1000));

  return {
    report: restoredReport,
    selectedEvidence: restoredEvidence,
    timelineOrder: restoredTimeline,
    hintCount: restoredHints,
    elapsed: restoredElapsed,
    result: null as CaseScore | null,
    sessionReady: true,
  };
}

export default function App() {
  const initialTeamCacheRef = useRef<CachedTeamRecord | null>(readCachedTeamRecord());
  const initialSharedCacheRef = useRef<CachedSharedArenaState>(readCachedSharedArenaState());
  const initialLocalRankingsRef = useRef<Record<string, Record<string, CaseScore>>>(
    stored<Record<string, Record<string, CaseScore>>>('arena-local-rankings', {})
  );
  const initialNavRef = useRef(
    readInitialNavigationSnapshot(Boolean(initialTeamCacheRef.current?.team))
  );
  const initialHydrationRef = useRef(
    readInitialCaseHydration(
      initialNavRef.current.activeCase,
      initialTeamCacheRef.current?.team || null,
      initialLocalRankingsRef.current,
      initialSharedCacheRef.current.leaderboard
    )
  );

  const [page, setPage] = useState<PageName>(() => initialNavRef.current.page);
  const [caseTab, setCaseTab] = useState<CaseTab>(() => initialNavRef.current.caseTab);
  const [user, setUser] = useState<User | null>(null);
  const [supabaseAccessToken, setSupabaseAccessToken] = useState<string>('');
  const [adminToken, setAdminToken] = useState<string>(() => stored<string>('arena-admin-token', ''));
  const [admin, setAdmin] = useState<boolean>(() => Boolean(stored<string>('arena-admin-token', '')));
  const [authReady, setAuthReady] = useState(!supabaseConfigured);
  const [useLocalBackend, setUseLocalBackend] = useState(!supabaseConfigured);
  const localBackendRef = useRef(!supabaseConfigured);
  const [activeCase, setActiveCase] = useState<InvestigationCase | null>(
    () => initialNavRef.current.activeCase
  );
  const [report, setReport] = useState(() => initialHydrationRef.current.report);
  const [selectedEvidence, setSelectedEvidence] = useState<number[]>(
    () => initialHydrationRef.current.selectedEvidence
  );
  const [timelineOrder, setTimelineOrder] = useState<string[]>(
    () => initialHydrationRef.current.timelineOrder
  );
  const [hintCount, setHintCount] = useState(() => initialHydrationRef.current.hintCount);
  const [hintBusy, setHintBusy] = useState(false);
  const [sessionReady, setSessionReady] = useState(() => initialHydrationRef.current.sessionReady);
  const [elapsed, setElapsed] = useState(() => initialHydrationRef.current.elapsed);
  const [result, setResult] = useState<CaseScore | null>(() => initialHydrationRef.current.result);
  const [submissionBusy, setSubmissionBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [teamEntryError, setTeamEntryError] = useState('');
  const [teamBusy, setTeamBusy] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<RankingEntry[]>(
    () => initialSharedCacheRef.current.leaderboard
  );
  const [serverRankings, setServerRankings] = useState<RankingEntry[]>([]);
  const [serverMyRank, setServerMyRank] = useState<number | null>(null);
  const [localRankings, setLocalRankings] = useState<Record<string, Record<string, CaseScore>>>(
    () => initialLocalRankingsRef.current
  );
  const [games, setGames] = useState<GameLobby[]>(() => initialSharedCacheRef.current.games);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(
    () => initialSharedCacheRef.current.announcements
  );
  const [registeredCount, setRegisteredCount] = useState<number | null>(
    () => initialSharedCacheRef.current.registeredCount
  );
  const [teamName, setTeamName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(
    () => initialTeamCacheRef.current?.team || null
  );
  const [gameClock, setGameClock] = useState<GameClockState>(EMPTY_GAME_CLOCK);
  const [gameElapsed, setGameElapsed] = useState(0);
  const serverCaseModeRef = useRef(false);
  const caseFallbackRef = useRef(false);
  const syncedLocalTeamsRef = useRef<Set<string>>(new Set());
  const submittingLockRef = useRef(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<CaseDifficulty>(
    () => initialNavRef.current.difficultyFilter
  );
  const [muted, setMuted] = useState<boolean>(() => stored('arena-muted', true));
  const [mobileMenu, setMobileMenu] = useState(false);
  const teamInfoRef = useRef(teamInfo);
  teamInfoRef.current = teamInfo;
  const pageRef = useRef(page);
  pageRef.current = page;
  const activeCaseRef = useRef(activeCase);
  activeCaseRef.current = activeCase;
  const caseTabRef = useRef(caseTab);
  caseTabRef.current = caseTab;
  const difficultyFilterRef = useRef(difficultyFilter);
  difficultyFilterRef.current = difficultyFilter;

  const activateLocalBackend = useCallback(async (): Promise<boolean> => {
    if (localBackendRef.current) return true;
    try {
      const response = await fetch('/api/health');
      if (!response.ok) return false;
      const body = (await response.json().catch(() => null)) as { ok?: boolean } | null;
      if (!body?.ok) return false;
      localBackendRef.current = true;
      setUseLocalBackend(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let active = true;
    let resolvedUser = false;

    const enableLocalFallbackSession = async (fallbackErrorMessage?: string) => {
      const ok = await activateLocalBackend();
      if (!active) return;
      if (ok) {
        resolvedUser = true;
        setUser(createLocalUser(getOrCreateLocalPlayerId()));
        setSupabaseAccessToken('');
        setAdmin(Boolean(stored<string>('arena-admin-token', '')));
        setTeamEntryError('');
        setAuthReady(true);
      } else {
        setAuthReady(true);
        if (fallbackErrorMessage) {
          setTeamEntryError(fallbackErrorMessage);
        }
      }
    };

    if (!supabase) {
      void enableLocalFallbackSession(
        'Supabase is not configured. Add your project URL and publishable key to .env.local.'
      );
      return () => {
        active = false;
      };
    }

    const client = supabase;
    let creatingAnonymousSession = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!resolvedUser && active) {
        void enableLocalFallbackSession();
      }
    }, 2500);

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (!active || localBackendRef.current) return;
      const currentUser = session?.user || null;
      if (currentUser) {
        resolvedUser = true;
        window.clearTimeout(fallbackTimer);
      }
      setUser(currentUser);
      setSupabaseAccessToken(session?.access_token || '');
      setAdmin(isAdminUser(currentUser) || Boolean(stored<string>('arena-admin-token', '')));
      setAuthReady(true);
      if (event === 'INITIAL_SESSION' && !currentUser && !creatingAnonymousSession) {
        creatingAnonymousSession = true;
        window.setTimeout(() => {
          if (!active || localBackendRef.current) return;
          Promise.race([
            client.auth.signInAnonymously(),
            new Promise<{ error: Error }>((resolve) =>
              window.setTimeout(() => resolve({ error: new Error('Anonymous sign-in timed out.') }), 2500)
            ),
          ])
            .then((res) => {
              if (!active || localBackendRef.current) return;
              if (res.error) {
                recordSupabaseFailure(res.error);
                void enableLocalFallbackSession(res.error.message);
              }
            })
            .catch((error: unknown) => {
              if (!active || localBackendRef.current) return;
              recordSupabaseFailure(error);
              void enableLocalFallbackSession(
                error instanceof Error ? error.message : 'Anonymous sign-in failed.'
              );
            });
        }, 0);
      }
    });

    return () => {
      active = false;
      window.clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [activateLocalBackend]);

  const callLocalArena = useCallback(
    async <T = Record<string, unknown>>(
      action: string,
      data: Record<string, unknown> = {},
      playerIdOverride?: string
    ): Promise<T> => {
      const playerId = playerIdOverride || user?.id || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (playerId) {
        headers['x-arena-player'] = playerId;
      }
      if (adminToken) {
        headers['x-arena-admin'] = adminToken;
      }
      if (supabaseAccessToken) {
        headers.Authorization = `Bearer ${supabaseAccessToken}`;
      }
      const response = await fetch('/api/arena', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, ...data }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string } & T;
      if (!response.ok) {
        throw new Error(body.error || `Request failed (${response.status})`);
      }
      return body;
    },
    [user?.id, adminToken, supabaseAccessToken]
  );

  const fetchSharedServerState = useCallback(async () => {
    if (!user) return;
    try {
      const stateHeaders: Record<string, string> = { 'x-arena-player': user.id };
      if (adminToken) {
        stateHeaders['x-arena-admin'] = adminToken;
      }
      if (supabaseAccessToken) {
        stateHeaders.Authorization = `Bearer ${supabaseAccessToken}`;
      }
      if (admin) {
        stateHeaders['x-arena-admin-check'] = '1';
      }
      const response = await fetch('/api/state', { headers: stateHeaders });
      if (!response.ok) return;
      const payload = (await response.json()) as {
        rankings?: Record<string, unknown>[];
        myRank?: number;
      };
      if (Array.isArray(payload.rankings)) {
        setServerRankings(payload.rankings.map(mapRanking));
      }
      if (typeof payload.myRank === 'number' && payload.myRank > 0) {
        setServerMyRank(payload.myRank);
      }
    } catch {
      // Keep existing shared server fallback rankings if offline.
    }
  }, [user, adminToken, supabaseAccessToken, admin]);

  const refreshArenaData = useCallback(
    async (explicit = false) => {
      if (!user) return;
      if (!supabase || useLocalBackend) {
        try {
          const stateHeaders: Record<string, string> = { 'x-arena-player': user.id };
          if (adminToken) stateHeaders['x-arena-admin'] = adminToken;
          const response = await fetch('/api/state', { headers: stateHeaders });
          if (!response.ok) return;
          const payload = (await response.json()) as {
            rankings?: Record<string, unknown>[];
            myRank?: number;
            games?: Record<string, unknown>[];
            announcements?: Record<string, unknown>[];
            stats?: { registered_teams?: number };
            isAdmin?: boolean;
          };
          setLeaderboard((payload.rankings || []).map(mapRanking));
          if (typeof payload.myRank === 'number') {
            setServerMyRank(payload.myRank);
          }
          setGames((payload.games || []).map(mapGame));
          setAnnouncements((payload.announcements || []).map(mapAnnouncement));
          if (typeof payload.stats?.registered_teams === 'number') {
            setRegisteredCount(payload.stats.registered_teams);
          }
          if (typeof payload.isAdmin === 'boolean') {
            if (payload.isAdmin) {
              setAdmin(true);
            } else if (!isAdminUser(user) && adminToken) {
              localStorage.removeItem('arena-admin-token');
              setAdminToken('');
              setAdmin(false);
            }
          }
        } catch {
          // Ignore transient refresh failure.
        }
        return;
      }

      if (isSupabaseInCooldown()) {
        if (explicit) {
          setNotice('Database is cooling down after a rate limit or timeout. Using cached data.');
        }
        return;
      }

      const client = supabase;
      try {
        const teamIdForRank = teamInfo?.id || '';
        const myRankQuery = teamIdForRank
          ? client
              .from('rankings')
              .select('id, team_id, team_name, score, elapsed_seconds, case_scores')
              .eq('team_id', teamIdForRank)
              .maybeSingle()
          : client
              .from('rankings')
              .select('id, team_id, team_name, score, elapsed_seconds, case_scores')
              .contains('member_ids', [user.id])
              .limit(1)
              .maybeSingle();

        const [myRankRes, gamesRes, announcementsRes, statsRes] = await Promise.all([
          myRankQuery,
          client
            .from('games')
            .select('id, name, case_id, status, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
          client
            .from('announcements')
            .select('id, title, message, created_at')
            .order('created_at', { ascending: false })
            .limit(4),
          client.from('stats').select('registered_teams').eq('id', 1).maybeSingle(),
        ]);

        const firstErr = myRankRes.error || gamesRes.error || announcementsRes.error || statsRes.error;
        if (firstErr) {
          recordSupabaseFailure(firstErr);
        } else {
          resetSupabaseBackoff();
        }

        let nextLeaderboard = initialSharedCacheRef.current.leaderboard;
        let nextGames = initialSharedCacheRef.current.games;
        let nextAnnouncements = initialSharedCacheRef.current.announcements;
        let nextRegisteredCount = initialSharedCacheRef.current.registeredCount;

        if (!myRankRes.error && myRankRes.data) {
          const ownEntry = mapRanking(myRankRes.data as Record<string, unknown>);
          setLeaderboard((prev) => {
            const others = prev.filter(
              (entry) => entry.teamId !== ownEntry.teamId && entry.id !== ownEntry.id
            );
            nextLeaderboard = [ownEntry, ...others];
            return nextLeaderboard;
          });
        }
        if (!gamesRes.error) {
          nextGames = (gamesRes.data || []).map(mapGame);
          setGames(nextGames);
        }
        if (!announcementsRes.error) {
          nextAnnouncements = (announcementsRes.data || []).map(mapAnnouncement);
          setAnnouncements(nextAnnouncements);
        }
        if (!statsRes.error && statsRes.data) {
          nextRegisteredCount = statsRes.data.registered_teams ?? 0;
          setRegisteredCount(nextRegisteredCount);
        }
        if (!firstErr) {
          writeCachedSharedArenaState({
            games: nextGames,
            announcements: nextAnnouncements,
            registeredCount: nextRegisteredCount,
            leaderboard: nextLeaderboard,
          });
          try {
            sessionStorage.setItem(SESSION_HYDRATED_KEY, user.id);
          } catch {
            // Ignore sessionStorage restriction errors.
          }
        }
      } catch (err) {
        recordSupabaseFailure(err);
      }
    },
    [user, useLocalBackend, adminToken, teamInfo?.id]
  );

  const refreshArenaDataRef = useRef(refreshArenaData);
  refreshArenaDataRef.current = refreshArenaData;

  const initialLoadedUserIdRef = useRef<string>('');
  useEffect(() => {
    if (!user) {
      initialLoadedUserIdRef.current = '';
      return undefined;
    }
    if (!supabase || useLocalBackend) {
      void refreshArenaDataRef.current();
      if (typeof EventSource === 'undefined') return undefined;
      const source = new EventSource('/api/stream');
      source.addEventListener('state', (event) => {
        try {
          const payload = JSON.parse((event as MessageEvent<string>).data) as {
            rankings?: Record<string, unknown>[];
            myRank?: number;
            games?: Record<string, unknown>[];
            announcements?: Record<string, unknown>[];
            stats?: { registered_teams?: number };
          };
          if (Array.isArray(payload.rankings)) {
            setLeaderboard(payload.rankings.map(mapRanking));
          }
          if (typeof payload.myRank === 'number') {
            setServerMyRank(payload.myRank);
          }
          setGames((payload.games || []).map(mapGame));
          setAnnouncements((payload.announcements || []).map(mapAnnouncement));
          if (typeof payload.stats?.registered_teams === 'number') {
            setRegisteredCount(payload.stats.registered_teams);
          }
        } catch {
          // Ignore malformed stream events.
        }
      });
      return () => {
        source.close();
      };
    }

    if (initialLoadedUserIdRef.current === user.id) {
      return undefined;
    }
    initialLoadedUserIdRef.current = user.id;

    try {
      const alreadyHydrated = sessionStorage.getItem(SESSION_HYDRATED_KEY) === user.id;
      const hasCachedGames = initialSharedCacheRef.current.games.length > 0;
      if (alreadyHydrated && hasCachedGames) {
        return undefined;
      }
    } catch {
      // Fall through to one-time initial load if sessionStorage is unavailable.
    }

    void refreshArenaDataRef.current();
    return undefined;
  }, [user, useLocalBackend]);

  useEffect(() => {
    if (!user || !teamInfo || !activeCase || page !== 'Investigation') {
      return undefined;
    }
    if (!supabase || useLocalBackend) {
      let active = true;
      const loadLocalSession = async () => {
        try {
          const params = new URLSearchParams({ teamId: teamInfo.id, caseId: activeCase.id });
          const response = await fetch(`/api/session?${params.toString()}`, {
            headers: { 'x-arena-player': user.id },
          });
          if (!response.ok) return;
          const payload = (await response.json()) as {
            session?: Record<string, unknown> | null;
          };
          const session = payload.session && mapSession(payload.session);
          if (!active || !session?.progress || session.lastWriter === user.id) return;
          if (typeof session.progress.report === 'string') {
            setReport(session.progress.report);
          }
          setSelectedEvidence(session.progress.selectedEvidence || []);
          if (session.progress.timelineOrder?.length) {
            setTimelineOrder(session.progress.timelineOrder);
          }
          setHintCount(session.hintsUsed || 0);
        } catch {
          // Ignore transient network errors.
        }
      };

      void loadLocalSession();
      return () => {
        active = false;
      };
    }
    return undefined;
  }, [user, teamInfo, activeCase, page, useLocalBackend]);

  const invoke = useCallback(
    async <T = Record<string, unknown>>(
      name: string,
      data: Record<string, unknown> = {}
    ): Promise<T> => {
      if (!supabase || localBackendRef.current) {
        return callLocalArena<T>(name, data);
      }
      if (isSupabaseInCooldown()) {
        if (await activateLocalBackend()) {
          return callLocalArena<T>(name, data);
        }
        throw new Error('Database is temporarily busy. Please try again in a few seconds.');
      }

      const invokePromise = supabase.functions.invoke('arena', {
        body: {
          action: name,
          ...(adminToken ? { adminToken } : {}),
          ...data,
        },
      });
      const timeoutPromise = new Promise<{
        data: null;
        error: { name: string; message: string; context?: Response };
      }>((resolve) => {
        window.setTimeout(
          () =>
            resolve({
              data: null,
              error: {
                name: 'FunctionsFetchError',
                message: 'Failed to send a request to the Edge Function (timed out)',
              },
            }),
          3500
        );
      });

      const { data: response, error } = await Promise.race([invokePromise, timeoutPromise]);
      if (error) {
        const errorContext = (error as { context?: Response }).context;
        let parsedBody: { error?: string; code?: string; message?: string } | null = null;
        if (errorContext) {
          try {
            parsedBody = (await errorContext.clone().json()) as {
              error?: string;
              code?: string;
              message?: string;
            };
          } catch {
            parsedBody = null;
          }
        }
        const detailMessage = parsedBody?.error || parsedBody?.message || error.message || '';
        const edgeUnavailable =
          !errorContext ||
          error.name === 'FunctionsFetchError' ||
          error.message.includes('Failed to send a request to the Edge Function') ||
          (errorContext.status === 404 && !parsedBody?.error) ||
          errorContext.status === 429 ||
          errorContext.status >= 500 ||
          parsedBody?.code === 'NOT_FOUND' ||
          detailMessage.includes("Could not find the table 'public.teams'");

        if (edgeUnavailable || errorContext?.status === 429) {
          recordSupabaseFailure(detailMessage || error.message);
        }
        if (edgeUnavailable && (await activateLocalBackend())) {
          return callLocalArena<T>(name, data);
        }
        throw new Error(detailMessage);
      }
      resetSupabaseBackoff();
      return response as T;
    },
    [activateLocalBackend, callLocalArena, adminToken]
  );

  const invokeRef = useRef(invoke);
  invokeRef.current = invoke;

  const unlockAdmin = async (passcode: string) => {
    try {
      const data = await invoke<{ adminToken: string; isAdmin: boolean }>('adminLogin', {
        passcode,
      });
      if (data.adminToken) {
        localStorage.setItem('arena-admin-token', JSON.stringify(data.adminToken));
        setAdminToken(data.adminToken);
      }
      setAdmin(true);
      setNotice('Admin console unlocked.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Invalid organizer passcode.';
      if (msg === 'Administrator access required.') {
        throw new Error(
          'Your deployed Supabase "arena" Edge Function is outdated. Redeploy supabase/functions/arena/index.ts to enable passcode login.'
        );
      }
      throw error;
    }
  };

  const lockAdmin = () => {
    localStorage.removeItem('arena-admin-token');
    setAdminToken('');
    setAdmin(isAdminUser(user));
    setServerRankings((prev) =>
      prev.filter(
        (entry) =>
          entry.teamId === teamInfo?.id ||
          (user?.id ? entry.ownerId === user.id || entry.memberIds?.includes(user.id) : false)
      )
    );
    setNotice('Admin console locked.');
  };

  const currentUserId = user?.id || '';
  useEffect(() => {
    if (!currentUserId) {
      setTeamLoading(false);
      return undefined;
    }
    const cachedRecord = readCachedTeamRecord();
    if (cachedRecord && cachedRecord.userId === currentUserId) {
      setTeamInfo(cachedRecord.team);
      setTeamLoading(false);
      return undefined;
    }
    let active = true;
    setTeamLoading(!cachedRecord);
    setTeamEntryError('');
    invokeRef
      .current<{ teams?: TeamInfo[] }>('listMyTeams')
      .then((data) => {
        if (!active) return;
        const foundTeam = data?.teams?.[0] || null;
        if (foundTeam) {
          saveCachedTeamRecord(currentUserId, foundTeam);
          setTeamInfo(foundTeam);
          const restoredNav = readInitialNavigationSnapshot(true);
          if (restoredNav.activeCase) {
            const hydrated = readInitialCaseHydration(
              restoredNav.activeCase,
              foundTeam,
              localRankings,
              leaderboard
            );
            setCaseTab(restoredNav.caseTab);
            setDifficultyFilter(restoredNav.difficultyFilter);
            setActiveCase(restoredNav.activeCase);
            setPage('Investigation');
            setReport(hydrated.report);
            setSelectedEvidence(hydrated.selectedEvidence);
            setTimelineOrder(hydrated.timelineOrder);
            setHintCount(hydrated.hintCount);
            setElapsed(hydrated.elapsed);
            setResult(hydrated.result);
            setSessionReady(hydrated.sessionReady);
          } else if (restoredNav.page !== 'Home') {
            setCaseTab(restoredNav.caseTab);
            setDifficultyFilter(restoredNav.difficultyFilter);
            setPage(restoredNav.page);
          }
        } else {
          saveCachedTeamRecord(currentUserId, null);
          setTeamInfo(null);
        }
      })
      .catch((error: unknown) => {
        if (active && !cachedRecord) {
          setTeamEntryError(error instanceof Error ? error.message : 'Unable to load team.');
        }
      })
      .finally(() => {
        if (active) setTeamLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!teamInfo) {
      setGameClock(EMPTY_GAME_CLOCK);
      setGameElapsed(0);
      return undefined;
    }
    const initial = readStoredGameClock(teamInfo.id);
    setGameClock(initial);
    setGameElapsed(computeClockElapsed(initial));
    return undefined;
  }, [teamInfo]);

  const activeLiveGame = games.find((game) => game.status === 'live') || null;
  const hasLiveEvent = Boolean(activeLiveGame);
  const isGamePaused = !hasLiveEvent && games.some((game) => game.status === 'paused');
  const isGameEnded =
    !hasLiveEvent &&
    !isGamePaused &&
    games.length > 0 &&
    games.every((game) => game.status === 'ended');

  const clearIncompleteLocalTimers = useCallback((teamId?: string | null) => {
    if (teamId) {
      localStorage.removeItem(`arena-game-start-${teamId}`);
      localStorage.removeItem(`arena-game-clock-${teamId}`);
      const sessions = stored<Record<string, LocalSessionRecord>>('arena-local-sessions', {});
      let changed = false;
      for (const [key, sess] of Object.entries(sessions)) {
        if (key.startsWith(`${teamId}:`) && !sess.completed) {
          delete sessions[key];
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem('arena-local-sessions', JSON.stringify(sessions));
      }
    }
    localStorage.removeItem('arena-progress');
    setElapsed(0);
    setGameClock(EMPTY_GAME_CLOCK);
    setGameElapsed(0);
  }, []);

  useEffect(() => {
    if (!teamInfo) {
      return undefined;
    }

    if (isGameEnded) {
      if (!gameClock.started) {
        setGameElapsed(0);
        return undefined;
      }
      if (gameClock.runningSince !== null || !gameClock.ended) {
        const frozen: GameClockState = {
          started: true,
          accumulatedSeconds: computeClockElapsed(gameClock),
          runningSince: null,
          gameId: gameClock.gameId ?? null,
          ended: true,
        };
        localStorage.setItem(`arena-game-clock-${teamInfo.id}`, JSON.stringify(frozen));
        setGameClock(frozen);
        setGameElapsed(frozen.accumulatedSeconds);
        return undefined;
      }
      setGameElapsed(gameClock.accumulatedSeconds);
      return undefined;
    }

    const isDifferentLiveGame = Boolean(
      activeLiveGame && gameClock.gameId && activeLiveGame.id !== gameClock.gameId
    );
    if (gameClock.ended || isDifferentLiveGame) {
      clearIncompleteLocalTimers(teamInfo.id);
      return undefined;
    }

    if (!gameClock.started) {
      if (
        hasLiveEvent &&
        activeLiveGame &&
        page === 'Investigation' &&
        activeCase &&
        !result
      ) {
        const freshClock: GameClockState = {
          started: true,
          accumulatedSeconds: 0,
          runningSince: Date.now(),
          gameId: activeLiveGame.id,
          ended: false,
        };
        localStorage.setItem(`arena-game-clock-${teamInfo.id}`, JSON.stringify(freshClock));
        setGameClock(freshClock);
        setGameElapsed(0);
        setElapsed(0);
        return undefined;
      }
      setGameElapsed(0);
      return undefined;
    }

    if (!hasLiveEvent) {
      if (gameClock.runningSince !== null) {
        const frozen: GameClockState = {
          started: true,
          accumulatedSeconds: computeClockElapsed(gameClock),
          runningSince: null,
          gameId: gameClock.gameId ?? null,
          ended: false,
        };
        localStorage.setItem(`arena-game-clock-${teamInfo.id}`, JSON.stringify(frozen));
        setGameClock(frozen);
        setGameElapsed(frozen.accumulatedSeconds);
        return undefined;
      }
      setGameElapsed(gameClock.accumulatedSeconds);
      return undefined;
    }

    if (gameClock.runningSince === null || (!gameClock.gameId && activeLiveGame)) {
      const resumed: GameClockState = {
        started: true,
        accumulatedSeconds: gameClock.accumulatedSeconds,
        runningSince: gameClock.runningSince ?? Date.now(),
        gameId: activeLiveGame?.id ?? gameClock.gameId ?? null,
        ended: false,
      };
      localStorage.setItem(`arena-game-clock-${teamInfo.id}`, JSON.stringify(resumed));
      setGameClock(resumed);
      setGameElapsed(computeClockElapsed(resumed));
      return undefined;
    }

    setGameElapsed(computeClockElapsed(gameClock));
    const ticker = window.setInterval(() => {
      setGameElapsed(computeClockElapsed(gameClock));
    }, 1000);
    return () => window.clearInterval(ticker);
  }, [
    gameClock,
    hasLiveEvent,
    isGameEnded,
    activeLiveGame,
    teamInfo,
    page,
    activeCase,
    result,
    clearIncompleteLocalTimers,
  ]);

  useEffect(() => {
    if (!activeCase) return undefined;
    const progress = {
      caseId: activeCase.id,
      report,
      selectedEvidence,
      timelineOrder,
      hintCount,
    };
    localStorage.setItem('arena-progress', JSON.stringify(progress));
    if (teamInfo) {
      const sessions = stored<Record<string, LocalSessionRecord>>('arena-local-sessions', {});
      const key = `${teamInfo.id}:${activeCase.id}`;
      const existing = sessions[key];
      if (existing && !existing.completed) {
        sessions[key] = {
          ...existing,
          hintsUsed: hintCount,
          progress: { report, selectedEvidence, timelineOrder },
        };
        localStorage.setItem('arena-local-sessions', JSON.stringify(sessions));
      }
    }
    return undefined;
  }, [activeCase, report, selectedEvidence, timelineOrder, hintCount, teamInfo]);

  useEffect(() => {
    if (!user || !teamInfo || !supabaseAccessToken || useLocalBackend || isSupabaseInCooldown()) return;
    const mergedLocalForTeam = {
      ...(localRankings.solo || {}),
      ...(localRankings[teamInfo.id] || {}),
    };
    const remoteCaseScores =
      leaderboard.find((entry) => entry.teamId === teamInfo.id || entry.id === `team_${teamInfo.id}`)
        ?.caseScores || {};
    const pendingCompactScores: Record<string, CaseScore> = {};
    for (const [cId, scoreItem] of Object.entries(mergedLocalForTeam)) {
      if (Object.hasOwn(remoteCaseScores, cId)) continue;
      pendingCompactScores[cId] = {
        score: scoreItem.score,
        maxScore: scoreItem.maxScore,
        sequenceScore: scoreItem.sequenceScore,
        summaryScore: scoreItem.summaryScore,
        timelineMatches: scoreItem.timelineMatches,
        totalTimeline: scoreItem.totalTimeline,
        hintsUsed: scoreItem.hintsUsed,
        elapsedSeconds: scoreItem.elapsedSeconds,
        submittedAt: scoreItem.submittedAt,
      };
    }
    const pendingKeys = Object.keys(pendingCompactScores).sort();
    if (pendingKeys.length === 0) return;

    const syncKey = `${teamInfo.id}:${pendingKeys.join(',')}`;
    if (syncedLocalTeamsRef.current.has(syncKey)) return;
    syncedLocalTeamsRef.current.add(syncKey);

    invoke<{ synced?: boolean }>('syncLocalScores', {
      teamId: teamInfo.id,
      caseScores: pendingCompactScores,
    })
      .then((res) => {
        if (res?.synced) {
          void refreshArenaData();
        }
      })
      .catch(() => {
        syncedLocalTeamsRef.current.delete(syncKey);
      });
  }, [user, teamInfo, supabaseAccessToken, useLocalBackend, localRankings, leaderboard, invoke, refreshArenaData]);

  useEffect(() => {
    if (!activeCase || result || !hasLiveEvent) return undefined;
    const ticker = window.setInterval(() => setElapsed((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(ticker);
  }, [activeCase, result, hasLiveEvent]);

  useEffect(() => {
    delete document.documentElement.dataset.theme;
    localStorage.removeItem('arena-theme');
  }, []);

  useEffect(() => {
    localStorage.setItem('arena-muted', JSON.stringify(muted));
  }, [muted]);

  const effectiveLeaderboard = useMemo(() => {
    const merged: RankingEntry[] = [];
    const findExistingTarget = (incoming: RankingEntry) =>
      merged.find(
        (entry) =>
          (incoming.teamId && (entry.teamId === incoming.teamId || entry.id === `local_${incoming.teamId}` || entry.id === `team_${incoming.teamId}`)) ||
          (incoming.teamName &&
            entry.teamName &&
            entry.teamName.trim().toLowerCase() === incoming.teamName.trim().toLowerCase()) ||
          entry.id === incoming.id
      );

    const mergeEntry = (entry: RankingEntry) => {
      const target = findExistingTarget(entry);
      if (!target) {
        merged.push({
          ...entry,
          mode: entry.mode || 'Team',
          caseScores: { ...(entry.caseScores || {}) },
        });
        return;
      }
      target.teamName = target.teamName || entry.teamName;
      target.teamId = target.teamId || entry.teamId;
      target.ownerId = target.ownerId || entry.ownerId;
      target.memberIds = [...new Set([...(target.memberIds || []), ...(entry.memberIds || [])])];
      target.caseScores = {
        ...(entry.caseScores || {}),
        ...(target.caseScores || {}),
      };
      const values = Object.values(target.caseScores || {});
      if (values.length > 0) {
        target.score = values.reduce((sum, item) => sum + (item.score || 0), 0);
        target.elapsedSeconds = values.reduce((sum, item) => sum + (item.elapsedSeconds || 0), 0);
      } else if ((entry.score || 0) > (target.score || 0)) {
        target.score = entry.score;
        target.elapsedSeconds = entry.elapsedSeconds;
      }
    };

    for (const entry of leaderboard) mergeEntry(entry);
    for (const entry of serverRankings) mergeEntry(entry);

    for (const [tId, extraScores] of Object.entries(localRankings)) {
      let target = merged.find(
        (entry) =>
          entry.teamId === tId ||
          entry.id === `local_${tId}` ||
          entry.id === `team_${tId}` ||
          (teamInfo && tId === teamInfo.id && user?.id && entry.memberIds?.includes(user.id))
      );
      if (!target && teamInfo && teamInfo.id === tId) {
        target = {
          id: `local_${tId}`,
          teamId: tId,
          teamName: teamInfo.name,
          memberIds: user?.id ? [user.id] : [],
          ownerId: user?.id,
          mode: 'Team',
          score: 0,
          elapsedSeconds: 0,
          caseScores: {},
        };
        merged.push(target);
      }
      if (target) {
        for (const [cId, cScore] of Object.entries(extraScores)) {
          if (!Object.hasOwn(target.caseScores || {}, cId)) {
            target.caseScores![cId] = cScore;
          } else {
            target.caseScores![cId] = {
              ...cScore,
              ...target.caseScores![cId],
              explanations: target.caseScores![cId].explanations ?? cScore.explanations,
              submittedSummary: target.caseScores![cId].submittedSummary ?? cScore.submittedSummary,
            };
          }
        }
        const values = Object.values(target.caseScores || {});
        target.score = values.reduce((sum, item) => sum + (item.score || 0), 0);
        target.elapsedSeconds = values.reduce((sum, item) => sum + (item.elapsedSeconds || 0), 0);
      }
    }
    return merged.sort((a, b) => {
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      const aCases = Object.keys(a.caseScores || {}).length;
      const bCases = Object.keys(b.caseScores || {}).length;
      if (bCases !== aCases) return bCases - aCases;
      if (aCases > 0 && bCases > 0 && (a.elapsedSeconds || 0) !== (b.elapsedSeconds || 0)) {
        return (a.elapsedSeconds || 0) - (b.elapsedSeconds || 0);
      }
      return (a.teamName || '').localeCompare(b.teamName || '');
    });
  }, [leaderboard, serverRankings, localRankings, teamInfo, user?.id]);

  const completed = useMemo(() => {
    const localCompleted = stored<string[]>('arena-completed', []);
    const teamRanking = effectiveLeaderboard.find(
      (score) =>
        score.teamId === teamInfo?.id ||
        score.id === `local_${teamInfo?.id}` ||
        (user?.id ? score.ownerId === user.id || score.memberIds?.includes(user.id) : false)
    );
    const serverClosed = teamRanking ? Object.keys(teamRanking.caseScores || {}) : [];
    const localTeamClosed = teamInfo ? Object.keys(localRankings[teamInfo.id] || {}) : [];
    return [...new Set([...localCompleted, ...serverClosed, ...localTeamClosed])];
  }, [effectiveLeaderboard, localRankings, teamInfo, user, result]);

  const myTeamEntry = useMemo(
    () =>
      effectiveLeaderboard.find(
        (score) =>
          score.teamId === teamInfo?.id ||
          score.id === `local_${teamInfo?.id}` ||
          (user?.id ? score.ownerId === user.id || score.memberIds?.includes(user.id) : false)
      ) || null,
    [effectiveLeaderboard, teamInfo?.id, user?.id]
  );

  const fallbackTeamRankIndex = useMemo(() => {
    const teamList = effectiveLeaderboard.filter((score) => !score.mode || score.mode === 'Team');
    return teamList.findIndex(
      (score) =>
        score.teamId === teamInfo?.id ||
        score.id === `local_${teamInfo?.id}` ||
        (user?.id ? score.ownerId === user.id || score.memberIds?.includes(user.id) : false)
    );
  }, [effectiveLeaderboard, teamInfo?.id, user?.id]);

  const myRank =
    typeof serverMyRank === 'number' && serverMyRank > 0
      ? serverMyRank
      : fallbackTeamRankIndex >= 0
      ? fallbackTeamRankIndex + 1
      : 0;
  const teamScore = myTeamEntry?.score ?? 0;

  const orderedCases = useMemo(() => {
    const savedProgress = stored<{ caseId?: string } | null>('arena-progress', null);
    const pinnedCaseId = activeCase?.id || savedProgress?.caseId || null;
    return orderCasesForTeam(cases, teamInfo, pinnedCaseId, completed);
  }, [teamInfo, activeCase?.id, completed]);

  const activeOrLatestGame = useMemo(
    () =>
      games.find((game) => game.status === 'live') ||
      games.find((game) => game.status === 'paused') ||
      games[0] ||
      null,
    [games]
  );
  const configuredGameMinutes =
    parseDurationMinutesFromGame(activeOrLatestGame) ?? DEFAULT_GAME_DURATION_MINUTES;
  const totalGameDurationSeconds = configuredGameMinutes * 60;

  const gameSecondsRemaining = gameClock.started
    ? Math.max(0, totalGameDurationSeconds - gameElapsed)
    : totalGameDurationSeconds;
  const gameTimer = formatClock(gameSecondsRemaining);



  const ensureLocalSession = useCallback(
    (caseId: string): LocalSessionRecord => {
      const teamKey = teamInfo?.id || 'solo';
      const sessions = stored<Record<string, LocalSessionRecord>>('arena-local-sessions', {});
      const sessionKey = `${teamKey}:${caseId}`;
      if (!sessions[sessionKey]) {
        sessions[sessionKey] = {
          startedAt: Date.now(),
          hintsUsed: 0,
          completed: false,
          progress: { report: '', selectedEvidence: [], timelineOrder: [] },
        };
        localStorage.setItem('arena-local-sessions', JSON.stringify(sessions));
      }
      return sessions[sessionKey];
    },
    [teamInfo?.id]
  );

  const handleCaseTabChange = useCallback(
    (nextTab: CaseTab) => {
      setCaseTab(nextTab);
      if (teamInfoRef.current) {
        persistNavState({
          activeView: pageRef.current,
          selectedCaseId:
            pageRef.current === 'Investigation' ? activeCaseRef.current?.id || null : null,
          activeTab: nextTab,
          difficultyFilter: difficultyFilterRef.current,
        });
      }
    },
    []
  );

  const applyLocalCaseRestoration = useCallback(
    (gameCase: InvestigationCase) => {
      const currentTeam = teamInfoRef.current;
      if (!currentTeam) return;

      const previousScore = effectiveLeaderboard.find(
        (score) =>
          Object.hasOwn(score.caseScores || {}, gameCase.id) &&
          (score.teamId === currentTeam.id ||
            score.id === `local_${currentTeam.id}` ||
            (user?.id ? score.memberIds?.includes(user.id) : false))
      );

      setActiveCase(gameCase);
      setPage('Investigation');
      setDifficultyFilter(gameCase.difficulty);
      setMobileMenu(false);
      setNotice('');
      persistNavState({
        activeView: 'Investigation',
        selectedCaseId: gameCase.id,
        activeTab: caseTabRef.current,
        difficultyFilter: gameCase.difficulty,
      });

      if (previousScore) {
        setResult({
          ...(previousScore.caseScores?.[gameCase.id] || { score: 0 }),
          message: 'This case is already closed. Your verified result is shown below.',
        });
        setSessionReady(false);
        return;
      }

      const hydrated = readInitialCaseHydration(
        gameCase,
        currentTeam,
        localRankings,
        effectiveLeaderboard
      );
      setReport(hydrated.report);
      setSelectedEvidence(hydrated.selectedEvidence);
      setTimelineOrder(hydrated.timelineOrder);
      setHintCount(hydrated.hintCount);
      setElapsed(hydrated.elapsed);
      setResult(hydrated.result);
      setSessionReady(hydrated.sessionReady);
    },
    [effectiveLeaderboard, localRankings, user?.id]
  );

  const applyLocalCaseRestorationRef = useRef(applyLocalCaseRestoration);
  applyLocalCaseRestorationRef.current = applyLocalCaseRestoration;

  // Initialize browser history stack with a root guard so Back never logs out or leaves the site for registered teams.
  useEffect(() => {
    if (!teamInfo) return undefined;
    const currentState = window.history.state as { arenaManaged?: boolean } | null;
    if (currentState?.arenaManaged) return undefined;

    const currentPage = pageRef.current;
    const currentCaseId = activeCaseRef.current?.id || null;
    const currentHash = hashForRoute(currentPage, currentCaseId);

    if (currentPage === 'Investigation' && currentCaseId) {
      window.history.replaceState(
        { arenaManaged: true, arenaRootGuard: true, page: 'Play Investigation', caseId: null },
        '',
        '#/lobby'
      );
      window.history.pushState(
        { arenaManaged: true, page: 'Play Investigation', caseId: null },
        '',
        '#/lobby'
      );
      window.history.pushState(
        { arenaManaged: true, page: 'Investigation', caseId: currentCaseId },
        '',
        currentHash
      );
    } else {
      const guardPage: PageName =
        currentPage === 'Investigation' ? 'Play Investigation' : currentPage;
      const guardHash = hashForRoute(guardPage, null);
      window.history.replaceState(
        { arenaManaged: true, arenaRootGuard: true, page: guardPage, caseId: null },
        '',
        guardHash
      );
      window.history.pushState(
        { arenaManaged: true, page: guardPage, caseId: null },
        '',
        guardHash
      );
    }
    return undefined;
  }, [teamInfo]);

  // Sync Chrome Back / Forward buttons cleanly between in-app routes with zero extra DB reads.
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (!teamInfoRef.current) return;
      const state = event.state as {
        arenaManaged?: boolean;
        arenaRootGuard?: boolean;
        page?: PageName;
        caseId?: string | null;
      } | null;

      if (state?.arenaRootGuard) {
        const stayPage: PageName =
          pageRef.current === 'Play Investigation' || state.page === 'Play Investigation'
            ? 'Play Investigation'
            : state.page && state.page !== 'Investigation'
            ? state.page
            : 'Play Investigation';
        const stayHash = hashForRoute(stayPage, null);
        window.history.pushState(
          { arenaManaged: true, page: stayPage, caseId: null },
          '',
          stayHash
        );
        setPage(stayPage);
        setActiveCase(null);
        setResult(null);
        setSessionReady(false);
        setMobileMenu(false);
        persistNavState({
          activeView: stayPage,
          selectedCaseId: null,
          activeTab: caseTabRef.current,
          difficultyFilter: difficultyFilterRef.current,
        });
        setNotice(
          stayPage === 'Play Investigation'
            ? 'You are in the Case Lobby. Use Log out in the sidebar to exit your team session.'
            : 'You are at the start of your Arena session. Use Log out in the sidebar to exit.'
        );
        return;
      }

      const hashRoute = parseHashToRoute(window.location.hash);
      const targetPage: PageName = hashRoute?.page || state?.page || 'Play Investigation';
      const targetCaseId = hashRoute?.page ? hashRoute.caseId : state?.caseId ?? null;

      if (targetPage === 'Investigation' && targetCaseId) {
        const matchedCase = getCachedCaseById(targetCaseId);
        if (matchedCase) {
          applyLocalCaseRestorationRef.current(matchedCase);
          return;
        }
      }

      const resolvedPage: PageName =
        targetPage === 'Investigation' ? 'Play Investigation' : targetPage;
      setPage(resolvedPage);
      setActiveCase(null);
      setResult(null);
      setSessionReady(false);
      setMobileMenu(false);
      setNotice('');
      persistNavState({
        activeView: resolvedPage,
        selectedCaseId: null,
        activeTab: caseTabRef.current,
        difficultyFilter: difficultyFilterRef.current,
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Persist difficulty filter changes in localStorage for reload restoration.
  useEffect(() => {
    if (!teamInfo) return;
    persistNavState({
      activeView: pageRef.current,
      selectedCaseId: pageRef.current === 'Investigation' ? activeCaseRef.current?.id || null : null,
      activeTab: caseTabRef.current,
      difficultyFilter,
    });
  }, [difficultyFilter, teamInfo]);

  // Warn only when closing/reloading an unsolved case that has unsaved draft selections.
  useEffect(() => {
    if (page !== 'Investigation' || !activeCase || result || submissionBusy) {
      return undefined;
    }
    const timelineModified =
      timelineOrder.length === activeCase.timeline.length &&
      timelineOrder.some((step, idx) => step !== activeCase.timeline[idx]);
    const hasUnsavedDraft =
      report.trim().length > 0 ||
      selectedEvidence.length > 0 ||
      hintCount > 0 ||
      timelineModified;
    if (!hasUnsavedDraft) {
      return undefined;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [page, activeCase, result, submissionBusy, report, selectedEvidence, hintCount, timelineOrder]);

  const openCase = async (gameCase: InvestigationCase, bypassGateCheck = false) => {
    if (!teamInfo) {
      setNotice('Register a team before starting an investigation.');
      return;
    }
    const nextCaseTab: CaseTab = activeCase?.id === gameCase.id ? caseTab : 'Evidence';
    const targetCaseHash = hashForRoute('Investigation', gameCase.id);
    const pushCaseHistory = () => {
      persistNavState({
        activeView: 'Investigation',
        selectedCaseId: gameCase.id,
        activeTab: nextCaseTab,
        difficultyFilter: gameCase.difficulty,
      });
      if (window.location.hash !== targetCaseHash) {
        window.history.pushState(
          { arenaManaged: true, page: 'Investigation', caseId: gameCase.id },
          '',
          targetCaseHash
        );
      }
    };

    const previousScore = effectiveLeaderboard.find(
      (score) =>
        Object.hasOwn(score.caseScores || {}, gameCase.id) &&
        (score.teamId === teamInfo.id ||
          score.id === `local_${teamInfo.id}` ||
          (user?.id ? score.memberIds?.includes(user.id) : false))
    );
    if (previousScore) {
      scrollPageToTop();
      setCaseTab(nextCaseTab);
      setDifficultyFilter(gameCase.difficulty);
      setActiveCase(gameCase);
      setPage('Investigation');
      setResult({
        ...(previousScore.caseScores?.[gameCase.id] || { score: 0 }),
        message: 'This case is already closed. Your verified result is shown below.',
      });
      setSessionReady(false);
      setNotice('');
      pushCaseHistory();
      return;
    }
    if (!hasLiveEvent && !bypassGateCheck) {
      setNotice(
        isGameEnded
          ? 'This game has ended. Final standings are reviewed by the event administrators.'
          : isGamePaused
          ? 'Game is currently paused by the administrator.'
          : 'Cases are locked until the admin starts the game.'
      );
      return;
    }
    if (gameClock.started && gameSecondsRemaining <= 0) {
      setNotice(`The ${configuredGameMinutes}-minute arena game clock has ended.`);
      return;
    }
    if (!gameClock.started) {
      const nextClock: GameClockState = {
        started: true,
        accumulatedSeconds: 0,
        runningSince: hasLiveEvent ? Date.now() : null,
        gameId: activeLiveGame?.id ?? null,
      };
      localStorage.setItem(`arena-game-clock-${teamInfo.id}`, JSON.stringify(nextClock));
      localStorage.removeItem(`arena-game-start-${teamInfo.id}`);
      setGameClock(nextClock);
      setGameElapsed(0);
    }

    const localProgress = stored<{
      caseId?: string;
      report?: string;
      selectedEvidence?: number[];
      timelineOrder?: string[];
      hintCount?: number;
    } | null>('arena-progress', null);
    const resumeLocal = localProgress?.caseId === gameCase.id ? localProgress : null;
    caseFallbackRef.current = false;
    setCaseTab(nextCaseTab);
    setDifficultyFilter(gameCase.difficulty);
    setActiveCase(gameCase);
    setPage('Investigation');
    setSessionReady(false);
    setReport(resumeLocal?.report || '');
    setSelectedEvidence(resumeLocal?.selectedEvidence || []);
    setTimelineOrder(
      resumeLocal?.timelineOrder?.length ? resumeLocal.timelineOrder : [...gameCase.timeline]
    );
    setHintCount(resumeLocal?.hintCount || 0);
    setElapsed(0);
    setResult(null);
    setNotice('');
    pushCaseHistory();
    playSignal(muted, 540);
    const applySessionResponse = (session: {
      progress?: {
        report?: string;
        selectedEvidence?: number[];
        timelineOrder?: string[];
      };
      hintsUsed?: number;
      elapsedSeconds?: number;
    }) => {
      const remoteProgress = session.progress || {};
      const hasRemote =
        (remoteProgress.selectedEvidence?.length || 0) > 0 ||
        Boolean(remoteProgress.report) ||
        (remoteProgress.timelineOrder?.length || 0) > 0;
      const nextReport = hasRemote ? remoteProgress.report || '' : resumeLocal?.report || '';
      const nextEvidence = hasRemote
        ? remoteProgress.selectedEvidence || []
        : resumeLocal?.selectedEvidence || [];
      const nextTimeline = hasRemote
        ? remoteProgress.timelineOrder?.length
          ? remoteProgress.timelineOrder
          : [...gameCase.timeline]
        : resumeLocal?.timelineOrder?.length
        ? resumeLocal.timelineOrder
        : [...gameCase.timeline];
      if (hasRemote) {
        setReport(nextReport);
        setSelectedEvidence(nextEvidence);
        setTimelineOrder(nextTimeline);
      }
      const nextHints = Math.max(resumeLocal?.hintCount || 0, session.hintsUsed || 0);
      const nextElapsed = session.elapsedSeconds || 0;
      if (teamInfo) {
        const sessions = stored<Record<string, LocalSessionRecord>>('arena-local-sessions', {});
        const sessionKey = `${teamInfo.id}:${gameCase.id}`;
        const existingSess = sessions[sessionKey];
        sessions[sessionKey] = {
          startedAt: Date.now() - nextElapsed * 1000,
          hintsUsed: Math.max(nextHints, existingSess?.hintsUsed || 0),
          completed: Boolean(existingSess?.completed),
          progress: {
            report: nextReport,
            selectedEvidence: nextEvidence,
            timelineOrder: nextTimeline,
          },
        };
        try {
          localStorage.setItem('arena-local-sessions', JSON.stringify(sessions));
        } catch {
          // Ignore storage quota errors.
        }
      }
      setHintCount(nextHints);
      setElapsed(nextElapsed);
      setSessionReady(true);
    };

    try {
      const beginPayload = {
        caseId: gameCase.id,
        teamId: teamInfo?.id || null,
        isLiveGame: hasLiveEvent,
      };
      const session = serverCaseModeRef.current
        ? await callLocalArena<{
            progress?: {
              report?: string;
              selectedEvidence?: number[];
              timelineOrder?: string[];
            };
            hintsUsed?: number;
            elapsedSeconds?: number;
          }>('beginInvestigation', beginPayload)
        : await invoke<{
            progress?: {
              report?: string;
              selectedEvidence?: number[];
              timelineOrder?: string[];
            };
            hintsUsed?: number;
            elapsedSeconds?: number;
          }>('beginInvestigation', beginPayload);
      applySessionResponse(session);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to start investigation.';
      if (isMissingRemoteCaseError(msg)) {
        try {
          const serverSession = await callLocalArena<{
            progress?: {
              report?: string;
              selectedEvidence?: number[];
              timelineOrder?: string[];
            };
            hintsUsed?: number;
            elapsedSeconds?: number;
          }>('beginInvestigation', {
            caseId: gameCase.id,
            teamId: teamInfo?.id || null,
            isLiveGame: hasLiveEvent,
          });
          serverCaseModeRef.current = true;
          caseFallbackRef.current = false;
          applySessionResponse(serverSession);
          return;
        } catch {
          // Fall back to browser-local session only if the Express server is also unreachable.
        }
        caseFallbackRef.current = true;
        const localSess = ensureLocalSession(gameCase.id);
        const hasSaved =
          (localSess.progress?.selectedEvidence?.length || 0) > 0 ||
          Boolean(localSess.progress?.report) ||
          (localSess.progress?.timelineOrder?.length || 0) > 0;
        if (hasSaved) {
          setReport(localSess.progress.report || '');
          setSelectedEvidence(localSess.progress.selectedEvidence || []);
          setTimelineOrder(
            localSess.progress.timelineOrder?.length
              ? localSess.progress.timelineOrder
              : [...gameCase.timeline]
          );
        }
        setHintCount(localSess.hintsUsed || 0);
        setElapsed(Math.max(0, Math.floor((Date.now() - localSess.startedAt) / 1000)));
        setSessionReady(true);
      } else {
        setNotice(msg);
      }
    }
  };

  const applyLocalHint = (caseObj: InvestigationCase) => {
    const teamKey = teamInfo?.id || 'solo';
    const sessions = stored<Record<string, LocalSessionRecord>>('arena-local-sessions', {});
    const sessionKey = `${teamKey}:${caseObj.id}`;
    const current = sessions[sessionKey] || ensureLocalSession(caseObj.id);
    const nextHints = Math.min(caseObj.hints.length, (current.hintsUsed || hintCount || 0) + 1);
    sessions[sessionKey] = {
      ...current,
      hintsUsed: nextHints,
    };
    localStorage.setItem('arena-local-sessions', JSON.stringify(sessions));
    setHintCount(nextHints);
    setNotice('');
    playSignal(muted, 480);
  };

  const requestHint = async () => {
    if (!activeCase || hintCount >= activeCase.hints.length || hintBusy) return;
    if (caseFallbackRef.current || (!serverCaseModeRef.current && supabase && !useLocalBackend)) {
      applyLocalHint(activeCase);
      return;
    }
    setHintBusy(true);
    try {
      const response = await callLocalArena<{ hintsUsed: number }>('useInvestigationHint', {
        caseId: activeCase.id,
        teamId: teamInfo?.id || null,
      });
      setHintCount(response.hintsUsed);
      playSignal(muted, 480);
    } catch {
      applyLocalHint(activeCase);
    } finally {
      setHintBusy(false);
    }
  };

  const recordLocalVerdict = (caseObj: InvestigationCase, scoreData: CaseScore) => {
    const teamKey = teamInfo?.id || 'solo';
    const sessions = stored<Record<string, LocalSessionRecord>>('arena-local-sessions', {});
    const sessionKey = `${teamKey}:${caseObj.id}`;
    if (sessions[sessionKey]) {
      sessions[sessionKey].completed = true;
      localStorage.setItem('arena-local-sessions', JSON.stringify(sessions));
    }
    setLocalRankings((prev) => {
      const next = {
        ...prev,
        [teamKey]: {
          ...(prev[teamKey] || {}),
          [caseObj.id]: scoreData,
        },
      };
      localStorage.setItem('arena-local-rankings', JSON.stringify(next));
      return next;
    });
  };

  const finalizeSubmission = async () => {
    if (submittingLockRef.current) return;
    if (!teamInfo || !activeCase) {
      setNotice('Register a team before submitting a verdict.');
      return;
    }
    const targetCase = activeCase;
    submittingLockRef.current = true;
    setSubmissionBusy(true);
    setNotice('');

    const finishWithResult = (scorePayload: CaseScore, syncedRemotely = false) => {
      const enriched: CaseScore = {
        ...scorePayload,
        submittedSummary: report.trim() || scorePayload.submittedSummary || '',
      };
      playSignal(muted, 760);
      const nextCompleted = [...new Set([...completed, targetCase.id])];
      localStorage.setItem('arena-completed', JSON.stringify(nextCompleted));
      localStorage.removeItem('arena-progress');
      if (syncedRemotely && teamInfo?.id) {
        const existingLocalKeys = Object.keys({
          ...(localRankings.solo || {}),
          ...(localRankings[teamInfo.id] || {}),
          [targetCase.id]: enriched,
        }).sort();
        syncedLocalTeamsRef.current.add(`${teamInfo.id}:${existingLocalKeys.join(',')}`);
      }
      recordLocalVerdict(targetCase, enriched);
      setResult(enriched);
      if (typeof scorePayload.rank === 'number' && scorePayload.rank > 0) {
        setServerMyRank(scorePayload.rank);
      }
      setSessionReady(false);
      void fetchSharedServerState();
      void refreshArenaData();
      setNotice(
        `Verdict submitted for "${targetCase.title}". Review your points and answer summary below.`
      );
    };

    const submitPayload = {
      caseId: targetCase.id,
      selectedEvidence,
      timelineOrder,
      report,
      teamId: teamInfo?.id || null,
      hintsUsed: hintCount,
      elapsedSeconds: elapsed,
      isLiveGame: hasLiveEvent,
    };

    try {
      if (!caseFallbackRef.current) {
        const response = serverCaseModeRef.current
          ? await callLocalArena<CaseScore>('submitInvestigation', submitPayload)
          : await invoke<CaseScore>('submitInvestigation', submitPayload);
        finishWithResult(response, true);
        return;
      }
      const fallbackResult = gradeCaseVerdictLocally(
        targetCase.id,
        timelineOrder,
        report,
        hintCount,
        elapsed
      );
      if (!fallbackResult) {
        throw new Error('Case answer key not found.');
      }
      const storedScore: CaseScore = {
        ...fallbackResult,
        submittedSummary: report.trim(),
      };
      finishWithResult(storedScore, false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Submission failed.';
      if (isMissingRemoteCaseError(msg)) {
        try {
          const serverResponse = await callLocalArena<CaseScore>('submitInvestigation', submitPayload);
          serverCaseModeRef.current = true;
          caseFallbackRef.current = false;
          finishWithResult(serverResponse, true);
          return;
        } catch {
          // Fall back to local grading only if Express server is unreachable.
        }
        caseFallbackRef.current = true;
        const fallbackResult = gradeCaseVerdictLocally(
          targetCase.id,
          timelineOrder,
          report,
          hintCount,
          elapsed
        );
        if (fallbackResult) {
          const storedScore: CaseScore = {
            ...fallbackResult,
            submittedSummary: report.trim(),
          };
          finishWithResult(storedScore, false);
          return;
        }
      }
      setNotice(msg);
    } finally {
      submittingLockRef.current = false;
      setSubmissionBusy(false);
    }
  };

  const submitCase = async (event: FormEvent) => {
    event.preventDefault();
    await finalizeSubmission();
  };

  const createTeam = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedCode = accessCode.trim();
    if (!trimmedCode || trimmedCode !== 'Avion_2026') {
      setTeamEntryError('Invalid access code. Please contact the organizer for the valid access code.');
      return;
    }
    setTeamBusy(true);
    setTeamEntryError('');
    try {
      const data = await invoke<TeamInfo>('createTeam', {
        name: teamName.trim(),
        accessCode: trimmedCode,
      });
      saveCachedTeamRecord(user?.id || '', data);
      setTeamInfo(data);
      persistNavState({
        activeView: 'Home',
        selectedCaseId: null,
        activeTab: 'Evidence',
        difficultyFilter: difficultyFilterRef.current,
      });
      window.history.replaceState(
        { arenaManaged: true, arenaRootGuard: true, page: 'Play Investigation', caseId: null },
        '',
        '#/lobby'
      );
      window.history.pushState(
        { arenaManaged: true, page: 'Home', caseId: null },
        '',
        '#/home'
      );
      void refreshArenaData();
    } catch (error) {
      setTeamEntryError(error instanceof Error ? error.message : 'Unable to register team.');
    } finally {
      setTeamBusy(false);
    }
  };

  const shiftTimeline = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= timelineOrder.length || !activeCase) return;
    const next = [...timelineOrder];
    [next[index], next[target]] = [next[target], next[index]];
    setTimelineOrder(next);
    localStorage.setItem(
      'arena-progress',
      JSON.stringify({
        caseId: activeCase.id,
        report,
        selectedEvidence,
        timelineOrder: next,
        hintCount,
      })
    );
  };

  const [logoutBusy, setLogoutBusy] = useState(false);

  const logOut = async () => {
    setLogoutBusy(true);
    try {
      if (teamInfo) {
        localStorage.removeItem(`arena-game-start-${teamInfo.id}`);
        localStorage.removeItem(`arena-game-clock-${teamInfo.id}`);
        await invoke('leaveTeam', { teamId: teamInfo.id }).catch(() => {});
      }
      localStorage.removeItem('arena-admin-token');
      localStorage.removeItem('arena-progress');
      localStorage.removeItem('arena-completed');
      localStorage.removeItem('arena-local-sessions');
      localStorage.removeItem('arena-local-rankings');
      localStorage.removeItem(TEAM_CACHE_STORAGE_KEY);
      localStorage.removeItem(NAV_STORAGE_KEY);
      localStorage.removeItem(ARENA_SHARED_CACHE_KEY);
      try {
        sessionStorage.removeItem(SESSION_HYDRATED_KEY);
      } catch {
        // Ignore sessionStorage restrictions.
      }
      setLocalRankings({});
      setServerRankings([]);
      setServerMyRank(null);
      syncedLocalTeamsRef.current.clear();
      serverCaseModeRef.current = false;
      caseFallbackRef.current = false;
      setGameClock(EMPTY_GAME_CLOCK);
      setGameElapsed(0);
      setAdminToken('');
      setAdmin(false);
      setTeamInfo(null);
      setTeamName('');
      setAccessCode('');
      setActiveCase(null);
      setCaseTab('Evidence');
      setResult(null);
      setSessionReady(false);
      setReport('');
      setSelectedEvidence([]);
      setTimelineOrder([]);
      setHintCount(0);
      setElapsed(0);
      setPage('Home');
      setMobileMenu(false);
      setNotice('');
      window.history.replaceState(null, '', '#/home');
      if (supabase && !localBackendRef.current) {
        await Promise.race([
          supabase.auth.signOut(),
          new Promise((resolve) => window.setTimeout(resolve, 2000)),
        ]).catch(() => {});
        const res = await Promise.race([
          supabase.auth.signInAnonymously(),
          new Promise<{ error: Error }>((resolve) =>
            window.setTimeout(() => resolve({ error: new Error('Anonymous sign-in timed out.') }), 2500)
          ),
        ]).catch((err: unknown) => ({
          error: err instanceof Error ? err : new Error('Anonymous sign-in failed.'),
        }));
        if (res.error) {
          recordSupabaseFailure(res.error);
          if (await activateLocalBackend()) {
            const nextLocalId = getOrCreateLocalPlayerId(true);
            setUser(createLocalUser(nextLocalId));
            setSupabaseAccessToken('');
            setTeamEntryError('');
          } else {
            setTeamEntryError(res.error.message);
          }
        }
      } else {
        const nextLocalId = getOrCreateLocalPlayerId(true);
        setUser(createLocalUser(nextLocalId));
      }
    } finally {
      setLogoutBusy(false);
    }
  };

  const exportResults = (entriesOverride?: RankingEntry[]) => {
    const teamList = entriesOverride
      ? entriesOverride
      : effectiveLeaderboard.filter((item) => !item.mode || item.mode === 'Team');
    const summaryRows = teamList.map((item, index) => {
      const secs = item.elapsedSeconds || 0;
      const mins = Math.floor(secs / 60);
      const rem = String(secs % 60).padStart(2, '0');
      return {
        Rank: index + 1,
        Team: item.teamName || 'Team',
        Score: item.score || 0,
        'Cases Closed': Object.keys(item.caseScores || {}).length,
        'Completion Time (mm:ss)': secs ? `${mins}:${rem}` : '—',
        'Elapsed Seconds': secs,
      };
    });

    const caseRows: Array<Record<string, string | number>> = [];
    teamList.forEach((item, index) => {
      Object.entries(item.caseScores || {}).forEach(([cId, cScore]) => {
        const matchedCase = cases.find((entry) => entry.id === cId);
        const maxPoints =
          cScore.maxScore ?? (matchedCase ? getCaseMaxScore(matchedCase.difficulty) : 100);
        const hasTimeline = (cScore.totalTimeline ?? 0) > 0;
        caseRows.push({
          Rank: index + 1,
          Team: item.teamName || 'Team',
          'Case ID': cId.toUpperCase(),
          Score: cScore.score ?? 0,
          'Max Points': maxPoints,
          'Summary Score': cScore.summaryScore ?? '',
          'Sequence Score': hasTimeline ? cScore.sequenceScore ?? '' : 'N/A',
          'Hints Used': cScore.hintsUsed ?? 0,
          'Elapsed Seconds': cScore.elapsedSeconds ?? '',
        });
      });
    });

    const workbook = XLSX.utils.book_new();
    const leaderboardSheet = XLSX.utils.json_to_sheet(
      summaryRows.length
        ? summaryRows
        : [
            {
              Rank: '',
              Team: 'No verified scores yet',
              Score: 0,
              'Cases Closed': 0,
              'Completion Time (mm:ss)': '—',
              'Elapsed Seconds': 0,
            },
          ]
    );
    XLSX.utils.book_append_sheet(workbook, leaderboardSheet, 'Leaderboard');

    if (caseRows.length > 0) {
      const breakdownSheet = XLSX.utils.json_to_sheet(caseRows);
      XLSX.utils.book_append_sheet(workbook, breakdownSheet, 'Case Breakdown');
    }

    XLSX.writeFile(workbook, 'cyber-mystery-results.xlsx');
  };

  const scrollPageToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    scrollPageToTop();
  }, [page, activeCase?.id, result, scrollPageToTop]);

  const goTo = (label: PageName) => {
    scrollPageToTop();
    setPage(label);
    setActiveCase(null);
    setResult(null);
    setSessionReady(false);
    setMobileMenu(false);
    setNotice('');
    persistNavState({
      activeView: label,
      selectedCaseId: null,
      activeTab: caseTabRef.current,
      difficultyFilter: difficultyFilterRef.current,
    });
    const targetHash = hashForRoute(label, null);
    if (window.location.hash !== targetHash) {
      window.history.pushState(
        { arenaManaged: true, page: label, caseId: null },
        '',
        targetHash
      );
    }
  };

  if (!teamInfo) {
    return (
      <TeamRegistration
        user={user}
        authReady={authReady}
        supabaseConfigured={supabaseConfigured}
        useLocalBackend={useLocalBackend}
        teamBusy={teamBusy}
        teamLoading={teamLoading}
        teamEntryError={teamEntryError}
        teamName={teamName}
        setTeamName={setTeamName}
        accessCode={accessCode}
        setAccessCode={setAccessCode}
        createTeam={createTeam}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="ambient-grid" aria-hidden="true">
        <img src={authCampusArchiveImg} alt="" referrerPolicy="no-referrer" />
      </div>
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <button
          className="brand-lockup"
          onClick={() => goTo('Home')}
          aria-label="Cyber Mystery Arena home"
        >
          <span className="brand-mark">
            <ScanSearch size={20} />
          </span>
          <span className="brand-type">
            <strong>CYBER MYSTERY</strong>
            <small>ARENA · 2026</small>
          </span>
        </button>

        <div className="side-caption">Investigation Deck</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-link ${
                page === label || (page === 'Investigation' && label === 'Play Investigation')
                  ? 'active'
                  : ''
              }`}
              onClick={() => goTo(label)}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button
          className={`nav-link admin-link ${page === 'Admin' ? 'active' : ''}`}
          onClick={() => goTo('Admin')}
        >
          <SlidersHorizontal size={17} />
          <span>Admin console</span>
        </button>

        <div className="side-bottom">
          <div className="account-chip">
            <span className="avatar">{teamInfo.name.slice(0, 1).toUpperCase()}</span>
            <span className="account-label">
              <strong>{teamInfo.name}</strong>
              <small>SINGLE PLAYER · TEAM</small>
            </span>
          </div>
          <button
            type="button"
            className="leave-team-btn"
            onClick={() => void logOut()}
            disabled={logoutBusy}
          >
            <LogOut size={14} />
            <span>{logoutBusy ? 'Logging out…' : 'Log out'}</span>
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <div
          className="mobile-backdrop"
          aria-hidden="true"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <main className="main-area" ref={mainRef}>
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu-button"
              aria-label="Toggle navigation"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <Menu size={19} />
            </button>
            <div className="breadcrumb">
              <span>ARENA</span>
              <span className="breadcrumb-slash">/</span>
              <strong>{page === 'Investigation' ? 'ACTIVE CASE' : page.toUpperCase()}</strong>
            </div>
          </div>

          <div className="top-actions">
            <div
              className={`game-clock-pill ${
                isGameEnded || gameSecondsRemaining === 0
                  ? 'is-expired'
                  : isGamePaused
                  ? 'is-paused'
                  : gameSecondsRemaining <= 300
                  ? 'is-warning'
                  : ''
              }`}
              title={
                isGameEnded
                  ? `Game ended (${gameTimer} remaining of ${configuredGameMinutes} minutes)`
                  : isGamePaused
                  ? `Game paused (${gameTimer} remaining of ${configuredGameMinutes} minutes)`
                  : `Entire game timer (${configuredGameMinutes} minutes)`
              }
            >
              {isGameEnded ? (
                <Square size={12} />
              ) : isGamePaused ? (
                <Pause size={13} />
              ) : (
                <Clock3 size={13} />
              )}
              <span>
                {isGameEnded
                  ? `ENDED · ${gameTimer}`
                  : isGamePaused
                  ? `PAUSED · ${gameTimer}`
                  : `GAME · ${gameTimer}`}
              </span>
            </div>
            <div
              className={`event-indicator ${
                hasLiveEvent
                  ? 'is-live'
                  : isGameEnded
                  ? 'is-ended'
                  : isGamePaused
                  ? 'is-paused'
                  : ''
              }`}
            >
              <Radio size={13} />
              <span>
                {hasLiveEvent
                  ? 'LIVE EVENT'
                  : isGameEnded
                  ? 'GAME ENDED'
                  : isGamePaused
                  ? 'GAME PAUSED'
                  : 'WAITING FOR ADMIN'}
              </span>
            </div>
            <button
              className="icon-button"
              aria-label="Toggle sound effects"
              title={muted ? 'Sound muted' : 'Sound on'}
              onClick={() => {
                const nextMuted = !muted;
                setMuted(nextMuted);
                playSignal(nextMuted, 620);
              }}
            >
              <Radio size={17} className={muted ? 'muted-icon' : ''} />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label="Log out"
              title="Log out"
              disabled={logoutBusy}
              onClick={() => void logOut()}
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {notice && (
          <motion.div
            className="notice"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CircleHelp size={16} />
            <span>{notice}</span>
            <button aria-label="Dismiss message" onClick={() => setNotice('')}>
              <X size={15} />
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait" onExitComplete={scrollPageToTop}>
          <motion.div
            key={page + (activeCase?.id || '')}
            className="page-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {page === 'Investigation' && activeCase ? (
              <InvestigationView
                key={activeCase.id}
                activeCase={activeCase}
                activeTab={caseTab}
                onTabChange={handleCaseTabChange}
                report={report}
                setReport={setReport}
                selectedEvidence={selectedEvidence}
                setSelectedEvidence={setSelectedEvidence}
                timelineOrder={timelineOrder}
                shiftTimeline={shiftTimeline}
                hintCount={hintCount}
                hintBusy={hintBusy}
                requestHint={requestHint}
                gameTimer={gameTimer}
                configuredGameMinutes={configuredGameMinutes}
                gameExpired={gameSecondsRemaining === 0}
                hasLiveEvent={hasLiveEvent}
                isGamePaused={isGamePaused}
                isGameEnded={isGameEnded}
                result={result}
                submitCase={submitCase}
                submissionBusy={submissionBusy}
                goTo={goTo}
              />
            ) : null}

            {page !== 'Investigation' && page !== 'Admin' && (
              <>
                {page === 'Home' && (
                  <HomeView
                    cases={cases}
                    games={games}
                    announcements={announcements}
                    registeredCount={registeredCount}
                    hasLiveEvent={hasLiveEvent}
                    configuredGameMinutes={configuredGameMinutes}
                    completedCount={completed.length}
                    setPage={goTo}
                    onRefreshStatus={() => void refreshArenaData(true)}
                  />
                )}
                {page === 'Dashboard' && (
                  <DashboardView
                    teamInfo={teamInfo}
                    teamScore={teamScore}
                    myRank={myRank}
                    completed={completed}
                    cases={orderedCases}
                    hasLiveEvent={hasLiveEvent}
                    isGamePaused={isGamePaused}
                    isGameEnded={isGameEnded}
                    openCase={openCase}
                    setPage={goTo}
                    onRefreshStatus={() => void refreshArenaData(true)}
                  />
                )}
                {page === 'Play Investigation' && (
                  <CaseLibrary
                    visibleCases={orderedCases}
                    openCase={openCase}
                    completed={completed}
                    search={search}
                    setSearch={setSearch}
                    difficultyFilter={difficultyFilter}
                    setDifficultyFilter={setDifficultyFilter}
                    hasLiveEvent={hasLiveEvent}
                    isGamePaused={isGamePaused}
                    isGameEnded={isGameEnded}
                    admin={admin}
                    setPage={goTo}
                    onRefreshStatus={() => void refreshArenaData(true)}
                  />
                )}
                {page === 'My History' && (
                  <HistoryView completed={completed} cases={orderedCases} openCase={openCase} />
                )}
              </>
            )}

            {page === 'Admin' && (
              <AdminView
                admin={admin}
                hasLiveEvent={hasLiveEvent}
                isGamePaused={isGamePaused}
                isGameEnded={isGameEnded}
                configuredGameMinutes={configuredGameMinutes}
                registeredCount={registeredCount}
                games={games}
                leaderboard={effectiveLeaderboard}
                onAdminRankings={setLeaderboard}
                exportResults={exportResults}
                invoke={invoke}
                setNotice={setNotice}
                unlockAdmin={unlockAdmin}
                lockAdmin={lockAdmin}
                refreshArenaData={refreshArenaData}
                onNewGameCreated={() => clearIncompleteLocalTimers(teamInfo?.id)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <footer className="page-footer">
          <span>CYBER MYSTERY ARENA · EVERY CLUE MATTERS</span>
          <span>
            FICTIONAL TRAINING SIMULATION <Shield size={12} />
          </span>
        </footer>
      </main>
    </div>
  );
}

function TeamRegistration({
  user,
  authReady,
  supabaseConfigured,
  useLocalBackend,
  teamBusy,
  teamLoading,
  teamEntryError,
  teamName,
  setTeamName,
  accessCode,
  setAccessCode,
  createTeam,
}: {
  user: User | null;
  authReady: boolean;
  supabaseConfigured: boolean;
  useLocalBackend: boolean;
  teamBusy: boolean;
  teamLoading: boolean;
  teamEntryError: string;
  teamName: string;
  setTeamName: (v: string) => void;
  accessCode: string;
  setAccessCode: (v: string) => void;
  createTeam: (e: FormEvent) => void;
}) {
  const unavailable =
    !user || !authReady || (!supabaseConfigured && !useLocalBackend) || teamBusy || teamLoading;
  return (
    <main className="team-entry-shell">
      <div className="ambient-grid" aria-hidden="true" />
      <div className="team-entry-backdrop" aria-hidden="true">
        <img src={authCampusArchiveImg} alt="" referrerPolicy="no-referrer" />
      </div>

      <section className="team-entry-card">
        <span className="brand-mark team-entry-mark">
          <ScanSearch size={20} />
        </span>
        <div className="eyebrow">SINGLE PLAYER · TEAM ACCESS</div>
        <h1>Register your team.</h1>
        <p>
          Enter your team name and event access code to begin. Only one player can play per team
          from this session.
        </p>

        {teamLoading || !authReady ? (
          <div className="setup-callout">
            <span className="spinner" />
            <span>Preparing secure team access…</span>
          </div>
        ) : null}

        {!supabaseConfigured && !useLocalBackend && (
          <div className="setup-callout">
            <LockKeyhole size={17} />
            <span>Connect Supabase and enable Anonymous sign-in to register your team.</span>
          </div>
        )}

        {teamEntryError && (
          <p className="auth-error">
            <ShieldAlert size={14} />
            <span>{teamEntryError}</span>
          </p>
        )}

        <form className="team-entry-form" onSubmit={createTeam}>
          <label htmlFor="team-name">
            TEAM NAME
            <input
              id="team-name"
              required
              minLength={2}
              maxLength={30}
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="e.g. Packet Detectives"
            />
          </label>
          <label htmlFor="access-code">
            ACCESS CODE
            <input
              id="access-code"
              required
              autoComplete="off"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder="Enter event access code"
            />
          </label>
          <button className="button button-primary" disabled={unavailable}>
            <Users size={15} />
            <span>{teamBusy ? 'Registering…' : 'Register team'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <p className="team-entry-footnote">
          <Shield size={12} />
          <span>
            Registration is protected by event access code. Clearing browser data loses access to
            this team session.
          </span>
        </p>
      </section>
    </main>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

function HomeView({
  cases: caseList,
  games,
  announcements,
  registeredCount,
  hasLiveEvent,
  configuredGameMinutes,
  completedCount,
  setPage,
  onRefreshStatus,
}: {
  cases: InvestigationCase[];
  games: GameLobby[];
  announcements: AnnouncementItem[];
  registeredCount: number | null;
  hasLiveEvent: boolean;
  configuredGameMinutes: number;
  completedCount: number;
  setPage: (p: PageName) => void;
  onRefreshStatus: () => void;
}) {
  const liveGamesCount = games.filter((game) => game.status === 'live').length;
  const [rulesModalOpen, setRulesModalOpen] = useState(false);

  useEffect(() => {
    if (!rulesModalOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setRulesModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rulesModalOpen]);

  return (
    <>
      <section className="hero-panel">
        <div className="hero-photo-backdrop" aria-hidden="true">
          <img src={heroForensicDeskImg} alt="" referrerPolicy="no-referrer" />
        </div>
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">THE CAMPUS CYBER INVESTIGATION LEAGUE</div>
          <h1>
            Every mystery
            <br />
            <em>leaves a trace.</em>
          </h1>
          <p>
            Investigate, analyze forensic logs, reconstruct timelines, and submit your team verdict.
          </p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => setPage('Play Investigation')}>
              <FolderSearch size={16} />
              <span>Enter the arena</span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              className="button button-outline hero-secondary-btn"
              onClick={() => setRulesModalOpen(true)}
            >
              <BookOpen size={15} />
              <span>Mission Rules</span>
            </button>
          </div>
          <div className="hero-proof">
            <span>
              <b>{caseList.length}</b> forensic cases
            </span>
            <span>
              <b>{formatGameDurationLabel(configuredGameMinutes)}</b> total game
            </span>
            <span>
              <b>Easy · Medium · Hard</b> tiers
            </span>
          </div>
        </div>

        <div className="hero-art" aria-label="Investigation signal radar">
          <div className="radar-sweep" />
          <div className="radar-ring ring-one" />
          <div className="radar-ring ring-two" />
          <div className="radar-crosshair" />
          <span className="radar-target target-one" />
          <span className="radar-target target-two" />
          <span className="radar-target target-three" />
          <div className="radar-label label-top">SIGNAL · 03</div>
          <div className="radar-label label-bottom">TRACE DETECTED</div>
          <div className="radar-core">
            <Fingerprint size={25} />
          </div>
          <div
            className="radar-coordinate"
            title="Basaveshwar Engineering College, Bagalkot, Karnataka, India"
          >
            16° 10&apos; 25.3&quot; N
            <br />
            75° 39&apos; 25.9&quot; E
          </div>
        </div>
        <div className="hero-index">
          01 <span>/</span> {String(caseList.length).padStart(2, '0')}
        </div>
      </section>

      <section className="stats-strip">
        <div className="stat-block backdrop-blur-md">
          <span className="stat-icon">
            <Users size={17} />
          </span>
          <div>
            <strong>{registeredCount === null ? '—' : registeredCount.toLocaleString()}</strong>
            <small>REGISTERED TEAMS</small>
          </div>
        </div>
        <div className="stat-block backdrop-blur-md">
          <span className="stat-icon">
            <FileText size={17} />
          </span>
          <div>
            <strong>{hasLiveEvent ? caseList.length : 'LOCKED'}</strong>
            <small>CASE FILES</small>
          </div>
        </div>
        <div className="stat-block backdrop-blur-md">
          <span className="stat-icon">
            <Check size={17} />
          </span>
          <div>
            <strong>{completedCount}</strong>
            <small>CASES SOLVED</small>
          </div>
        </div>
        <div className="stat-block backdrop-blur-md">
          <span className="stat-icon">
            <Radio size={17} />
          </span>
          <div>
            <strong>{liveGamesCount || '—'}</strong>
            <small>LIVE EVENTS</small>
          </div>
        </div>
      </section>

      <section
        className="section-block rules-section backdrop-blur-md"
        aria-labelledby="rules-heading"
      >
        <div className="section-heading">
          <div>
            <div className="eyebrow">OFFICIAL GUIDELINES</div>
            <h2 id="rules-heading">Rules &amp; Regulations</h2>
          </div>
          <div className="rules-header-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() => setRulesModalOpen(true)}
            >
              <BookOpen size={15} />
              <span>Mission Rules</span>
            </button>
            <a
              className="button button-outline"
              href="/assets/aistudio/Avon_-_Cyber_Mystery_Arena_Rules___Regulations_c957d254.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText size={15} />
              <span>Open Rules PDF</span>
            </a>
          </div>
        </div>

        <div className="rules-compact-grid">
          <article className="rules-card">
            <div className="rules-card-head">
              <span className="rules-num">01</span>
              <strong>How to Play</strong>
              <FolderSearch size={15} className="rules-head-icon" />
            </div>
            <ul className="rules-list">
              <li>
                Select <b>Easy</b>, <b>Medium</b>, or <b>Hard</b> cases once the admin starts the
                game.
              </li>
              <li>
                Inspect logs, image clues, and suspect alibis, then name the single culprit in{' '}
                <em>Summarize the Answer</em>.
              </li>
              <li>
                <b>Hard</b> cases also include a 4-step <em>Timeline builder</em>.
              </li>
            </ul>
          </article>

          <article className="rules-card">
            <div className="rules-card-head">
              <span className="rules-num">02</span>
              <strong>Scoring &amp; Timers</strong>
              <Scale size={15} className="rules-head-icon" />
            </div>
            <ul className="rules-list">
              <li>
                <b>Easy:</b> 50 pts · <b>Medium:</b> 75 pts · <b>Hard:</b> 100 pts (50 Timeline + 50
                Summary).
              </li>
              <li>
                Multiple culprit names reduce marks; max 2 hints per case (<b>-5 pts</b> each).
              </li>
              <li>
                No per-case timer · <b>{formatGameDurationLabel(configuredGameMinutes)}</b> total arena time.
              </li>
            </ul>
          </article>

          <article className="rules-card">
            <div className="rules-card-head">
              <span className="rules-num">03</span>
              <strong>Fair Play</strong>
              <Shield size={15} className="rules-head-icon" />
            </div>
            <ul className="rules-list">
              <li>One player per registered team in a single browser tab.</li>
              <li>No source inspection, server probing, or cross-team answer sharing.</li>
              <li>Decisions of the <b>Avion Event Coordinators</b> are final.</li>
            </ul>
          </article>
        </div>
      </section>

      {rulesModalOpen && (
        <div
          className="arena-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mission-rules-title"
          onClick={() => setRulesModalOpen(false)}
        >
          <div
            className="arena-modal-card backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="arena-modal-head">
              <div>
                <div className="eyebrow">MISSION BRIEFING · ARENA PROTOCOL</div>
                <h3 id="mission-rules-title">Mission Rules &amp; Scoring Guide</h3>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close mission rules"
                onClick={() => setRulesModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="arena-modal-grid">
              <div className="arena-modal-panel">
                <div className="rules-card-head">
                  <span className="rules-num">01</span>
                  <strong>Gameplay Steps</strong>
                  <Compass size={15} className="rules-head-icon" />
                </div>
                <ul>
                  <li>Register your single-player team with the event access code.</li>
                  <li>Wait for the admin to start the arena, then choose Easy, Medium, or Hard cases.</li>
                  <li>Inspect evidence logs, image clues, and suspect profiles before filing your verdict.</li>
                  <li>On Hard cases, arrange all 4 Timeline events in chronological order.</li>
                </ul>
              </div>

              <div className="arena-modal-panel">
                <div className="rules-card-head">
                  <span className="rules-num">02</span>
                  <strong>Scoring Breakdown</strong>
                  <Scale size={15} className="rules-head-icon" />
                </div>
                <ul>
                  <li>
                    <b className="text-emerald-600">Easy:</b> 50 PTS max (100% Answer Summary)
                  </li>
                  <li>
                    <b className="text-amber-600">Medium:</b> 75 PTS max (100% Answer Summary)
                  </li>
                  <li>
                    <b className="text-rose-600">Hard:</b> 100 PTS max (50 Timeline + 50 Summary)
                  </li>
                  <li>Naming only the single culprit + supporting clue earns full summary points; naming multiple culprits reduces score.</li>
                </ul>
              </div>

              <div className="arena-modal-panel">
                <div className="rules-card-head">
                  <span className="rules-num">03</span>
                  <strong>Hint Penalties (-5 PTS)</strong>
                  <Clock3 size={15} className="rules-head-icon" />
                </div>
                <ul>
                  <li>Each case includes up to 2 optional field hints.</li>
                  <li>
                    Every unlocked hint deducts <b className="text-amber-600">-5 PTS</b> from that case&apos;s final score.
                  </li>
                  <li>No per-case timer; the arena total clock is {formatGameDurationLabel(configuredGameMinutes)}.</li>
                </ul>
              </div>

              <div className="arena-modal-panel">
                <div className="rules-card-head">
                  <span className="rules-num">04</span>
                  <strong>Fair Play Rules</strong>
                  <Shield size={15} className="rules-head-icon" />
                </div>
                <ul>
                  <li>One participant per registered team in a single browser tab.</li>
                  <li>No browser DevTools inspection, server probing, or automated scripts.</li>
                  <li>No cross-team answer sharing during active competition.</li>
                  <li>All decisions by the Avion Event Coordinators are final.</li>
                </ul>
              </div>
            </div>

            <div className="arena-modal-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={() => setRulesModalOpen(false)}
              >
                <Check size={15} />
                <span>Got it</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="section-block announcement-section backdrop-blur-md">
        <div className="section-heading">
          <div>
            <div className="eyebrow">ARENA DISPATCHES</div>
            <h2>Latest intel</h2>
          </div>
          <div className="rules-header-actions">
            <button type="button" className="button button-outline" onClick={onRefreshStatus}>
              <Radio size={15} />
              <span>Refresh status</span>
            </button>
            <Bell size={16} />
          </div>
        </div>
        {announcements.length ? (
          announcements.map((item) => (
            <article className="dispatch" key={item.id}>
              <span className="dispatch-icon">
                <Bell size={15} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.message}</p>
                <small>{formatAnnouncementDate(item.createdAt)}</small>
              </div>
            </article>
          ))
        ) : (
          <div className="dispatch empty-dispatch">
            <span className="dispatch-icon">
              <Radio size={15} />
            </span>
            <div>
              <strong>All channels quiet</strong>
              <p>New event announcements will appear here.</p>
              <small>STANDING BY</small>
            </div>
          </div>
        )}
        <div className="slogan-line">
          <Scale size={14} /> EVERY CLUE MATTERS · EVERY DECISION COUNTS
        </div>
      </section>
    </>
  );
}

function DashboardView({
  teamInfo,
  teamScore,
  myRank,
  completed,
  cases: caseList,
  hasLiveEvent,
  isGamePaused,
  isGameEnded,
  openCase,
  setPage,
  onRefreshStatus,
}: {
  teamInfo: TeamInfo;
  teamScore: number;
  myRank: number;
  completed: string[];
  cases: InvestigationCase[];
  hasLiveEvent: boolean;
  isGamePaused: boolean;
  isGameEnded: boolean;
  openCase: (c: InvestigationCase) => void;
  setPage: (p: PageName) => void;
  onRefreshStatus: () => void;
}) {
  const nextCase = caseList.find((gameCase) => !completed.includes(gameCase.id)) || caseList[0];
  return (
    <>
      <PageHeading
        eyebrow="TEAM FIELD DESK"
        title={`${teamInfo.name}'s investigation desk`}
        description="A clear view of your team's investigations, progress, and standing in the arena."
        action={
          <div className="admin-header-actions">
            <button type="button" className="button button-outline" onClick={onRefreshStatus}>
              <Radio size={15} />
              <span>Refresh status</span>
            </button>
            <button className="button button-primary" onClick={() => setPage('Play Investigation')}>
              <FolderSearch size={15} />
              <span>Start an investigation</span>
            </button>
          </div>
        }
      />
      <div className="metric-grid">
        <Metric label="TEAM POINTS" value={teamScore} icon={Zap} accent="lime" />
        <Metric label="CASES CLOSED" value={completed.length} icon={Check} accent="cyan" />
        <Metric
          label="TEAM RANK"
          value={myRank ? `#${myRank}` : '—'}
          icon={Trophy}
          accent="orange"
        />
        <Metric
          label="TEAM STANDING"
          value={
            completed.length >= caseList.length
              ? 'COMPLETED'
              : hasLiveEvent
              ? 'ACTIVE'
              : isGameEnded
              ? 'ENDED'
              : isGamePaused
              ? 'PAUSED'
              : 'STANDING BY'
          }
          icon={Shield}
          accent="blue"
        />
      </div>

      <div className="content-grid dashboard-grid">
        <section className="section-block">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                {hasLiveEvent
                  ? 'RECOMMENDED NEXT'
                  : isGameEnded
                  ? 'EVENT ENDED · FINAL STANDINGS'
                  : isGamePaused
                  ? 'GAME PAUSED · TIMERS FROZEN'
                  : 'CASE ACCESS LOCKED'}
              </div>
              <h2>
                {hasLiveEvent
                  ? nextCase.title
                  : isGameEnded
                  ? 'Game has ended'
                  : isGamePaused
                  ? 'Game paused by admin'
                  : 'Waiting for admin start'}
              </h2>
            </div>
          </div>
          {hasLiveEvent ? (
            <CaseTile
              gameCase={nextCase}
              onClick={() => openCase(nextCase)}
              completed={completed.includes(nextCase.id)}
              featured
            />
          ) : (
            <div className="arena-gate-card">
              <div className="archive-photo-backdrop" aria-hidden="true">
                <img src={caseArchiveBackdropImg} alt="" referrerPolicy="no-referrer" />
              </div>
              <span className="arena-gate-icon">
                {isGameEnded ? (
                  <Flag size={21} />
                ) : isGamePaused ? (
                  <Pause size={21} />
                ) : (
                  <LockKeyhole size={21} />
                )}
              </span>
              <h3>
                {isGameEnded
                  ? 'This Cyber Mystery Arena session has ended'
                  : isGamePaused
                  ? 'Case files temporarily paused'
                  : 'Case files hidden until game begins'}
              </h3>
              <p>
                {isGameEnded
                  ? 'All case submissions are closed. Official standings are reviewed by event administrators.'
                  : isGamePaused
                  ? 'The administrator paused the live session. All timers are frozen and cases will unlock once resumed.'
                  : 'Your team is registered and ready. All case files will unlock once the admin starts the game.'}
              </p>
            </div>
          )}
        </section>

        <section className="section-block">
          <div className="section-heading">
            <div>
              <div className="eyebrow">TEAM PROGRESS</div>
              <h2>Investigation record</h2>
            </div>
            <button
              className="icon-link"
              onClick={() => setPage('My History')}
              aria-label="View investigation history"
            >
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="progress-copy">
            <span>
              {completed.length} / {caseList.length} CASES COMPLETE
            </span>
            <strong>{Math.round((completed.length / caseList.length) * 100)}%</strong>
          </div>
          <div className="progress-track">
            <i style={{ width: `${(completed.length / caseList.length) * 100}%` }} />
          </div>

          <div className="team-roster-box">
            <div className="eyebrow">SINGLE PLAYER TEAM</div>
            <p>
              <strong>{teamInfo.name}</strong> is active as a single-player team session.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

function CaseLibrary({
  visibleCases,
  openCase,
  completed,
  search,
  setSearch,
  difficultyFilter,
  setDifficultyFilter,
  hasLiveEvent,
  isGamePaused,
  isGameEnded,
  admin,
  setPage,
  onRefreshStatus,
}: {
  visibleCases: InvestigationCase[];
  openCase: (c: InvestigationCase) => void;
  completed: string[];
  search: string;
  setSearch: (v: string) => void;
  difficultyFilter: CaseDifficulty;
  setDifficultyFilter: (d: CaseDifficulty) => void;
  hasLiveEvent: boolean;
  isGamePaused: boolean;
  isGameEnded: boolean;
  admin: boolean;
  setPage: (p: PageName) => void;
  onRefreshStatus: () => void;
}) {

  if (!hasLiveEvent) {
    return (
      <>
        <PageHeading
          eyebrow={
            isGameEnded
              ? 'EVENT ENDED · FINAL STANDINGS'
              : isGamePaused
              ? 'ARENA PAUSED · TIMERS FROZEN'
              : 'ARENA WAITING ROOM · ADMIN CONTROLLED'
          }
          title="Play Investigation"
          description={
            isGameEnded
              ? 'The administrator has ended the game. All case files are now closed.'
              : isGamePaused
              ? 'The administrator paused the live event. Case files are hidden and all clocks are paused.'
              : 'Case files are kept sealed until the organizer launches the live session from the Admin Console.'
          }
        />

        <div className="arena-gate-card">
          <div className="archive-photo-backdrop" aria-hidden="true">
            <img src={caseArchiveBackdropImg} alt="" referrerPolicy="no-referrer" />
          </div>
          <span className="arena-gate-icon">
            {isGameEnded ? (
              <Flag size={22} />
            ) : isGamePaused ? (
              <Pause size={22} />
            ) : (
              <LockKeyhole size={22} />
            )}
          </span>
          <h2>
            {isGameEnded
              ? 'Game has ended'
              : isGamePaused
              ? 'Game paused by administrator'
              : 'Waiting for admin to start the game'}
          </h2>
          <p>
            {isGameEnded
              ? 'This Cyber Mystery Arena event has concluded. Official team rankings are available inside the Admin Console.'
              : isGamePaused
              ? 'Case files are temporarily hidden and your game clock is paused. Once the admin resumes the game in the Admin Console, cases will unlock automatically with your remaining time intact.'
              : 'Case files are currently hidden across Easy, Medium, and Hard tiers. Once the admin clicks Start Game in the Admin Console, cases will unlock here automatically.'}
          </p>
          <div className="arena-gate-actions">
            {isGameEnded ? (
              <button
                type="button"
                className={admin ? 'button button-outline' : 'button button-primary'}
                onClick={() => setPage('Home')}
              >
                <Compass size={15} />
                <span>Return Home</span>
              </button>
            ) : (
              <button type="button" className="button button-primary" onClick={onRefreshStatus}>
                <Radio size={15} />
                <span>Check game status</span>
              </button>
            )}
            {admin && (
              <button
                type="button"
                className={isGameEnded ? 'button button-primary' : 'button button-outline'}
                onClick={() => setPage('Admin')}
              >
                <SlidersHorizontal size={15} />
                <span>{isGameEnded ? 'Open Admin Console & Leaderboard' : 'Open Admin Console'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="simulation-note">
          <Shield size={15} />
          <span>
            All evidence is invented for training. No real links, malware, or unauthorized activity.
          </span>
        </div>
      </>
    );
  }

  const statsByDifficulty: Record<
    CaseDifficulty,
    { total: number; solved: number; activeCase: InvestigationCase | null; visibleInTier: InvestigationCase[] }
  > = {
    Easy: { total: 0, solved: 0, activeCase: null, visibleInTier: [] },
    Medium: { total: 0, solved: 0, activeCase: null, visibleInTier: [] },
    Hard: { total: 0, solved: 0, activeCase: null, visibleInTier: [] },
  };

  for (const tier of DIFFICULTY_TIERS) {
    const tierCases = visibleCases.filter((item) => item.difficulty === tier);
    const solvedInTier = tierCases.filter((item) => completed.includes(item.id));
    const activeAssigned = tierCases.find((item) => !completed.includes(item.id)) || null;
    statsByDifficulty[tier] = {
      total: tierCases.length,
      solved: solvedInTier.length,
      activeCase: activeAssigned,
      visibleInTier: admin
        ? tierCases
        : [...(activeAssigned ? [activeAssigned] : []), ...solvedInTier],
    };
  }

  const currentTierStats = statsByDifficulty[difficultyFilter];

  const foundCases = currentTierStats.visibleInTier.filter((gameCase) => {
    const matchesSearch = `${gameCase.id} ${gameCase.title} ${gameCase.subtitle} ${gameCase.category} ${gameCase.difficulty}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      <PageHeading
        eyebrow={`CASE ARCHIVE · ${difficultyFilter.toUpperCase()} TIER`}
        title="Play Investigation"
        description="Select Easy (50 pts), Medium (75 pts), or Hard (100 pts · Timeline Builder) investigations."
        action={
          <div className="case-total">
            <strong>
              {admin
                ? foundCases.length.toString().padStart(2, '0')
                : `${currentTierStats.solved}/${currentTierStats.total}`}
            </strong>
            <small>
              {admin
                ? `${difficultyFilter.toUpperCase()} FILES`
                : `${difficultyFilter.toUpperCase()} SOLVED`}
            </small>
          </div>
        }
      />

      <div className="library-tools">
        <div className="difficulty-filter-row" role="tablist" aria-label="Select case difficulty">
          {(['Easy', 'Medium', 'Hard'] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              role="tab"
              aria-selected={difficultyFilter === tier}
              className={`difficulty-filter-btn ${difficultyFilter === tier ? 'is-active' : ''}`}
              onClick={() => setDifficultyFilter(tier)}
            >
              <span>{tier}</span>
              <small>
                {admin
                  ? statsByDifficulty[tier].total
                  : `${statsByDifficulty[tier].solved}/${statsByDifficulty[tier].total}`}
              </small>
            </button>
          ))}
        </div>

        <label className="search-box">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${difficultyFilter.toLowerCase()} cases`}
            aria-label="Search case files"
          />
        </label>
      </div>

      <div className="simulation-note">
        <Compass size={15} />
        <span>
          {admin
            ? `Organizer view active: showing all ${currentTierStats.total} ${difficultyFilter.toLowerCase()} case files. Participants receive 1 unique active case per level at a time.`
            : currentTierStats.activeCase
            ? `Assigned uniquely to your team: complete your active ${difficultyFilter} case (${currentTierStats.activeCase.id.toUpperCase()}) to unlock the next ${difficultyFilter.toLowerCase()} file. Easy, Medium, and Hard tiers stay separate.`
            : `All ${currentTierStats.total} ${difficultyFilter} cases solved! Switch to another difficulty tab above to continue.`}
        </span>
      </div>

      <div className="case-grid">
        {foundCases.map((gameCase, index) => (
          <CaseTile
            key={gameCase.id}
            gameCase={gameCase}
            onClick={() => openCase(gameCase)}
            completed={completed.includes(gameCase.id)}
            index={index}
          />
        ))}
      </div>

      {!foundCases.length && (
        <EmptyState
          icon={Search}
          title="No case files found"
          copy="Try another case title, category keyword, or switch difficulty tier."
        />
      )}

      <div className="simulation-note">
        <Shield size={15} />
        <span>
          All evidence is invented for training. No real links, malware, or unauthorized activity.
        </span>
      </div>
    </>
  );
}

function CaseTile({
  gameCase,
  onClick,
  featured = false,
  completed = false,
  index = 0,
}: {
  gameCase: InvestigationCase;
  onClick: () => void;
  featured?: boolean;
  completed?: boolean;
  index?: number;
}) {
  const Icon = iconByName[gameCase.icon] || Fingerprint;
  const maxScore = getCaseMaxScore(gameCase.difficulty);
  const difficultyBadgeTone =
    gameCase.difficulty === 'Easy'
      ? 'text-emerald-600'
      : gameCase.difficulty === 'Medium'
      ? 'text-amber-600'
      : 'text-rose-600';

  return (
    <motion.button
      className={`case-card ${featured ? 'case-featured' : ''} ${
        completed ? 'is-solved' : ''
      } tone-${gameCase.color} backdrop-blur-md hover:-translate-y-1 hover:border-teal-600/45 hover:shadow-[0_12px_28px_-14px_rgba(13,148,136,0.22)]`}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2) }}
    >
      <div className="case-card-top">
        <span className="case-category">
          <Icon size={15} />
          <span>{gameCase.category}</span>
        </span>
        <span className="case-card-badges">
          {completed && (
            <span className="case-solved-indicator text-emerald-600">
              <Check size={11} />
              <span>SOLVED</span>
            </span>
          )}
          <span
            className={`case-difficulty-tag is-${gameCase.difficulty.toLowerCase()} ${difficultyBadgeTone}`}
          >
            {gameCase.difficulty.toUpperCase()} · {maxScore} PTS
          </span>
        </span>
      </div>

      <div className="case-card-main">
        <div className="case-card-art">
          <div className="art-circle">
            <Icon size={25} />
          </div>
          <div className="art-grid" />
        </div>
        <div className="case-card-copy">
          <span className="file-id">FILE · {gameCase.id.toUpperCase()}</span>
          <h3>{gameCase.title}</h3>
          <p>{gameCase.subtitle}</p>
          {featured && <p className="featured-brief">{gameCase.briefing}</p>}
        </div>
      </div>

      <div className="case-card-bottom">
        <span>
          <FileText size={14} />
          {gameCase.evidence.length} EVIDENCE
        </span>
        <span>{maxScore} PTS MAX</span>
        <span className={`case-cta ${completed ? 'is-solved' : ''}`}>
          {completed ? (
            <>
              <Check size={14} /> SOLVED
            </>
          ) : featured ? (
            <>
              OPEN CASE <ArrowRight size={14} />
            </>
          ) : (
            <>
              INVESTIGATE <ArrowRight size={14} />
            </>
          )}
        </span>
      </div>
    </motion.button>
  );
}

function InvestigationView({
  activeCase,
  activeTab,
  onTabChange,
  report,
  setReport,
  selectedEvidence,
  setSelectedEvidence,
  timelineOrder,
  shiftTimeline,
  hintCount,
  hintBusy,
  requestHint,
  gameTimer,
  configuredGameMinutes,
  gameExpired,
  hasLiveEvent,
  isGamePaused,
  isGameEnded,
  result,
  submitCase,
  submissionBusy,
  goTo,
}: {
  activeCase: InvestigationCase;
  activeTab: CaseTab;
  onTabChange: (tab: CaseTab) => void;
  report: string;
  setReport: (v: string) => void;
  selectedEvidence: number[];
  setSelectedEvidence: React.Dispatch<React.SetStateAction<number[]>>;
  timelineOrder: string[];
  shiftTimeline: (index: number, direction: -1 | 1) => void;
  hintCount: number;
  hintBusy: boolean;
  requestHint: () => void;
  gameTimer: string;
  configuredGameMinutes: number;
  gameExpired: boolean;
  hasLiveEvent: boolean;
  isGamePaused: boolean;
  isGameEnded: boolean;
  result: CaseScore | null;
  submitCase: (e: FormEvent) => void;
  submissionBusy: boolean;
  goTo: (p: PageName) => void;
}) {
  const [zoomedImage, setZoomedImage] = useState<{
    src: string;
    title: string;
    detail: string;
  } | null>(null);

  useEffect(() => {
    if (!zoomedImage) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setZoomedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedImage]);

  const evidenceCollected = (id: number) => selectedEvidence.includes(id);
  const toggleEvidence = (id: number) => {
    setSelectedEvidence((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    );
  };
  const progress =
    activeCase.evidence.length > 0
      ? Math.round((selectedEvidence.length / activeCase.evidence.length) * 100)
      : 0;
  const Icon = iconByName[activeCase.icon] || Fingerprint;
  const hasTimeline = activeCase.timeline.length > 0;
  const caseMaxScore = getCaseMaxScore(activeCase.difficulty);
  const summaryMax = hasTimeline ? 50 : caseMaxScore;

  return (
    <div className="investigation-layout">
      <div className="investigation-top">
        <button className="back-link" onClick={() => goTo('Play Investigation')}>
          <ArrowLeft size={15} />
          <span>CASE ARCHIVE</span>
        </button>
        <div className="investigation-status">
          {result
            ? 'CASE CLOSED'
            : !hasLiveEvent
            ? isGameEnded
              ? 'GAME ENDED · EVENT CLOSED'
              : isGamePaused
              ? 'GAME PAUSED · TIMERS FROZEN'
              : 'GAME LOCKED'
            : `CASE IN PROGRESS · ${activeCase.difficulty.toUpperCase()}`}
        </div>
        <div className="case-timers-group">
          <div
            className={`case-timer ${
              !hasLiveEvent && !result
                ? isGameEnded
                  ? 'is-expired'
                  : 'is-paused'
                : gameExpired
                ? 'is-expired'
                : ''
            }`}
          >
            {!hasLiveEvent && !result ? (
              isGameEnded ? (
                <Square size={14} />
              ) : (
                <Pause size={15} />
              )
            ) : (
              <Clock3 size={15} />
            )}
            <strong>{gameTimer}</strong>
            <small>
              {!hasLiveEvent && !result
                ? isGameEnded
                  ? 'GAME ENDED'
                  : 'GAME PAUSED'
                : gameExpired
                ? 'GAME ENDED'
                : `GAME · ${configuredGameMinutes} MIN`}
            </small>
          </div>
        </div>
      </div>

      <div className="case-title-row">
        <div>
          <div className="eyebrow">
            {activeCase.category.toUpperCase()} · {activeCase.difficulty.toUpperCase()} LEVEL
          </div>
          <h1>
            {activeCase.title}
            <span>:</span> {activeCase.subtitle}
          </h1>
        </div>
        <div className="case-progress">
          <strong>{result ? '100%' : `${progress}%`}</strong>
          <span>CLUES COLLECTED</span>
          <div className="progress-track">
            <i style={{ width: `${result ? 100 : progress}%` }} />
          </div>
        </div>
      </div>

      <div className="case-workspace">
        <section className="workspace-main">
          {result ? (
            <ResultPanel
              result={result}
              gameCase={activeCase}
              onBack={() => goTo('Play Investigation')}
            />
          ) : !hasLiveEvent ? (
            <div className="arena-gate-card">
              <div className="archive-photo-backdrop" aria-hidden="true">
                <img src={caseArchiveBackdropImg} alt="" referrerPolicy="no-referrer" />
              </div>
              <span className="arena-gate-icon">
                {isGameEnded ? (
                  <Flag size={22} />
                ) : isGamePaused ? (
                  <Pause size={22} />
                ) : (
                  <LockKeyhole size={22} />
                )}
              </span>
              <h2>
                {isGameEnded
                  ? 'Game has ended'
                  : isGamePaused
                  ? 'Game paused by administrator'
                  : 'Case access locked'}
              </h2>
              <p>
                {isGameEnded
                  ? 'The administrator has ended this Cyber Mystery Arena session. Submissions are now closed.'
                  : 'Case files are hidden and the game timer is frozen while the game is paused. Your collected clues and draft report are saved and will resume once the admin restarts the live session.'}
              </p>
              <div className="arena-gate-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => goTo('Play Investigation')}
                >
                  <ArrowLeft size={15} />
                  <span>Back to Case Archive</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="briefing-card">
                <div className="briefing-icon">
                  <Icon size={21} />
                </div>
                <div>
                  <div className="eyebrow">MISSION BRIEFING</div>
                  <p>{activeCase.briefing}</p>
                  <small>
                    <Shield size={12} />
                    <span>{activeCase.incident}</span>
                  </small>
                </div>
              </div>

              <div className="workspace-tabs" role="tablist">
                {(['Evidence', 'Suspects'] as const).map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === tab}
                    className={activeTab === tab ? 'tab-active' : ''}
                    onClick={() => onTabChange(tab)}
                  >
                    <span>{tab}</span>
                    {tab === 'Evidence' && (
                      <span className="tab-count">{activeCase.evidence.length}</span>
                    )}
                    {tab === 'Suspects' && (
                      <span className="tab-count">{activeCase.suspects.length}</span>
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'Evidence' &&
                (activeCase.evidence.length > 0 ? (
                  <div className="evidence-grid">
                    {activeCase.evidence.map((item, index) => {
                      const picked = evidenceCollected(index);
                      const EvidenceTypeIcon = evidenceIconForType(item.type);
                      return (
                        <div
                          key={item.title}
                          role="button"
                          tabIndex={0}
                          aria-pressed={picked}
                          className={`evidence-card ${picked ? 'evidence-picked' : ''}`}
                          onClick={() => toggleEvidence(index)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              toggleEvidence(index);
                            }
                          }}
                        >
                          <div className="evidence-meta">
                            <span className="evidence-meta-type">
                              <EvidenceTypeIcon size={13} />
                              <span>{item.type}</span>
                            </span>
                            <span className="evidence-index">
                              E-{String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <strong>{item.title}</strong>
                          <p>{item.detail}</p>
                          {item.image && (
                            <div className="evidence-image-wrap">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="evidence-thumb"
                                loading="lazy"
                              />
                              <button
                                type="button"
                                className="evidence-zoom-btn"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setZoomedImage({
                                    src: item.image!,
                                    title: item.title,
                                    detail: item.detail,
                                  });
                                }}
                              >
                                <ZoomIn size={13} />
                                <span>Inspect image</span>
                              </button>
                            </div>
                          )}
                          <span className="evidence-action">
                            {picked ? (
                              <>
                                <Check size={13} /> COLLECTED
                              </>
                            ) : (
                              <>
                                <Plus size={13} /> COLLECT CLUE
                              </>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="No evidence added yet"
                    copy="Evidence items for this case will appear here once added."
                  />
                ))}

              {activeTab === 'Suspects' &&
                (activeCase.suspects.length > 0 ? (
                  <div className="suspect-grid">
                    {activeCase.suspects.map((suspect, index) => (
                      <article className="suspect-card" key={suspect.name}>
                        <div className="suspect-avatar">
                          {suspect.name
                            .split(' ')
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                        <span className="suspect-number">
                          PERSON OF INTEREST · 0{index + 1}
                        </span>
                        <h3>{suspect.name}</h3>
                        <small>{suspect.role}</small>
                        <p>{suspect.note}</p>
                        <span className="suspect-status">UNDER REVIEW</span>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No suspects listed yet"
                    copy="Suspect profiles for this case will appear here once added."
                  />
                ))}

              <div className="workspace-bottom">
                <div className="collected-summary">
                  <span className="locker-icon">
                    <LockKeyhole size={15} />
                  </span>
                  <div>
                    <strong>Evidence locker</strong>
                    <small>
                      {selectedEvidence.length} / {activeCase.evidence.length} clues collected
                    </small>
                  </div>
                  <span className="locker-count">
                    {String(selectedEvidence.length).padStart(2, '0')}
                  </span>
                </div>

                <button
                  type="button"
                  className="hint-button"
                  onClick={requestHint}
                  disabled={hintBusy || hintCount >= activeCase.hints.length}
                >
                  <Lightbulb size={15} />
                  <span>{hintBusy ? 'Unlocking hint...' : 'Use a hint'}</span>
                  <small>{activeCase.hints.length - hintCount} LEFT</small>
                </button>
              </div>

              {hintCount > 0 && (
                <div className="hints-stack">
                  {activeCase.hints.slice(0, hintCount).map((hintText, idx) => (
                    <div className="hint-reveal" key={idx}>
                      <Lightbulb size={15} />
                      <div>
                        <strong>FIELD NOTE · HINT {idx + 1}</strong>
                        <p>{hintText}</p>
                      </div>
                      <span>-5 PTS</span>
                    </div>
                  ))}
                </div>
              )}

              <form className="verdict-form" onSubmit={submitCase}>
                <label className="report-field">
                  <span>
                    SUMMARIZE THE ANSWER <small>{summaryMax} PTS · 500 CHARACTERS</small>
                  </span>
                  <textarea
                    maxLength={500}
                    value={report}
                    onChange={(event) => setReport(event.target.value)}
                    placeholder={
                      hasTimeline
                        ? 'Name the single culprit and summarize what they did (multiple culprit names reduce points · 50% of score).'
                        : 'Name the single culprit and summarize the decisive clue (100% of score · multiple culprit names reduce points).'
                    }
                  />
                </label>

                <button
                  className="button button-primary submit-verdict"
                  type="submit"
                  disabled={submissionBusy}
                >
                  {submissionBusy ? <span className="spinner" /> : <Flag size={16} />}
                  <span>
                    {submissionBusy ? 'Submitting to arena...' : 'Submit final verdict'}
                  </span>
                  <ArrowRight size={15} />
                </button>
                {!window.navigator.onLine && (
                  <p className="muted-copy">
                    You appear offline. Progress remains on this device until connection returns.
                  </p>
                )}
              </form>
            </>
          )}
        </section>

        {!result && (
          <aside className="workspace-side">
            <div className="side-panel">
              <div className="side-panel-heading">
                <div>
                  <span className="eyebrow">CASE FILE</span>
                  <h3>Incident details</h3>
                </div>
                <FileText size={17} />
              </div>
              <div className="case-facts">
                <div>
                  <span>DIFFICULTY · MAX SCORE</span>
                  <strong>{activeCase.difficulty.toUpperCase()} · {caseMaxScore} PTS</strong>
                </div>
                <div>
                  <span>ARENA TIME LIMIT</span>
                  <strong>{formatGameDurationLabel(configuredGameMinutes).toUpperCase()}</strong>
                </div>
                <div>
                  <span>SCORING SPLIT</span>
                  <strong>
                    {hasTimeline ? '50 SUMMARY + 50 SEQUENCE' : `100% SUMMARY (${summaryMax} PTS)`}
                  </strong>
                </div>
                <div>
                  <span>HINT PENALTY</span>
                  <strong>-5 / HINT</strong>
                </div>
              </div>
            </div>

            {hasTimeline && (
              <div className="side-panel timeline-panel">
                <div className="side-panel-heading">
                  <div>
                    <span className="eyebrow">SEQUENCE RECONSTRUCTION</span>
                    <h3>Timeline builder</h3>
                  </div>
                  <Activity size={17} />
                </div>
                <p className="timeline-help">
                  Use the arrows to arrange events chronologically (50 pts total ·{' '}
                  {Number((50 / Math.max(1, timelineOrder.length)).toFixed(1))} pts each).
                </p>
                <ol className="timeline-list">
                  {timelineOrder.map((event, index) => (
                    <li key={`${event}-${index}`}>
                      <span className="timeline-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="timeline-text">{event}</span>
                      <span className="timeline-controls">
                        <button
                          type="button"
                          aria-label={`Move ${event} earlier`}
                          disabled={index === 0}
                          onClick={() => shiftTimeline(index, -1)}
                        >
                          <ArrowLeft size={13} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${event} later`}
                          disabled={index === timelineOrder.length - 1}
                          onClick={() => shiftTimeline(index, 1)}
                        >
                          <ArrowRight size={13} />
                        </button>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="side-safe-note">
              <Shield size={15} />
              <span>
                Fictional training environment. Never test findings against real people or systems.
              </span>
            </div>
          </aside>
        )}
      </div>

      {zoomedImage && (
        <div
          className="image-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Inspect evidence: ${zoomedImage.title}`}
          onClick={() => setZoomedImage(null)}
        >
          <div className="image-lightbox-card" onClick={(event) => event.stopPropagation()}>
            <div className="image-lightbox-head">
              <div>
                <div className="eyebrow">VISUAL EVIDENCE INSPECTION</div>
                <h3>{zoomedImage.title}</h3>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close zoomed image"
                onClick={() => setZoomedImage(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="image-lightbox-body">
              <img src={zoomedImage.src} alt={zoomedImage.title} />
            </div>
            <p className="image-lightbox-caption">{zoomedImage.detail}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultPanel({
  result,
  gameCase,
  onBack,
}: {
  result: CaseScore;
  gameCase: InvestigationCase;
  onBack: () => void;
}) {
  const hasTimeline = (result.totalTimeline ?? gameCase.timeline.length) > 0;
  const caseMaxScore = result.maxScore ?? getCaseMaxScore(gameCase.difficulty);
  const summaryMax = hasTimeline ? 50 : caseMaxScore;

  return (
    <section className="result-panel">
      <div className="result-mark">
        <Trophy size={26} />
      </div>
      <div className="eyebrow">
        VERDICT VERIFIED · CASE CLOSED ({gameCase.difficulty.toUpperCase()})
      </div>
      <h2>
        {result.score ?? 0}
        <span> / {caseMaxScore}</span>
      </h2>
      <p>{result.message || 'Your investigation has been checked by the arena.'}</p>

      <div className="result-stats">
        <div>
          <span>CASE</span>
          <strong>{gameCase.title}</strong>
        </div>
        {typeof result.summaryScore === 'number' && (
          <div>
            <span>ANSWER SUMMARY ({hasTimeline ? '50 PTS' : `${summaryMax} PTS`})</span>
            <strong>
              {result.summaryScore} / {summaryMax}
            </strong>
          </div>
        )}
        {hasTimeline && typeof result.sequenceScore === 'number' && (
          <div>
            <span>SEQUENCE (50 PTS)</span>
            <strong>{result.sequenceScore} / 50</strong>
          </div>
        )}
        <div>
          <span>VERDICT STATUS</span>
          <strong>SCORE RECORDED</strong>
        </div>
        <div>
          <span>HINTS USED</span>
          <strong>{result.hintsUsed ?? 0}</strong>
        </div>
      </div>

      {result.submittedSummary ? (
        <div className="explanation-list">
          <h3>Your submitted answer summary</h3>
          <div className="debrief-item is-correct">
            <span className="debrief-icon">
              <FileText size={14} />
            </span>
            <div>
              <strong>Team conclusion</strong>
              <p>{result.submittedSummary}</p>
            </div>
          </div>
        </div>
      ) : null}

      {result.explanations && result.explanations.length > 0 && (
        <div className="explanation-list">
          <h3>Official answer summary &amp; debrief</h3>
          {result.explanations.map((item, idx) => {
            const label = item.title || `Finding ${idx + 1}`;
            const isCorrect = item.correct !== false;
            return (
              <div
                key={`${label}-${idx}`}
                className={`debrief-item ${isCorrect ? 'is-correct' : 'is-wrong'}`}
              >
                <span className="debrief-icon">
                  {isCorrect ? <Check size={14} /> : <X size={14} />}
                </span>
                <div>
                  <strong>{label}</strong>
                  <p>{item.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button className="button button-primary" onClick={onBack}>
        <ArrowLeft size={15} />
        <span>Return to Play Investigation</span>
      </button>
    </section>
  );
}

function HistoryView({
  completed,
  cases: caseList,
  openCase,
}: {
  completed: string[];
  cases: InvestigationCase[];
  openCase: (c: InvestigationCase) => void;
}) {
  const historyCases = caseList.filter((gameCase) => completed.includes(gameCase.id));
  return (
    <>
      <PageHeading
        eyebrow="PERSONAL CASE FILES"
        title="My History"
        description="Review closed cases or return to an investigation you have not completed."
      />
      {historyCases.length ? (
        <div className="case-grid">
          {historyCases.map((gameCase) => (
            <CaseTile
              key={gameCase.id}
              gameCase={gameCase}
              onClick={() => openCase(gameCase)}
              completed
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Your record is still open"
          copy="Completed investigations will be listed here."
        />
      )}
    </>
  );
}

function AdminView({
  admin,
  hasLiveEvent,
  isGamePaused,
  isGameEnded,
  configuredGameMinutes,
  registeredCount,
  games,
  leaderboard,
  onAdminRankings,
  exportResults,
  invoke,
  setNotice,
  unlockAdmin,
  lockAdmin,
  refreshArenaData,
  onNewGameCreated,
}: {
  admin: boolean;
  hasLiveEvent: boolean;
  isGamePaused: boolean;
  isGameEnded: boolean;
  configuredGameMinutes: number;
  registeredCount: number | null;
  games: GameLobby[];
  leaderboard: RankingEntry[];
  onAdminRankings: (rows: RankingEntry[]) => void;
  exportResults: (entriesOverride?: RankingEntry[]) => void;
  invoke: <T = Record<string, unknown>>(name: string, data?: Record<string, unknown>) => Promise<T>;
  setNotice: (v: string) => void;
  unlockAdmin: (passcode: string) => Promise<void>;
  lockAdmin: () => void;
  refreshArenaData: (explicit?: boolean) => Promise<void>;
  onNewGameCreated: () => void;
}) {
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });
  const [durationInput, setDurationInput] = useState<string>(String(configuredGameMinutes));
  const [launchBusy, setLaunchBusy] = useState(false);
  const [confirmPauseOpen, setConfirmPauseOpen] = useState(false);
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [announceBusy, setAnnounceBusy] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [teams, setTeams] = useState<AdminTeamSummary[]>([]);
  const [teamsError, setTeamsError] = useState('');
  const [teamsSyncing, setTeamsSyncing] = useState(false);
  const [leaderSearch, setLeaderSearch] = useState('');

  const allParticipantLeaderboard = useMemo(() => {
    const merged: RankingEntry[] = leaderboard
      .filter((entry) => Boolean(entry.teamName || entry.teamId))
      .map((entry) => ({
        ...entry,
        mode: entry.mode || 'Team',
        caseScores: { ...(entry.caseScores || {}) },
      }));

    const seenTeamIds = new Set(
      merged.map((entry) => entry.teamId || entry.id).filter(Boolean)
    );
    const seenTeamNames = new Set(
      merged.map((entry) => (entry.teamName || '').trim().toLowerCase()).filter(Boolean)
    );

    for (const team of teams) {
      const normalizedName = team.name.trim().toLowerCase();
      if (seenTeamIds.has(team.id) || (normalizedName && seenTeamNames.has(normalizedName))) {
        continue;
      }
      merged.push({
        id: `team_${team.id}`,
        teamId: team.id,
        teamName: team.name,
        mode: 'Team',
        score: 0,
        elapsedSeconds: 0,
        caseScores: {},
      });
    }

    merged.sort((a, b) => {
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      const aCases = Object.keys(a.caseScores || {}).length;
      const bCases = Object.keys(b.caseScores || {}).length;
      if (bCases !== aCases) return bCases - aCases;
      if (aCases > 0 && bCases > 0 && (a.elapsedSeconds || 0) !== (b.elapsedSeconds || 0)) {
        return (a.elapsedSeconds || 0) - (b.elapsedSeconds || 0);
      }
      return (a.teamName || '').localeCompare(b.teamName || '');
    });

    return merged.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
  }, [leaderboard, teams]);

  const filteredLeaderboard = useMemo(
    () =>
      allParticipantLeaderboard.filter((score) =>
        `${score.teamName || ''}`.toLowerCase().includes(leaderSearch.toLowerCase())
      ),
    [allParticipantLeaderboard, leaderSearch]
  );
  const podium = allParticipantLeaderboard.slice(0, 3);

  useEffect(() => {
    setDurationInput(String(configuredGameMinutes));
  }, [configuredGameMinutes]);

  useEffect(() => {
    if (!confirmPauseOpen && !confirmEndOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setConfirmPauseOpen(false);
        setConfirmEndOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmPauseOpen, confirmEndOpen]);

  const handleAdminError = useCallback(
    (error: unknown, fallback: string) => {
      const msg = error instanceof Error ? error.message : fallback;
      if (msg.includes('Administrator access required')) {
        lockAdmin();
        setNotice('Admin session expired. Please unlock again with your passcode.');
        return;
      }
      setNotice(msg);
    },
    [lockAdmin, setNotice]
  );

  const loadTeams = useCallback(async () => {
    setTeamsSyncing(true);
    try {
      const result = await invoke<{
        teams?: AdminTeamSummary[];
        rankings?: Record<string, unknown>[];
      }>('adminListTeams', {});
      setTeams(result.teams || []);
      if (Array.isArray(result.rankings)) {
        onAdminRankings(result.rankings.map(mapRanking));
      }
      setTeamsError('');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to load registered participants.';
      setTeamsError(msg);
      handleAdminError(error, 'Unable to load teams.');
    } finally {
      setTeamsSyncing(false);
    }
  }, [invoke, handleAdminError, onAdminRankings]);

  const refreshAdminBoard = useCallback(async (explicit = false) => {
    await Promise.all([loadTeams(), refreshArenaData(explicit)]);
  }, [loadTeams, refreshArenaData]);

  const refreshAdminBoardRef = useRef(refreshAdminBoard);
  refreshAdminBoardRef.current = refreshAdminBoard;
  const adminInitialLoadedRef = useRef(false);

  useEffect(() => {
    if (!admin) {
      adminInitialLoadedRef.current = false;
      return undefined;
    }
    if (adminInitialLoadedRef.current) return undefined;
    adminInitialLoadedRef.current = true;
    void refreshAdminBoardRef.current(false);
    return undefined;
  }, [admin]);

  const handleUnlock = async (event: FormEvent) => {
    event.preventDefault();
    setUnlockBusy(true);
    setUnlockError('');
    try {
      await unlockAdmin(passcode);
      setPasscode('');
    } catch (error) {
      setUnlockError(error instanceof Error ? error.message : 'Invalid organizer passcode.');
    } finally {
      setUnlockBusy(false);
    }
  };

  const applyGameDurationAndGoLive = async (minutes: number, announcementLabel: string) => {
    const mins = clampGameDurationMinutes(minutes);
    const gameTitle = `Cyber Mystery Arena (${mins}m)`;
    const existingNonEnded = games.find((game) => game.status !== 'ended');
    const matchingExisting =
      existingNonEnded && parseDurationMinutesFromGame(existingNonEnded) === mins
        ? existingNonEnded
        : null;

    if (matchingExisting) {
      await invoke('adminSetGameStatus', {
        gameId: matchingExisting.id,
        status: 'live',
        durationMinutes: mins,
        name: gameTitle,
      });
    } else {
      const created = await invoke<GameLobby>('adminCreateGame', {
        name: gameTitle,
        caseId: cases[0].id,
        durationMinutes: mins,
      });
      await invoke('adminSetGameStatus', {
        gameId: created.id,
        status: 'live',
        durationMinutes: mins,
        name: gameTitle,
      });
      const olderGames = games.filter((game) => game.id !== created.id && game.status !== 'ended');
      await Promise.all(
        olderGames.map((game) => invoke('adminSetGameStatus', { gameId: game.id, status: 'ended' }))
      );
      onNewGameCreated();
    }
    setDurationInput(String(mins));
    setNotice(announcementLabel.replace('{mins}', String(mins)));
  };

  const toggleArenaLaunch = async () => {
    setLaunchBusy(true);
    try {
      if (hasLiveEvent) {
        const liveGames = games.filter((game) => game.status === 'live');
        await Promise.all(
          liveGames.map((game) => invoke('adminSetGameStatus', { gameId: game.id, status: 'paused' }))
        );
        setNotice('Game paused. Case files are now hidden from participants.');
      } else {
        const mins = clampGameDurationMinutes(durationInput, configuredGameMinutes);
        await applyGameDurationAndGoLive(
          mins,
          'Game started ({mins} min)! All 30 case files are now unlocked for participants.'
        );
      }
      await refreshArenaData();
    } catch (error) {
      handleAdminError(error, 'Unable to update game launch state.');
    } finally {
      setLaunchBusy(false);
    }
  };

  const endArenaGame = async () => {
    setLaunchBusy(true);
    try {
      const activeGames = games.filter((game) => game.status !== 'ended');
      await Promise.all(
        activeGames.map((game) => invoke('adminSetGameStatus', { gameId: game.id, status: 'ended' }))
      );
      setNotice('Game ended. All case files are closed and standings are finalized.');
      await refreshArenaData();
    } catch (error) {
      handleAdminError(error, 'Unable to end the game.');
    } finally {
      setLaunchBusy(false);
    }
  };

  const hasEndableGame = games.some((game) => game.status !== 'ended');

  const updateLiveDuration = async () => {
    const mins = clampGameDurationMinutes(durationInput, configuredGameMinutes);
    setLaunchBusy(true);
    try {
      await applyGameDurationAndGoLive(
        mins,
        'Total game time updated to {mins} minutes across all connected participants.'
      );
      await refreshArenaData();
    } catch (error) {
      handleAdminError(error, 'Unable to update total game time.');
    } finally {
      setLaunchBusy(false);
    }
  };

  const parsedDurationInput = clampGameDurationMinutes(durationInput, configuredGameMinutes);
  const durationPresets = [15, 30, 45, 60, 90, 120, 180];

  const publishAnnouncement = async (event: FormEvent) => {
    event.preventDefault();
    setAnnounceBusy(true);
    try {
      await invoke('adminAnnounce', announcement);
      setAnnouncement({ title: '', message: '' });
      setNotice('Announcement published.');
      await refreshArenaData();
    } catch (error) {
      handleAdminError(error, 'Unable to publish announcement.');
    } finally {
      setAnnounceBusy(false);
    }
  };

  if (!admin) {
    return (
      <div className="empty-state admin-locked">
        <LockKeyhole size={26} />
        <h2>Administrator access required</h2>
        <p>Enter the organizer passcode to unlock the Arena Control Room.</p>
        <form className="admin-unlock-form" onSubmit={handleUnlock}>
          <input
            type="password"
            required
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            placeholder="Organizer passcode"
            aria-label="Organizer passcode"
          />
          <button className="button button-primary" disabled={unlockBusy}>
            <KeyRound size={15} />
            <span>{unlockBusy ? 'Verifying...' : 'Unlock admin'}</span>
          </button>
        </form>
        {unlockError && (
          <p className="auth-error">
            <ShieldAlert size={14} />
            <span>{unlockError}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <PageHeading
        eyebrow="RESTRICTED · ADMINISTRATOR ACCESS"
        title="Arena control room"
        description="Manage live game access, total game time, teams, and announcements. Case answers and score validation remain server-controlled."
        action={
          <div className="admin-header-actions">
            <button
              className="button button-outline"
              onClick={() => exportResults(allParticipantLeaderboard)}
            >
              <ArrowDown size={15} />
              <span>Export Excel (.xlsx)</span>
            </button>
            <button className="button button-outline" onClick={lockAdmin}>
              <LockKeyhole size={15} />
              <span>Lock admin</span>
            </button>
          </div>
        }
      />

      <div
        className={`admin-launch-banner ${
          hasLiveEvent ? 'is-live' : ''
        } backdrop-blur-md`}
      >
        <div className="archive-photo-backdrop" aria-hidden="true">
          <img src={caseArchiveBackdropImg} alt="" referrerPolicy="no-referrer" />
        </div>
        <div>
          <div className="eyebrow">
            {hasLiveEvent
              ? 'GAME LIVE · PARTICIPANT ACCESS OPEN'
              : isGameEnded
              ? 'GAME ENDED · EVENT CLOSED'
              : isGamePaused
              ? 'GAME PAUSED · TIMERS FROZEN'
              : 'GAME LOCKED · WAITING TO START'}
          </div>
          <h2>
            {hasLiveEvent
              ? `All 30 case files are visible (${formatGameDurationLabel(configuredGameMinutes)} game)`
              : isGameEnded
              ? 'Game ended — standings finalized'
              : isGamePaused
              ? `Game paused — cases hidden & timers stopped (${parsedDurationInput}m)`
              : `Set total game time (${formatGameDurationLabel(parsedDurationInput)}) and start`}
          </h2>
          <p>
            {hasLiveEvent
              ? `Participants have ${formatGameDurationLabel(configuredGameMinutes)} total with no per-case timer. You can adjust total time below anytime.`
              : isGameEnded
              ? 'All case files are closed for this event. Export results or start a new game below.'
              : isGamePaused
              ? 'Participant timers are frozen and cases are sealed. Click Resume game to continue or End game to close the event.'
              : 'Choose the total arena duration in minutes, then click Start game to unlock all cases.'}
          </p>
        </div>
        <div className="admin-launch-controls">
          <div className="admin-duration-row">
            <div className="admin-duration-field">
              <label htmlFor="admin-game-duration">GAME TIME</label>
              <input
                id="admin-game-duration"
                type="number"
                min={1}
                max={300}
                value={durationInput}
                onChange={(event) => setDurationInput(event.target.value)}
                onBlur={() => setDurationInput(String(clampGameDurationMinutes(durationInput, configuredGameMinutes)))}
                aria-label="Total game duration in minutes"
              />
              <span>min</span>
            </div>
            <div className="admin-duration-presets" role="group" aria-label="Quick game duration presets">
              {durationPresets.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  className={`admin-preset-btn ${parsedDurationInput === mins ? 'is-active' : ''}`}
                  onClick={() => setDurationInput(String(mins))}
                >
                  {mins === 120 ? '2h (120m)' : mins === 180 ? '3h (180m)' : `${mins}m`}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-launch-buttons">
            {hasLiveEvent && (
              <button
                type="button"
                className="button button-primary"
                disabled={launchBusy || parsedDurationInput === configuredGameMinutes}
                onClick={() => void updateLiveDuration()}
              >
                <Clock3 size={15} />
                <span>{launchBusy ? 'Updating...' : `Update time (${parsedDurationInput}m)`}</span>
              </button>
            )}
            <button
              type="button"
              className={`button ${hasLiveEvent ? 'button-outline' : 'button-primary'}`}
              disabled={launchBusy}
              onClick={() => {
                if (hasLiveEvent) {
                  setConfirmPauseOpen(true);
                } else {
                  void toggleArenaLaunch();
                }
              }}
            >
              {hasLiveEvent ? <Pause size={15} /> : <Zap size={15} />}
              <span>
                {launchBusy
                  ? 'Updating...'
                  : hasLiveEvent
                  ? 'Pause game & hide cases'
                  : isGamePaused
                  ? `Resume game (${parsedDurationInput}m)`
                  : isGameEnded
                  ? `Start new game (${parsedDurationInput}m)`
                  : `Start game (${parsedDurationInput}m)`}
              </span>
            </button>
            {hasEndableGame && (
              <button
                type="button"
                className="button button-warning"
                disabled={launchBusy}
                onClick={() => setConfirmEndOpen(true)}
              >
                <Square size={14} />
                <span>{launchBusy ? 'Ending...' : 'End game'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="admin-metrics">
        <Metric
          label="REGISTERED TEAMS"
          value={Math.max(teams.length, registeredCount ?? 0) || '—'}
          icon={Users}
          accent="cyan"
        />
        <Metric
          label="ARENA STATUS"
          value={hasLiveEvent ? 'LIVE' : isGameEnded ? 'ENDED' : isGamePaused ? 'PAUSED' : 'LOCKED'}
          icon={Radio}
          accent="lime"
        />
        <Metric
          label="LEADERBOARD ENTRIES"
          value={allParticipantLeaderboard.length}
          icon={Check}
          accent="orange"
        />
      </div>

      <section
        className="admin-leaderboard-section"
        aria-labelledby="admin-leaderboard-heading"
      >
        <div className="leaderboard-controls">
          <label className="search-box">
            <Search size={16} />
            <input
              value={leaderSearch}
              onChange={(event) => setLeaderSearch(event.target.value)}
              placeholder="Filter participants on leaderboard"
              aria-label="Filter participants on leaderboard"
            />
          </label>
          <div className="admin-leaderboard-actions">
            <span className="live-updating">{teamsSyncing ? 'SYNCING...' : 'MANUAL SYNC'}</span>
            <button
              type="button"
              className="button button-outline"
              disabled={teamsSyncing}
              onClick={() => void refreshAdminBoard(true)}
            >
              <Radio size={15} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={() => exportResults(allParticipantLeaderboard)}
            >
              <ArrowDown size={15} />
              <span>Export Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {teamsError && (
          <p className="auth-error">
            <ShieldAlert size={14} />
            <span>{teamsError}</span>
          </p>
        )}

        {podium.length > 0 && (
          <div className="podium-grid">
            {[podium[1], podium[0], podium[2]].filter(Boolean).map((team) => {
              const rank = team.rank;
              return (
                <div className={`podium-card podium-${rank}`} key={team.id}>
                  <span className="podium-crown">
                    {rank === 1 ? <Trophy size={18} /> : `0${rank}`}
                  </span>
                  <div className="podium-avatar">
                    {(team.teamName || '?').slice(0, 1).toUpperCase()}
                  </div>
                  <strong>{team.teamName || 'Team'}</strong>
                  <small>
                    {Object.keys(team.caseScores || {}).length} CASE
                    {Object.keys(team.caseScores || {}).length === 1 ? '' : 'S'}
                  </small>
                  <b>
                    {team.score || 0}
                    <small> PTS</small>
                  </b>
                </div>
              );
            })}
          </div>
        )}

        <div className="leaderboard-table-wrap backdrop-blur-md">
          <div className="table-heading">
            <div>
              <span className="eyebrow">ADMIN CONSOLE ONLY · EVERY PARTICIPANT&apos;S RANK &amp; SCORE</span>
              <h2 id="admin-leaderboard-heading">
                Leaderboard <small>{filteredLeaderboard.length} of {allParticipantLeaderboard.length} participants</small>
              </h2>
              <p className="muted-copy">
                Note: All participants&apos; ranks and scores are shown here and visible only in the Admin Console.
              </p>
            </div>
            <span className="current-rank">
              <Trophy size={15} />
              TOTAL PARTICIPANTS <b>{allParticipantLeaderboard.length}</b>
            </span>
          </div>

          {filteredLeaderboard.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>PARTICIPANT / TEAM</th>
                    <th>CASES</th>
                    <th>SCORE</th>
                    <th>TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.map((team) => {
                    const solvedCount = Object.keys(team.caseScores || {}).length;
                    return (
                      <tr key={team.id}>
                        <td>
                          <span className={`rank-number ${team.rank <= 3 ? 'top-rank' : ''}`}>
                            {String(team.rank).padStart(2, '0')}
                          </span>
                        </td>
                        <td>
                          <span className="table-player">
                            <span className="table-avatar">
                              {(team.teamName || '?').slice(0, 1).toUpperCase()}
                            </span>
                            {team.teamName || 'Team'}
                          </span>
                        </td>
                        <td className="tabular-cell">{solvedCount}</td>
                        <td className="score-cell">
                          {team.score || 0}
                          <small> PTS</small>
                        </td>
                        <td className="tabular-cell">
                          {team.elapsedSeconds
                            ? `${Math.floor(team.elapsedSeconds / 60)}:${String(
                                team.elapsedSeconds % 60
                              ).padStart(2, '0')}`
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Trophy}
              title={
                allParticipantLeaderboard.length
                  ? 'No matching participants'
                  : 'No registered participants yet'
              }
              copy={
                allParticipantLeaderboard.length
                  ? 'Try clearing or changing your leaderboard search filter.'
                  : 'Every registered participant rank and score will appear here automatically.'
              }
            />
          )}
        </div>
      </section>

      <div className="admin-grid">
        <section className="section-block admin-block backdrop-blur-md">
          <div className="section-heading">
            <div>
              <div className="eyebrow">TEAM ROSTER</div>
              <h2>Registered teams</h2>
            </div>
            <button type="button" className="text-link" onClick={() => void refreshAdminBoard()}>
              Refresh teams <ArrowRight size={14} />
            </button>
          </div>

          {teams.length > 0 ? (
            <div className="participant-list">
              {teams.map((team) => (
                <div key={team.id}>
                  <span>{team.name}</span>
                  <small>{team.memberCount === 1 ? '1 player' : `${team.memberCount} players`}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No registered teams loaded yet.</p>
          )}
        </section>

        <section className="section-block admin-block backdrop-blur-md">
          <div className="section-heading">
            <div>
              <div className="eyebrow">ARENA DISPATCHES</div>
              <h2>Publish announcement</h2>
            </div>
            <Bell size={17} />
          </div>
          <form className="admin-form" onSubmit={publishAnnouncement}>
            <label>
              TITLE
              <input
                required
                maxLength={80}
                value={announcement.title}
                onChange={(event) =>
                  setAnnouncement({ ...announcement, title: event.target.value })
                }
              />
            </label>
            <label>
              MESSAGE
              <textarea
                required
                maxLength={400}
                value={announcement.message}
                onChange={(event) =>
                  setAnnouncement({ ...announcement, message: event.target.value })
                }
              />
            </label>
            <button className="button button-outline" disabled={announceBusy}>
              <span>{announceBusy ? 'Publishing...' : 'Publish announcement'}</span>
              <Send size={14} />
            </button>
          </form>
        </section>
      </div>

      {confirmPauseOpen && (
        <div
          className="arena-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-pause-title"
          onClick={() => setConfirmPauseOpen(false)}
        >
          <div
            className="arena-modal-card is-compact backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="arena-modal-head">
              <div>
                <div className="eyebrow">CONFIRM LIVE ACTION</div>
                <h3 id="confirm-pause-title">Pause game &amp; hide all cases?</h3>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Cancel pause confirmation"
                onClick={() => setConfirmPauseOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="muted-copy">
              Participants will immediately lose access to all 30 case files and all timers will
              freeze until you resume the game from this console.
            </p>

            <div className="arena-modal-actions">
              <button
                type="button"
                className="button button-outline"
                disabled={launchBusy}
                onClick={() => setConfirmPauseOpen(false)}
              >
                <span>Cancel</span>
              </button>
              <button
                type="button"
                className="button button-warning"
                disabled={launchBusy}
                onClick={() => {
                  setConfirmPauseOpen(false);
                  void toggleArenaLaunch();
                }}
              >
                <ShieldAlert size={15} />
                <span>{launchBusy ? 'Pausing...' : 'Confirm pause'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmEndOpen && (
        <div
          className="arena-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-end-title"
          onClick={() => setConfirmEndOpen(false)}
        >
          <div
            className="arena-modal-card is-compact backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="arena-modal-head">
              <div>
                <div className="eyebrow">FINALIZE EVENT</div>
                <h3 id="confirm-end-title">End the current game?</h3>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Cancel end game confirmation"
                onClick={() => setConfirmEndOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="muted-copy">
              This closes the active game session, locks all case files for participants, stops
              every timer, and finalizes current leaderboard standings. You can start a new game
              afterward.
            </p>

            <div className="arena-modal-actions">
              <button
                type="button"
                className="button button-outline"
                disabled={launchBusy}
                onClick={() => setConfirmEndOpen(false)}
              >
                <span>Cancel</span>
              </button>
              <button
                type="button"
                className="button button-warning"
                disabled={launchBusy}
                onClick={() => {
                  setConfirmEndOpen(false);
                  void endArenaGame();
                }}
              >
                <Square size={14} />
                <span>{launchBusy ? 'Ending...' : 'Confirm end game'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: typeof Zap;
  accent: 'lime' | 'cyan' | 'orange' | 'blue';
}) {
  return (
    <div className={`metric-card metric-${accent} backdrop-blur-md`}>
      <span className="metric-icon">
        <Icon size={17} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
      <span className="metric-line" />
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof Search;
  title: string;
  copy: string;
}) {
  return (
    <div className="empty-state">
      <Icon size={24} />
      <h3>{title}</h3>
      <p>{copy}</p>
    </div>
  );
}
