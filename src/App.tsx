import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  CircleHelp,
  Clock3,
  Code2,
  Copy,
  Database,
  Eye,
  FileText,
  Fingerprint,
  Flag,
  Globe2,
  KeyRound,
  LayoutDashboard,
  Lightbulb,
  LockKeyhole,
  Mail,
  Menu,
  Moon,
  Plus,
  Radio,
  Search,
  Send,
  Settings2,
  Shield,
  ShieldAlert,
  Sparkles,
  Sun,
  Swords,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { cases, type InvestigationCase } from './cases';
import { isAdminUser, supabase, supabaseConfigured } from './supabase.js';

type PageName =
  | 'Home'
  | 'Dashboard'
  | 'Play Investigation'
  | 'Leaderboard'
  | 'My History'
  | 'Investigation'
  | 'Admin';

interface TeamInfo {
  id: string;
  name: string;
  inviteCode: string;
}

interface CaseScore {
  score: number;
  hintsUsed?: number;
  elapsedSeconds?: number;
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
  inviteCode?: string;
  participantCount?: number;
  caseId?: string;
  status?: string;
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
  { label: 'Home', icon: LayoutDashboard },
  { label: 'Dashboard', icon: Activity },
  { label: 'Play Investigation', icon: Swords },
  { label: 'Leaderboard', icon: Trophy },
  { label: 'My History', icon: BookOpen },
];

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

function stored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
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
  teamName: (row.team_name as string) ?? (row.teamName as string),
  memberIds: (row.member_ids as string[]) ?? (row.memberIds as string[]),
  ownerId: (row.owner_id as string) ?? (row.ownerId as string),
  elapsedSeconds: (row.elapsed_seconds as number) ?? (row.elapsedSeconds as number),
  caseScores: (row.case_scores as Record<string, CaseScore>) ?? (row.caseScores as Record<string, CaseScore>),
});

const mapGame = (row: Record<string, unknown>): GameLobby => ({
  ...(row as unknown as GameLobby),
  inviteCode: (row.invite_code as string) ?? (row.inviteCode as string),
  participantCount: (row.participant_count as number) ?? (row.participantCount as number),
  caseId: (row.case_id as string) ?? (row.caseId as string),
  createdAt: (row.created_at as string) ?? (row.createdAt as string),
});

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

export default function App() {
  const [page, setPage] = useState<PageName>('Home');
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(!supabaseConfigured);
  const [useLocalBackend, setUseLocalBackend] = useState(!supabaseConfigured);
  const localBackendRef = useRef(!supabaseConfigured);
  const [activeCase, setActiveCase] = useState<InvestigationCase | null>(null);
  const [report, setReport] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<number[]>([]);
  const [timelineOrder, setTimelineOrder] = useState<string[]>([]);
  const [hintCount, setHintCount] = useState(0);
  const [sessionReady, setSessionReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<CaseScore | null>(null);
  const [submissionBusy, setSubmissionBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [teamEntryError, setTeamEntryError] = useState('');
  const [teamBusy, setTeamBusy] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<RankingEntry[]>([]);
  const [games, setGames] = useState<GameLobby[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [registeredCount, setRegisteredCount] = useState<number | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => stored('arena-theme', 'dark'));
  const [muted, setMuted] = useState<boolean>(() => stored('arena-muted', true));
  const [mobileMenu, setMobileMenu] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setTeamEntryError('Supabase is not configured. Add your project URL and publishable key to .env.local.');
      return undefined;
    }
    const client = supabase;
    let creatingAnonymousSession = false;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setAdmin(isAdminUser(currentUser));
      setAuthReady(true);
      if (event === 'INITIAL_SESSION' && !currentUser && !creatingAnonymousSession) {
        creatingAnonymousSession = true;
        window.setTimeout(() => {
          client.auth
            .signInAnonymously()
            .then(({ error }) => {
              if (error) setTeamEntryError(error.message);
            })
            .catch((error: unknown) =>
              setTeamEntryError(error instanceof Error ? error.message : 'Anonymous sign-in failed.')
            );
        }, 0);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const activateLocalBackend = useCallback(() => {
    if (!localBackendRef.current) {
      localBackendRef.current = true;
      setUseLocalBackend(true);
    }
  }, []);

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
    [user?.id]
  );

  useEffect(() => {
    if (!user) return undefined;
    if (!supabase || useLocalBackend) {
      let active = true;
      const applyState = (payload: {
        rankings?: Record<string, unknown>[];
        games?: Record<string, unknown>[];
        announcements?: Record<string, unknown>[];
        stats?: { registered_teams?: number };
      }) => {
        if (!active) return;
        setLeaderboard((payload.rankings || []).map(mapRanking));
        setGames((payload.games || []).map(mapGame));
        setAnnouncements((payload.announcements || []).map(mapAnnouncement));
        if (typeof payload.stats?.registered_teams === 'number') {
          setRegisteredCount(payload.stats.registered_teams);
        }
      };

      const loadLocalState = async () => {
        try {
          const response = await fetch('/api/state', {
            headers: { 'x-arena-player': user.id },
          });
          if (!response.ok) return;
          const payload = (await response.json()) as {
            rankings?: Record<string, unknown>[];
            games?: Record<string, unknown>[];
            announcements?: Record<string, unknown>[];
            stats?: { registered_teams?: number };
          };
          applyState(payload);
        } catch {
          // Keep existing state if offline.
        }
      };

      void loadLocalState();
      if (typeof EventSource === 'undefined') return undefined;
      const source = new EventSource('/api/stream');
      source.addEventListener('state', (event) => {
        try {
          const payload = JSON.parse((event as MessageEvent<string>).data) as {
            rankings?: Record<string, unknown>[];
            games?: Record<string, unknown>[];
            announcements?: Record<string, unknown>[];
            stats?: { registered_teams?: number };
          };
          applyState(payload);
        } catch {
          // Ignore malformed stream events.
        }
      });
      return () => {
        active = false;
        source.close();
      };
    }

    const client = supabase;
    const isMissingTableError = (err: { code?: string; message?: string } | null) =>
      Boolean(
        err &&
          (err.code === 'PGRST205' ||
            err.code === '42P01' ||
            err.message?.includes('schema cache'))
      );

    const loadRankings = async () => {
      const { data, error } = await client
        .from('rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(500);
      if (isMissingTableError(error)) {
        activateLocalBackend();
        return;
      }
      if (!error) setLeaderboard((data || []).map(mapRanking));
    };
    const loadGames = async () => {
      const { data, error } = await client
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (isMissingTableError(error)) {
        activateLocalBackend();
        return;
      }
      if (!error) setGames((data || []).map(mapGame));
    };
    const loadAnnouncements = async () => {
      const { data, error } = await client
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      if (isMissingTableError(error)) {
        activateLocalBackend();
        return;
      }
      if (!error) setAnnouncements((data || []).map(mapAnnouncement));
    };
    const reload = () => {
      void loadRankings();
      void loadGames();
      void loadAnnouncements();
    };
    reload();
    const channel = client
      .channel('arena-data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rankings' }, loadRankings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, loadGames)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        loadAnnouncements
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, [user, useLocalBackend, activateLocalBackend]);

  useEffect(() => {
    if (!supabase || useLocalBackend) return undefined;
    const client = supabase;
    const loadStats = async () => {
      const { data, error } = await client
        .from('stats')
        .select('registered_teams')
        .eq('id', 1)
        .maybeSingle();
      if (
        error &&
        (error.code === 'PGRST205' ||
          error.code === '42P01' ||
          error.message?.includes('schema cache'))
      ) {
        activateLocalBackend();
        return;
      }
      if (!error) setRegisteredCount(data?.registered_teams ?? 0);
    };
    void loadStats();
    const channel = client
      .channel('arena-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stats' }, loadStats)
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, [useLocalBackend, activateLocalBackend]);

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
      if (typeof EventSource === 'undefined') return undefined;
      const source = new EventSource('/api/stream');
      source.addEventListener('session', (event) => {
        try {
          const payload = JSON.parse((event as MessageEvent<string>).data) as {
            teamId?: string;
            caseId?: string;
            lastWriter?: string;
          };
          if (
            payload.teamId === teamInfo.id &&
            payload.caseId === activeCase.id &&
            payload.lastWriter !== user.id
          ) {
            void loadLocalSession();
          }
        } catch {
          // Ignore malformed stream payload.
        }
      });
      return () => {
        active = false;
        source.close();
      };
    }

    const client = supabase;
    const loadSession = async () => {
      const { data, error } = await client
        .from('sessions')
        .select('*')
        .eq('team_id', teamInfo.id)
        .eq('case_id', activeCase.id)
        .maybeSingle();
      const session = data && mapSession(data as Record<string, unknown>);
      if (error || !session?.progress || session.lastWriter === user.id) return;
      if (typeof session.progress.report === 'string') {
        setReport(session.progress.report);
      }
      setSelectedEvidence(session.progress.selectedEvidence || []);
      if (session.progress.timelineOrder?.length) {
        setTimelineOrder(session.progress.timelineOrder);
      }
      setHintCount(session.hintsUsed || 0);
    };
    void loadSession();
    const channel = client
      .channel(`session:${teamInfo.id}:${activeCase.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions', filter: `team_id=eq.${teamInfo.id}` },
        loadSession
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, [user, teamInfo, activeCase, page, useLocalBackend]);

  const invoke = useCallback(
    async <T = Record<string, unknown>>(
      name: string,
      data: Record<string, unknown> = {}
    ): Promise<T> => {
      if (!supabase || localBackendRef.current) {
        return callLocalArena<T>(name, data);
      }
      const { data: response, error } = await supabase.functions.invoke('arena', {
        body: { action: name, ...data },
      });
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
        const edgeUnavailable =
          !errorContext ||
          error.name === 'FunctionsFetchError' ||
          error.message.includes('Failed to send a request to the Edge Function') ||
          (errorContext.status === 404 && !parsedBody?.error) ||
          parsedBody?.code === 'NOT_FOUND';

        if (edgeUnavailable) {
          activateLocalBackend();
          return callLocalArena<T>(name, data);
        }
        throw new Error(parsedBody?.error || parsedBody?.message || error.message);
      }
      return response as T;
    },
    [activateLocalBackend, callLocalArena]
  );

  useEffect(() => {
    if (!user) {
      setTeamInfo(null);
      setTeamLoading(false);
      return undefined;
    }
    let active = true;
    setTeamLoading(true);
    setTeamEntryError('');
    invoke<{ teams?: TeamInfo[] }>('listMyTeams')
      .then((data) => {
        if (active) setTeamInfo(data?.teams?.[0] || null);
      })
      .catch((error: unknown) => {
        if (active) {
          setTeamEntryError(error instanceof Error ? error.message : 'Unable to load team.');
        }
      })
      .finally(() => {
        if (active) setTeamLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, invoke]);

  useEffect(() => {
    if (!supabase || useLocalBackend || !user || !teamInfo) return undefined;
    const client = supabase;
    const channel = client.channel(`presence:${teamInfo.id}`, {
      config: { private: true, presence: { key: user.id } },
    });
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        void channel.track({
          userId: user.id,
          state: 'online',
          onlineAt: new Date().toISOString(),
        });
      }
    });
    return () => {
      void client.removeChannel(channel);
    };
  }, [user, teamInfo, useLocalBackend]);

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
    if (!sessionReady || !user || result) return undefined;
    const timeout = window.setTimeout(() => {
      void invoke('saveInvestigationProgress', {
        caseId: activeCase.id,
        teamId: teamInfo?.id || null,
        report,
        selectedEvidence,
        timelineOrder,
      }).catch(() => {});
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [activeCase, report, selectedEvidence, timelineOrder, hintCount, sessionReady, user, teamInfo, result, invoke]);

  useEffect(() => {
    if (!activeCase || result) return undefined;
    const ticker = window.setInterval(() => setElapsed((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(ticker);
  }, [activeCase, result]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('arena-theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('arena-muted', JSON.stringify(muted));
  }, [muted]);

  const completed = useMemo(() => {
    const localCompleted = stored<string[]>('arena-completed', []);
    const teamRanking = leaderboard.find(
      (score) => score.mode === 'Team' && (user?.id ? score.memberIds?.includes(user.id) : false)
    );
    const serverClosed = teamRanking ? Object.keys(teamRanking.caseScores || {}) : [];
    return [...new Set([...localCompleted, ...serverClosed])];
  }, [leaderboard, user, result]);

  const filteredScores = useMemo(
    () =>
      leaderboard.filter(
        (score) =>
          score.mode === 'Team' &&
          `${score.teamName || ''}`.toLowerCase().includes(search.toLowerCase())
      ),
    [leaderboard, search]
  );

  const teamScore =
    leaderboard.find(
      (score) => score.mode === 'Team' && (user?.id ? score.memberIds?.includes(user.id) : false)
    )?.score ?? 0;

  const myRank =
    leaderboard
      .filter((score) => score.mode === 'Team')
      .findIndex(
        (score) =>
          user?.id && (score.ownerId === user.id || score.memberIds?.includes(user.id))
      ) + 1;

  const secondsRemaining = Math.max(0, (activeCase?.duration || 0) * 60 - elapsed);
  const timer = `${String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:${String(
    secondsRemaining % 60
  ).padStart(2, '0')}`;



  const openCase = async (gameCase: InvestigationCase) => {
    if (!teamInfo) {
      setNotice('Register or join a team before starting an investigation.');
      return;
    }
    const previousScore = leaderboard.find(
      (score) =>
        Object.hasOwn(score.caseScores || {}, gameCase.id) &&
        (user?.id ? score.memberIds?.includes(user.id) : false)
    );
    if (previousScore) {
      setActiveCase(gameCase);
      setPage('Investigation');
      setResult({
        ...(previousScore.caseScores?.[gameCase.id] || { score: 0 }),
        message: 'This case is already closed. Your verified result is shown below.',
      });
      setSessionReady(false);
      return;
    }
    const localProgress = stored<{
      caseId?: string;
      report?: string;
      selectedEvidence?: number[];
      timelineOrder?: string[];
    } | null>('arena-progress', null);
    const resumeLocal = localProgress?.caseId === gameCase.id ? localProgress : null;
    setActiveCase(gameCase);
    setPage('Investigation');
    setSessionReady(false);
    setReport(resumeLocal?.report || '');
    setSelectedEvidence(resumeLocal?.selectedEvidence || []);
    setTimelineOrder(
      resumeLocal?.timelineOrder?.length ? resumeLocal.timelineOrder : [...gameCase.timeline]
    );
    setHintCount(0);
    setElapsed(0);
    setResult(null);
    setNotice('');
    playSignal(muted, 540);
    try {
      const session = await invoke<{
        progress?: {
          report?: string;
          selectedEvidence?: number[];
          timelineOrder?: string[];
        };
        hintsUsed?: number;
        elapsedSeconds?: number;
      }>('beginInvestigation', { caseId: gameCase.id, teamId: teamInfo?.id || null });
      const remoteProgress = session.progress || {};
      const hasRemote =
        (remoteProgress.selectedEvidence?.length || 0) > 0 ||
        Boolean(remoteProgress.report) ||
        (remoteProgress.timelineOrder?.length || 0) > 0;
      if (hasRemote) {
        setReport(remoteProgress.report || '');
        setSelectedEvidence(remoteProgress.selectedEvidence || []);
        setTimelineOrder(
          remoteProgress.timelineOrder?.length
            ? remoteProgress.timelineOrder
            : [...gameCase.timeline]
        );
      }
      setHintCount(session.hintsUsed || 0);
      setElapsed(session.elapsedSeconds || 0);
      setSessionReady(true);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to start investigation.');
    }
  };

  const requestHint = async () => {
    if (!activeCase || hintCount >= activeCase.hints.length) return;
    try {
      const response = await invoke<{ hintsUsed: number }>('useInvestigationHint', {
        caseId: activeCase.id,
        teamId: teamInfo?.id || null,
      });
      setHintCount(response.hintsUsed);
      playSignal(muted, 480);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to unlock hint.');
    }
  };

  const submitCase = async (event: FormEvent) => {
    event.preventDefault();
    if (!teamInfo || !activeCase) {
      setNotice('Register or join a team before submitting a verdict.');
      return;
    }
    setSubmissionBusy(true);
    setNotice('');
    try {
      const response = await invoke<CaseScore>('submitInvestigation', {
        caseId: activeCase.id,
        selectedEvidence,
        timelineOrder,
        report,
        teamId: teamInfo?.id || null,
      });
      setResult(response);
      playSignal(muted, 760);
      const nextCompleted = [...new Set([...completed, activeCase.id])];
      localStorage.setItem('arena-completed', JSON.stringify(nextCompleted));
      localStorage.removeItem('arena-progress');
      setNotice('Verdict submitted and verified by the arena server.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Submission failed.');
    } finally {
      setSubmissionBusy(false);
    }
  };

  const createTeam = async (event: FormEvent) => {
    event.preventDefault();
    setTeamBusy(true);
    setTeamEntryError('');
    try {
      const data = await invoke<TeamInfo>('createTeam', { name: teamName.trim() });
      setTeamInfo(data);
      setTeamCode(data.inviteCode);
    } catch (error) {
      setTeamEntryError(error instanceof Error ? error.message : 'Unable to register team.');
    } finally {
      setTeamBusy(false);
    }
  };

  const joinTeam = async (event: FormEvent) => {
    event.preventDefault();
    setTeamBusy(true);
    setTeamEntryError('');
    try {
      const data = await invoke<TeamInfo>('joinTeam', {
        inviteCode: teamCode.trim().toUpperCase(),
      });
      setTeamInfo(data);
    } catch (error) {
      setTeamEntryError(error instanceof Error ? error.message : 'Unable to join team.');
    } finally {
      setTeamBusy(false);
    }
  };

  const joinGame = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const data = await invoke<GameLobby>('joinGame', {
        inviteCode: joinCode.trim().toUpperCase(),
      });
      const assignedCase = cases.find((gameCase) => gameCase.id === data.caseId);
      if (assignedCase) await openCase(assignedCase);
      else setNotice(`Joined game ${data.name}. The assigned case is unavailable in this version.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to join event.');
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

  const copyTeamInvite = () => {
    if (!teamInfo) return;
    void navigator.clipboard?.writeText(teamInfo.inviteCode).then(() => {
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1800);
    });
  };

  const exportResults = () => {
    const header = ['Rank', 'Team', 'Score', 'Completion time'];
    const rows = leaderboard
      .filter((item) => item.mode === 'Team')
      .map((item, index) => [
        index + 1,
        item.teamName || '',
        item.score || 0,
        item.elapsedSeconds || '',
      ]);
    const csv = [header, ...rows]
      .map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'cyber-mystery-results.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const goTo = (label: PageName) => {
    setPage(label);
    setActiveCase(null);
    setMobileMenu(false);
    setNotice('');
  };

  if (!teamInfo) {
    return (
      <TeamRegistration
        user={user}
        authReady={authReady}
        supabaseConfigured={supabaseConfigured}
        teamBusy={teamBusy}
        teamLoading={teamLoading}
        teamEntryError={teamEntryError}
        teamName={teamName}
        setTeamName={setTeamName}
        teamCode={teamCode}
        setTeamCode={setTeamCode}
        createTeam={createTeam}
        joinTeam={joinTeam}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

  const hasLiveEvent = games.some((game) => game.status === 'live');

  return (
    <div className="app-shell">
      <div className="ambient-grid" aria-hidden="true" />
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <button
          className="brand-lockup"
          onClick={() => goTo('Home')}
          aria-label="Cyber Mystery Arena home"
        >
          <span className="brand-mark">
            <ShieldAlert size={20} />
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

        {admin && (
          <button
            className={`nav-link admin-link ${page === 'Admin' ? 'active' : ''}`}
            onClick={() => goTo('Admin')}
          >
            <Settings2 size={17} />
            <span>Admin console</span>
          </button>
        )}

        <div className="side-bottom">
          <div className="account-chip">
            <span className="avatar">{teamInfo.name.slice(0, 1).toUpperCase()}</span>
            <span className="account-label">
              <strong>{teamInfo.name}</strong>
              <small>INVITE · {teamInfo.inviteCode}</small>
            </span>
            <button
              type="button"
              className="chip-icon-btn"
              title="Copy team invite code"
              aria-label="Copy team invite code"
              onClick={copyTeamInvite}
            >
              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </aside>

      {mobileMenu && (
        <div
          className="mobile-backdrop"
          aria-hidden="true"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <main className="main-area">
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
            <div className={`event-indicator ${hasLiveEvent ? 'is-live' : ''}`}>
              <Radio size={13} />
              <span>{hasLiveEvent ? 'LIVE EVENT' : 'OPEN INVESTIGATIONS'}</span>
            </div>
            <button
              className="icon-button"
              aria-label="Toggle light or dark appearance"
              title="Toggle appearance"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
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

        <AnimatePresence mode="wait">
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
                report={report}
                setReport={setReport}
                selectedEvidence={selectedEvidence}
                setSelectedEvidence={setSelectedEvidence}
                timelineOrder={timelineOrder}
                shiftTimeline={shiftTimeline}
                hintCount={hintCount}
                requestHint={requestHint}
                timer={timer}
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
                    leaderboard={leaderboard}
                    registeredCount={registeredCount}
                    completed={completed}
                    openCase={openCase}
                    setPage={goTo}
                    setJoinCode={setJoinCode}
                    joinCode={joinCode}
                    joinGame={joinGame}
                  />
                )}
                {page === 'Dashboard' && (
                  <DashboardView
                    teamInfo={teamInfo}
                    teamScore={teamScore}
                    myRank={myRank}
                    completed={completed}
                    cases={cases}
                    openCase={openCase}
                    setPage={goTo}
                  />
                )}
                {page === 'Play Investigation' && (
                  <CaseLibrary
                    visibleCases={cases}
                    openCase={openCase}
                    completed={completed}
                    search={search}
                    setSearch={setSearch}
                  />
                )}
                {page === 'Leaderboard' && (
                  <LeaderboardView
                    filteredScores={filteredScores}
                    search={search}
                    setSearch={setSearch}
                    myRank={myRank}
                    exportResults={exportResults}
                    admin={admin}
                  />
                )}
                {page === 'My History' && (
                  <HistoryView completed={completed} cases={cases} openCase={openCase} />
                )}
              </>
            )}

            {page === 'Admin' && (
              <AdminView
                admin={admin}
                games={games}
                leaderboard={leaderboard}
                exportResults={exportResults}
                invoke={invoke}
                setNotice={setNotice}
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
  teamBusy,
  teamLoading,
  teamEntryError,
  teamName,
  setTeamName,
  teamCode,
  setTeamCode,
  createTeam,
  joinTeam,
  theme,
  setTheme,
}: {
  user: User | null;
  authReady: boolean;
  supabaseConfigured: boolean;
  teamBusy: boolean;
  teamLoading: boolean;
  teamEntryError: string;
  teamName: string;
  setTeamName: (v: string) => void;
  teamCode: string;
  setTeamCode: (v: string) => void;
  createTeam: (e: FormEvent) => void;
  joinTeam: (e: FormEvent) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
}) {
  const unavailable = !user || !authReady || !supabaseConfigured || teamBusy || teamLoading;
  return (
    <main className="team-entry-shell">
      <div className="ambient-grid" aria-hidden="true" />
      <button
        type="button"
        className="icon-button entry-theme-btn"
        aria-label="Toggle light or dark appearance"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <section className="team-entry-card">
        <span className="brand-mark team-entry-mark">
          <ShieldAlert size={20} />
        </span>
        <div className="eyebrow">TEAM ACCESS · ARENA</div>
        <h1>Register your team.</h1>
        <p>
          Enter your team name to start. Teammates can join from their own devices with the
          invitation code.
        </p>

        {teamLoading || !authReady ? (
          <div className="setup-callout">
            <span className="spinner" />
            <span>Preparing secure team access…</span>
          </div>
        ) : null}

        {!supabaseConfigured && (
          <div className="setup-callout">
            <LockKeyhole size={17} />
            <span>Connect Supabase and enable Anonymous sign-in to register or join a team.</span>
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
          <button className="button button-primary" disabled={unavailable}>
            <Users size={15} />
            <span>{teamBusy ? 'Registering…' : 'Register team'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="team-entry-divider">
          <span />
          OR JOIN AN EXISTING TEAM
          <span />
        </div>

        <form className="team-entry-form" onSubmit={joinTeam}>
          <label htmlFor="team-code">
            TEAM INVITATION CODE
            <input
              id="team-code"
              required
              minLength={4}
              maxLength={12}
              value={teamCode}
              onChange={(event) => setTeamCode(event.target.value.toUpperCase())}
              placeholder="Enter the code from your team lead"
            />
          </label>
          <button className="button button-outline" disabled={unavailable}>
            <KeyRound size={15} />
            <span>{teamBusy ? 'Joining…' : 'Join team'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <p className="team-entry-footnote">
          <Shield size={12} />
          <span>
            A Supabase anonymous account remembers this browser&apos;s team session. Clearing
            browser data loses access to that account.
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
  leaderboard,
  registeredCount,
  completed,
  openCase,
  setPage,
  joinCode,
  setJoinCode,
  joinGame,
}: {
  cases: InvestigationCase[];
  games: GameLobby[];
  announcements: AnnouncementItem[];
  leaderboard: RankingEntry[];
  registeredCount: number | null;
  completed: string[];
  openCase: (c: InvestigationCase) => void;
  setPage: (p: PageName) => void;
  joinCode: string;
  setJoinCode: (v: string) => void;
  joinGame: (e: FormEvent) => void;
}) {
  const featured = caseList.find((gameCase) => !completed.includes(gameCase.id)) || caseList[0];
  const top = leaderboard.filter((score) => score.mode === 'Team').slice(0, 3);
  const liveGamesCount = games.filter((game) => game.status === 'live').length;

  return (
    <>
      <section className="hero-panel">
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
              <Swords size={16} />
              <span>Enter the arena</span>
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="hero-proof">
            <span>
              <b>{caseList.length}</b> original cases
            </span>
            <span>
              <b>2–4</b> per team
            </span>
            <span>
              <b>Live</b> team rankings
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
          <div className="radar-coordinate">
            37° 46&apos; 49.2&quot; N
            <br />
            122° 25&apos; 09.6&quot; W
          </div>
        </div>
        <div className="hero-index">
          01 <span>/</span> {String(caseList.length).padStart(2, '0')}
        </div>
      </section>

      <section className="stats-strip">
        <div className="stat-block">
          <span className="stat-icon">
            <Users size={17} />
          </span>
          <div>
            <strong>{registeredCount === null ? '—' : registeredCount.toLocaleString()}</strong>
            <small>REGISTERED TEAMS</small>
          </div>
        </div>
        <div className="stat-block">
          <span className="stat-icon">
            <FileText size={17} />
          </span>
          <div>
            <strong>{caseList.length}</strong>
            <small>CASE FILES</small>
          </div>
        </div>
        <div className="stat-block">
          <span className="stat-icon">
            <Trophy size={17} />
          </span>
          <div>
            <strong>{top[0]?.score ?? '—'}</strong>
            <small>TOP SCORE</small>
          </div>
        </div>
        <div className="stat-block">
          <span className="stat-icon">
            <Radio size={17} />
          </span>
          <div>
            <strong>{liveGamesCount || '—'}</strong>
            <small>LIVE EVENTS</small>
          </div>
        </div>
      </section>

      <div className="content-grid home-grid">
        <section className="section-block featured-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">CASE FILE · {featured.id.toUpperCase()}</div>
              <h2>Pick up the trail</h2>
            </div>
            <button className="text-link" onClick={() => setPage('Play Investigation')}>
              All case files <ArrowRight size={14} />
            </button>
          </div>
          <CaseTile
            gameCase={featured}
            onClick={() => openCase(featured)}
            completed={completed.includes(featured.id)}
            featured
          />
        </section>

        <section className="section-block event-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">FIELD OPERATIONS</div>
              <h2>Join an event</h2>
            </div>
            <span className="mini-live">LOBBY</span>
          </div>
          <form className="join-code-form" onSubmit={joinGame}>
            <label htmlFor="event-code">INVITATION CODE</label>
            <div className="input-action">
              <input
                id="event-code"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="e.g. ARENA26"
                maxLength={12}
              />
              <button aria-label="Join event" type="submit">
                <ArrowRight size={17} />
              </button>
            </div>
          </form>

          {games.length ? (
            games.slice(0, 2).map((game) => (
              <div className="lobby-row" key={game.id}>
                <span className="lobby-glyph">
                  <Radio size={16} />
                </span>
                <div>
                  <strong>{game.name}</strong>
                  <small>{game.participantCount || 0} investigators</small>
                </div>
                <span className={`game-status ${game.status === 'live' ? 'is-live' : ''}`}>
                  {game.status || 'open'}
                </span>
              </div>
            ))
          ) : (
            <div className="empty-lobby">
              <span className="empty-line" />
              <p>No live operations at the moment.</p>
              <small>Enter an invite code from your event organizer.</small>
            </div>
          )}
        </section>
      </div>

      <div className="content-grid lower-grid">
        <section className="section-block">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE INVESTIGATION LOOP</div>
              <h2>How to play</h2>
            </div>
            <span className="section-number">01—04</span>
          </div>
          <div className="steps-grid">
            {[
              [
                '01',
                'Choose your case',
                'Open an active case file and start an investigation with your team.',
              ],
              [
                '02',
                'Read the evidence',
                'Inspect the synthetic records and collect the clues that matter.',
              ],
              [
                '03',
                'Reconstruct the timeline',
                'Arrange events chronologically, review suspects, and use hints carefully.',
              ],
              [
                '04',
                'Submit a verdict',
                "The arena verifies your team's work and updates the live rankings.",
              ],
            ].map(([number, title, copy]) => (
              <div className="step-item" key={number}>
                <span>{number}</span>
                <strong>{title}</strong>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-block announcement-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">ARENA DISPATCHES</div>
              <h2>Latest intel</h2>
            </div>
            <Bell size={16} />
          </div>
          {announcements.length ? (
            announcements.map((item) => (
              <article className="dispatch" key={item.id}>
                <span className="dispatch-dot" />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <small>{formatAnnouncementDate(item.createdAt)}</small>
                </div>
              </article>
            ))
          ) : (
            <div className="dispatch empty-dispatch">
              <span className="dispatch-dot" />
              <div>
                <strong>All channels quiet</strong>
                <p>New event announcements will appear here.</p>
                <small>STANDING BY</small>
              </div>
            </div>
          )}
          <div className="slogan-line">
            <Sparkles size={14} /> EVERY CLUE MATTERS · EVERY DECISION COUNTS
          </div>
        </section>
      </div>
    </>
  );
}

function DashboardView({
  teamInfo,
  teamScore,
  myRank,
  completed,
  cases: caseList,
  openCase,
  setPage,
}: {
  teamInfo: TeamInfo;
  teamScore: number;
  myRank: number;
  completed: string[];
  cases: InvestigationCase[];
  openCase: (c: InvestigationCase) => void;
  setPage: (p: PageName) => void;
}) {
  const nextCase = caseList.find((gameCase) => !completed.includes(gameCase.id)) || caseList[0];
  return (
    <>
      <PageHeading
        eyebrow="TEAM FIELD DESK"
        title={`${teamInfo.name}'s investigation desk`}
        description="A clear view of your team's investigations, progress, and standing in the arena."
        action={
          <button className="button button-primary" onClick={() => setPage('Play Investigation')}>
            <Swords size={15} />
            <span>Start an investigation</span>
          </button>
        }
      />
      <div className="metric-grid">
        <Metric label="TEAM POINTS" value={teamScore} icon={Zap} accent="lime" />
        <Metric label="CASES CLOSED" value={completed.length} icon={Check} accent="cyan" />
        <Metric label="TEAM RANK" value={myRank ? `#${myRank}` : '—'} icon={Trophy} accent="orange" />
        <Metric
          label="TEAM STANDING"
          value={completed.length >= caseList.length ? 'COMPLETED' : 'ACTIVE'}
          icon={Shield}
          accent="blue"
        />
      </div>

      <div className="content-grid dashboard-grid">
        <section className="section-block">
          <div className="section-heading">
            <div>
              <div className="eyebrow">RECOMMENDED NEXT</div>
              <h2>{nextCase.title}</h2>
            </div>
          </div>
          <CaseTile
            gameCase={nextCase}
            onClick={() => openCase(nextCase)}
            completed={completed.includes(nextCase.id)}
            featured
          />
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
            <div className="eyebrow">TEAM INVITATION</div>
            <p>
              Share code <strong className="mono-inline">{teamInfo.inviteCode}</strong> so teammates
              can join <strong>{teamInfo.name}</strong> from their own devices.
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
}: {
  visibleCases: InvestigationCase[];
  openCase: (c: InvestigationCase) => void;
  completed: string[];
  search: string;
  setSearch: (v: string) => void;
}) {
  const foundCases = visibleCases.filter((gameCase) =>
    `${gameCase.title} ${gameCase.subtitle} ${gameCase.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  return (
    <>
      <PageHeading
        eyebrow={`CASE ARCHIVE · ${visibleCases.length} FILES`}
        title="Play Investigation"
        description="Every case is a self-contained fictional simulation. Collect clues, connect the timeline, and submit your verdict."
        action={
          <div className="case-total">
            <strong>{foundCases.length.toString().padStart(2, '0')}</strong>
            <small>AVAILABLE FILES</small>
          </div>
        }
      />

      <div className="library-tools">
        <label className="search-box">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search case files"
            aria-label="Search case files"
          />
        </label>
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
          copy="Try another case title or category keyword."
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
  return (
    <motion.button
      className={`case-card ${featured ? 'case-featured' : ''} tone-${gameCase.color}`}
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
          <Clock3 size={14} />
          {gameCase.duration} MIN
        </span>
        <span>
          <FileText size={14} />
          {gameCase.evidence.length} EVIDENCE
        </span>
        <span className="case-cta">
          {completed ? (
            <>
              <Check size={14} /> CLOSED
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
  report,
  setReport,
  selectedEvidence,
  setSelectedEvidence,
  timelineOrder,
  shiftTimeline,
  hintCount,
  requestHint,
  timer,
  result,
  submitCase,
  submissionBusy,
  goTo,
}: {
  activeCase: InvestigationCase;
  report: string;
  setReport: (v: string) => void;
  selectedEvidence: number[];
  setSelectedEvidence: React.Dispatch<React.SetStateAction<number[]>>;
  timelineOrder: string[];
  shiftTimeline: (index: number, direction: -1 | 1) => void;
  hintCount: number;
  requestHint: () => void;
  timer: string;
  result: CaseScore | null;
  submitCase: (e: FormEvent) => void;
  submissionBusy: boolean;
  goTo: (p: PageName) => void;
}) {
  const [activeTab, setActiveTab] = useState<'Evidence' | 'Suspects'>('Evidence');
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

  return (
    <div className="investigation-layout">
      <div className="investigation-top">
        <button className="back-link" onClick={() => goTo('Play Investigation')}>
          <ArrowLeft size={15} />
          <span>CASE ARCHIVE</span>
        </button>
        <div className="investigation-status">
          {result ? 'CASE CLOSED' : 'CASE IN PROGRESS'}
        </div>
        <div className="case-timer">
          <Clock3 size={15} />
          <strong>{timer}</strong>
          <small>REMAINING</small>
        </div>
      </div>

      <div className="case-title-row">
        <div>
          <div className="eyebrow">{activeCase.category.toUpperCase()}</div>
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
              onBack={() => goTo('Leaderboard')}
            />
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
                    onClick={() => setActiveTab(tab)}
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
                      return (
                        <button
                          type="button"
                          key={item.title}
                          className={`evidence-card ${picked ? 'evidence-picked' : ''}`}
                          onClick={() => toggleEvidence(index)}
                        >
                          <div className="evidence-meta">
                            <span>{item.type}</span>
                            <span className="evidence-index">
                              E-{String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <strong>{item.title}</strong>
                          <p>{item.detail}</p>
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
                        </button>
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
                  disabled={hintCount >= activeCase.hints.length}
                >
                  <Lightbulb size={15} />
                  <span>Use a hint</span>
                  <small>{activeCase.hints.length - hintCount} LEFT</small>
                </button>
              </div>

              {hintCount > 0 && (
                <div className="hint-reveal">
                  <Lightbulb size={15} />
                  <div>
                    <strong>FIELD NOTE · HINT {hintCount}</strong>
                    <p>{activeCase.hints[hintCount - 1]}</p>
                  </div>
                  <span>-5 PTS</span>
                </div>
              )}

              <form className="verdict-form" onSubmit={submitCase}>
                <label className="report-field">
                  <span>
                    FINAL INVESTIGATION REPORT <small>OPTIONAL · 500 CHARACTERS</small>
                  </span>
                  <textarea
                    maxLength={500}
                    value={report}
                    onChange={(event) => setReport(event.target.value)}
                    placeholder="Summarize your conclusion and cite the clues that support it."
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
                  <span>EVIDENCE FILES</span>
                  <strong>{activeCase.evidence.length} ITEMS</strong>
                </div>
                <div>
                  <span>TIME LIMIT</span>
                  <strong>{activeCase.duration} MIN</strong>
                </div>
                <div>
                  <span>POINTS AVAILABLE</span>
                  <strong>100 PTS</strong>
                </div>
                <div>
                  <span>HINT PENALTY</span>
                  <strong>-5 / HINT</strong>
                </div>
              </div>
            </div>

            <div className="side-panel timeline-panel">
              <div className="side-panel-heading">
                <div>
                  <span className="eyebrow">SEQUENCE RECONSTRUCTION</span>
                  <h3>Timeline builder</h3>
                </div>
                <Activity size={17} />
              </div>
              <p className="timeline-help">
                Use the arrows to arrange events in chronological order.
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

            <div className="side-safe-note">
              <Shield size={15} />
              <span>
                Fictional training environment. Never test findings against real people or systems.
              </span>
            </div>
          </aside>
        )}
      </div>
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
  return (
    <section className="result-panel">
      <div className="result-mark">
        <Trophy size={26} />
      </div>
      <div className="eyebrow">VERDICT VERIFIED · CASE CLOSED</div>
      <h2>
        {result.score ?? 0}
        <span> / 100</span>
      </h2>
      <p>{result.message || 'Your investigation has been checked by the arena.'}</p>

      <div className="result-stats">
        <div>
          <span>CASE</span>
          <strong>{gameCase.title}</strong>
        </div>
        <div>
          <span>RANKING</span>
          <strong>{result.rank ? `#${result.rank}` : 'Leaderboard updated'}</strong>
        </div>
        <div>
          <span>HINTS USED</span>
          <strong>{result.hintsUsed ?? 0}</strong>
        </div>
      </div>

      {result.explanations && result.explanations.length > 0 && (
        <div className="explanation-list">
          <h3>Case debrief</h3>
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
        <span>Return to arena rankings</span>
        <ArrowRight size={15} />
      </button>
    </section>
  );
}

function LeaderboardView({
  filteredScores,
  search,
  setSearch,
  myRank,
  exportResults,
  admin,
}: {
  filteredScores: RankingEntry[];
  search: string;
  setSearch: (v: string) => void;
  myRank: number;
  exportResults: () => void;
  admin: boolean;
}) {
  const podium = filteredScores.slice(0, 3);
  return (
    <>
      <PageHeading
        eyebrow="LIVE RANKINGS · SERVER-VERIFIED"
        title="Leaderboard"
        description="Scores update only after a case verdict is checked by the arena server."
        action={
          admin && (
            <button className="button button-outline" onClick={exportResults}>
              <ArrowDown size={15} />
              <span>Export CSV</span>
            </button>
          )
        }
      />

      <div className="leaderboard-controls">
        <label className="search-box">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find team"
            aria-label="Search teams"
          />
        </label>
        <span className="live-updating">LIVE UPDATING</span>
      </div>

      {podium.length > 0 && (
        <div className="podium-grid">
          {[podium[1], podium[0], podium[2]].filter(Boolean).map((team) => {
            const actualIndex = filteredScores.findIndex((entry) => entry.id === team.id);
            const rank = actualIndex + 1;
            return (
              <div className={`podium-card podium-${rank}`} key={team.id}>
                <span className="podium-crown">
                  {rank === 1 ? <Trophy size={18} /> : `0${rank}`}
                </span>
                <div className="podium-avatar">
                  {(team.teamName || '?').slice(0, 1).toUpperCase()}
                </div>
                <strong>{team.teamName || 'Team'}</strong>
                <small>ARENA TEAM</small>
                <b>
                  {team.score || 0}
                  <small> PTS</small>
                </b>
              </div>
            );
          })}
        </div>
      )}

      <section className="leaderboard-table-wrap">
        <div className="table-heading">
          <div>
            <span className="eyebrow">ARENA STANDINGS</span>
            <h2>
              Team rankings <small>{filteredScores.length} entries</small>
            </h2>
          </div>
          <span className="current-rank">
            <Trophy size={15} />
            TEAM RANK <b>{myRank ? `#${myRank}` : '—'}</b>
          </span>
        </div>

        {filteredScores.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>TEAM</th>
                  <th>SCORE</th>
                  <th>TIME</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.map((team, index) => (
                  <tr key={team.id}>
                    <td>
                      <span className={`rank-number ${index < 3 ? 'top-rank' : ''}`}>
                        {String(index + 1).padStart(2, '0')}
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
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="No verified scores yet"
            copy="Complete an investigation and your team score will appear here."
          />
        )}
      </section>
    </>
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
  games,
  leaderboard,
  exportResults,
  invoke,
  setNotice,
}: {
  admin: boolean;
  games: GameLobby[];
  leaderboard: RankingEntry[];
  exportResults: () => void;
  invoke: <T = Record<string, unknown>>(name: string, data?: Record<string, unknown>) => Promise<T>;
  setNotice: (v: string) => void;
}) {
  const [eventForm, setEventForm] = useState({
    name: '',
    caseId: cases[0].id,
    inviteCode: '',
    status: 'open',
  });
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [teams, setTeams] = useState<AdminTeamSummary[]>([]);

  const createEvent = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await invoke<GameLobby>('adminCreateGame', eventForm);
      setNotice(`Event created with invitation code ${result.inviteCode}.`);
      setEventForm({ name: '', caseId: cases[0].id, inviteCode: '', status: 'open' });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to create event.');
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (gameId: string, status: string) => {
    try {
      await invoke('adminSetGameStatus', { gameId, status });
      setNotice(`Event status changed to ${status}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to update event status.');
    }
  };

  const publishAnnouncement = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await invoke('adminAnnounce', announcement);
      setAnnouncement({ title: '', message: '' });
      setNotice('Announcement published.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to publish announcement.');
    }
  };

  const loadTeams = async () => {
    try {
      const result = await invoke<{ teams?: AdminTeamSummary[] }>('adminListTeams', {});
      setTeams(result.teams || []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to load teams.');
    }
  };

  if (!admin) {
    return (
      <div className="empty-state admin-locked">
        <LockKeyhole size={26} />
        <h2>Administrator access required</h2>
        <p>This panel is restricted to accounts with the Supabase app metadata admin claim.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeading
        eyebrow="RESTRICTED · ADMINISTRATOR ACCESS"
        title="Arena control room"
        description="Manage events and announcements. Case answers and score validation remain server-controlled."
        action={
          <button className="button button-outline" onClick={exportResults}>
            <ArrowDown size={15} />
            <span>Export results</span>
          </button>
        }
      />

      <div className="admin-metrics">
        <Metric label="REGISTERED TEAMS" value={teams.length || '—'} icon={Users} accent="cyan" />
        <Metric
          label="ACTIVE EVENTS"
          value={games.filter((game) => game.status === 'live').length}
          icon={Radio}
          accent="lime"
        />
        <Metric
          label="RANKED TEAMS"
          value={leaderboard.filter((entry) => entry.mode === 'Team').length}
          icon={Check}
          accent="orange"
        />
      </div>

      <div className="admin-grid">
        <section className="section-block admin-block">
          <div className="section-heading">
            <div>
              <div className="eyebrow">EVENT OPERATIONS</div>
              <h2>Create event lobby</h2>
            </div>
            <Radio size={17} />
          </div>
          <form className="admin-form" onSubmit={createEvent}>
            <label>
              EVENT NAME
              <input
                required
                maxLength={60}
                value={eventForm.name}
                onChange={(event) => setEventForm({ ...eventForm, name: event.target.value })}
                placeholder="Campus Cyber Fest"
              />
            </label>
            <label>
              INVESTIGATION
              <select
                value={eventForm.caseId}
                onChange={(event) => setEventForm({ ...eventForm, caseId: event.target.value })}
              >
                {cases.map((gameCase) => (
                  <option value={gameCase.id} key={gameCase.id}>
                    {gameCase.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              INVITE CODE
              <input
                maxLength={12}
                value={eventForm.inviteCode}
                onChange={(event) =>
                  setEventForm({ ...eventForm, inviteCode: event.target.value.toUpperCase() })
                }
                placeholder="AUTO-GENERATE"
              />
            </label>
            <button className="button button-primary" disabled={busy}>
              <span>{busy ? 'Creating...' : 'Create invitation lobby'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </section>

        <section className="section-block admin-block">
          <div className="section-heading">
            <div>
              <div className="eyebrow">LOBBY MONITOR</div>
              <h2>Event control</h2>
            </div>
            <button type="button" className="text-link" onClick={loadTeams}>
              Load teams <ArrowRight size={14} />
            </button>
          </div>
          {games.length ? (
            games.map((game) => (
              <div className="admin-event-row" key={game.id}>
                <div>
                  <strong>{game.name}</strong>
                  <small>{game.inviteCode || 'No invite code'}</small>
                </div>
                <span className={`game-status ${game.status === 'live' ? 'is-live' : ''}`}>
                  {game.status}
                </span>
                <div className="event-control-buttons">
                  <button
                    type="button"
                    onClick={() => changeStatus(game.id, 'live')}
                    title="Start event"
                    aria-label="Start event"
                  >
                    <Zap size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => changeStatus(game.id, 'paused')}
                    title="Pause event"
                    aria-label="Pause event"
                  >
                    <Clock3 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => changeStatus(game.id, 'ended')}
                    title="End event"
                    aria-label="End event"
                  >
                    <Flag size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="muted-copy">No event lobbies created yet.</p>
          )}

          {teams.length > 0 && (
            <div className="participant-list">
              {teams.map((team) => (
                <div key={team.id}>
                  <span>{team.name}</span>
                  <small>{team.memberCount} members</small>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="section-block admin-block">
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
            <button className="button button-outline">
              <span>Publish announcement</span>
              <Send size={14} />
            </button>
          </form>
        </section>
      </div>
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
    <div className={`metric-card metric-${accent}`}>
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
