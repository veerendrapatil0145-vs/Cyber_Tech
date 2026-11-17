import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
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
  LogOut,
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
import { cases, type InvestigationCase } from './cases';
import {
  fetchArenaState,
  fetchSession,
  getOrCreatePlayerId,
  getStoredAdminToken,
  invokeArena,
  setStoredAdminToken,
  subscribeArenaStream,
  type Announcement,
  type CaseScore,
  type GameLobby,
  type RankingEntry,
  type TeamInfo,
} from './arenaClient';

type PageName =
  | 'Home'
  | 'Dashboard'
  | 'Play Investigation'
  | 'Leaderboard'
  | 'My History'
  | 'Investigation'
  | 'Admin';

interface AdminTeamSummary {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
  createdAt: string;
}

type AnswersState = Record<string, number | string | undefined> & { report?: string };

const navigation: Array<{ label: Exclude<PageName, 'Investigation' | 'Admin'>; icon: typeof LayoutDashboard }> = [
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

export default function App() {
  const playerId = useMemo(() => getOrCreatePlayerId(), []);
  const [page, setPage] = useState<PageName>('Home');
  const [admin, setAdmin] = useState<boolean>(() => Boolean(getStoredAdminToken()));
  const [difficulty, setDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [activeCase, setActiveCase] = useState<InvestigationCase | null>(null);
  const [answers, setAnswers] = useState<AnswersState>({});
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
  const [teamLoading, setTeamLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<RankingEntry[]>([]);
  const [games, setGames] = useState<GameLobby[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
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

  const loadArenaState = useCallback(async () => {
    try {
      const state = await fetchArenaState();
      setLeaderboard(state.rankings || []);
      setGames(state.games || []);
      setAnnouncements(state.announcements || []);
      setRegisteredCount(state.stats?.registered_teams ?? 0);
      setAdmin(Boolean(state.isAdmin));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Failed to load arena state.');
    }
  }, []);

  useEffect(() => {
    let active = true;
    setTeamLoading(true);
    setTeamEntryError('');

    Promise.all([
      invokeArena<{ teams: TeamInfo[] }>('listMyTeams'),
      fetchArenaState(),
    ])
      .then(([teamRes, stateRes]) => {
        if (!active) return;
        setTeamInfo(teamRes.teams?.[0] || null);
        setLeaderboard(stateRes.rankings || []);
        setGames(stateRes.games || []);
        setAnnouncements(stateRes.announcements || []);
        setRegisteredCount(stateRes.stats?.registered_teams ?? 0);
        setAdmin(Boolean(stateRes.isAdmin));
      })
      .catch((error) => {
        if (active) {
          setTeamEntryError(
            error instanceof Error ? error.message : 'Unable to connect to the arena server.'
          );
        }
      })
      .finally(() => {
        if (active) setTeamLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeArenaStream({
      onState: (state) => {
        setLeaderboard(state.rankings || []);
        setGames(state.games || []);
        setAnnouncements(state.announcements || []);
        setRegisteredCount(state.stats?.registered_teams ?? 0);
      },
      onSession: (payload) => {
        if (
          !teamInfo ||
          !activeCase ||
          page !== 'Investigation' ||
          payload.teamId !== teamInfo.id ||
          payload.caseId !== activeCase.id ||
          payload.lastWriter === playerId
        ) {
          return;
        }
        void fetchSession(teamInfo.id, activeCase.id).then((session) => {
          if (!session?.progress) return;
          setAnswers((current) => ({
            ...current,
            ...(session.progress.answers || {}),
            ...(session.progress.report ? { report: session.progress.report } : {}),
          }));
          setSelectedEvidence(session.progress.selectedEvidence || []);
          if (session.progress.timelineOrder?.length) {
            setTimelineOrder(session.progress.timelineOrder);
          }
          setHintCount(session.hintsUsed || 0);
        });
      },
    });
    return unsubscribe;
  }, [teamInfo, activeCase, page, playerId]);

  useEffect(() => {
    if (!activeCase || !sessionReady || result) return undefined;
    const progress = {
      caseId: activeCase.id,
      answers,
      selectedEvidence,
      timelineOrder,
      hintCount,
    };
    localStorage.setItem('arena-progress', JSON.stringify(progress));
    const timeout = window.setTimeout(() => {
      const numericAnswers: Record<string, number> = {};
      for (const [key, val] of Object.entries(answers)) {
        if (key !== 'report' && typeof val === 'number') {
          numericAnswers[key] = val;
        }
      }
      void invokeArena('saveInvestigationProgress', {
        caseId: activeCase.id,
        teamId: teamInfo?.id || null,
        answers: { ...numericAnswers, report: answers.report || '' },
        selectedEvidence,
        timelineOrder,
      }).catch(() => {});
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [activeCase, answers, selectedEvidence, timelineOrder, hintCount, sessionReady, teamInfo, result]);

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
    const teamRanking = leaderboard.find(
      (entry) => entry.teamId === teamInfo?.id || entry.memberIds?.includes(playerId)
    );
    const serverClosed = teamRanking ? Object.keys(teamRanking.caseScores || {}) : [];
    return [...new Set(serverClosed)];
  }, [leaderboard, teamInfo, playerId]);

  const visibleCases = useMemo(
    () => cases.filter((gameCase) => difficulty === 'All' || gameCase.difficulty === difficulty),
    [difficulty]
  );

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
      (score) =>
        score.mode === 'Team' &&
        (score.teamId === teamInfo?.id || score.memberIds?.includes(playerId))
    )?.score ?? 0;

  const myRank =
    leaderboard
      .filter((score) => score.mode === 'Team')
      .findIndex(
        (score) =>
          score.teamId === teamInfo?.id ||
          score.ownerId === playerId ||
          score.memberIds?.includes(playerId)
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
        (score.teamId === teamInfo.id || score.memberIds?.includes(playerId))
    );
    if (previousScore) {
      const closedResult = previousScore.caseScores[gameCase.id];
      const rankIdx =
        leaderboard
          .filter((entry) => entry.mode === 'Team')
          .findIndex((entry) => entry.teamId === previousScore.teamId) + 1;
      setActiveCase(gameCase);
      setPage('Investigation');
      setResult({
        ...closedResult,
        rank: rankIdx || undefined,
        message: 'This case is already closed. Your verified result is shown below.',
      });
      setSessionReady(false);
      return;
    }

    const localProgress = stored<{
      caseId?: string;
      answers?: AnswersState;
      selectedEvidence?: number[];
      timelineOrder?: string[];
    } | null>('arena-progress', null);
    const resumeLocal = localProgress?.caseId === gameCase.id ? localProgress : null;

    setActiveCase(gameCase);
    setPage('Investigation');
    setSessionReady(false);
    setAnswers(resumeLocal?.answers || {});
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
      const session = await invokeArena<{
        progress?: {
          answers?: Record<string, number>;
          report?: string;
          selectedEvidence?: number[];
          timelineOrder?: string[];
        };
        hintsUsed?: number;
        elapsedSeconds?: number;
      }>('beginInvestigation', { caseId: gameCase.id, teamId: teamInfo.id });

      const remoteProgress = session.progress || {};
      const hasRemote =
        Object.keys(remoteProgress.answers || {}).length > 0 ||
        (remoteProgress.selectedEvidence?.length || 0) > 0 ||
        Boolean(remoteProgress.report) ||
        (remoteProgress.timelineOrder?.length || 0) > 0;

      if (hasRemote) {
        setAnswers({
          ...(remoteProgress.answers || {}),
          ...(remoteProgress.report ? { report: remoteProgress.report } : {}),
        });
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
      setNotice(error instanceof Error ? error.message : 'Could not initialize case session.');
    }
  };

  const requestHint = async () => {
    if (!activeCase || hintCount >= activeCase.hints.length) return;
    try {
      const response = await invokeArena<{ hintsUsed: number }>('useInvestigationHint', {
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
      const response = await invokeArena<CaseScore>('submitInvestigation', {
        caseId: activeCase.id,
        answers,
        selectedEvidence,
        timelineOrder,
        report: answers.report || '',
        teamId: teamInfo.id,
      });
      setResult(response);
      playSignal(muted, 760);
      localStorage.removeItem('arena-progress');
      setNotice('Verdict submitted and verified by the arena server.');
      await loadArenaState();
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
      const data = await invokeArena<TeamInfo>('createTeam', { name: teamName.trim() });
      setTeamInfo(data);
      setTeamCode(data.inviteCode);
      await loadArenaState();
    } catch (error) {
      setTeamEntryError(error instanceof Error ? error.message : 'Could not register team.');
    } finally {
      setTeamBusy(false);
    }
  };

  const joinTeam = async (event: FormEvent) => {
    event.preventDefault();
    setTeamBusy(true);
    setTeamEntryError('');
    try {
      const data = await invokeArena<TeamInfo>('joinTeam', {
        inviteCode: teamCode.trim().toUpperCase(),
      });
      setTeamInfo(data);
      await loadArenaState();
    } catch (error) {
      setTeamEntryError(error instanceof Error ? error.message : 'Could not join team.');
    } finally {
      setTeamBusy(false);
    }
  };

  const leaveCurrentTeam = async () => {
    if (!teamInfo) return;
    try {
      await invokeArena('leaveTeam', { teamId: teamInfo.id });
      localStorage.removeItem('arena-progress');
      setTeamInfo(null);
      setActiveCase(null);
      setResult(null);
      setPage('Home');
      await loadArenaState();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to leave team.');
    }
  };

  const joinGame = async (event: FormEvent) => {
    event.preventDefault();
    if (!joinCode.trim()) return;
    try {
      const data = await invokeArena<GameLobby>('joinGame', {
        inviteCode: joinCode.trim().toUpperCase(),
      });
      const assignedCase = cases.find((gameCase) => gameCase.id === data.caseId);
      setJoinCode('');
      if (assignedCase) {
        await openCase(assignedCase);
      } else {
        setNotice(`Joined event ${data.name}.`);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to join event lobby.');
    }
  };

  const shiftTimeline = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= timelineOrder.length || !activeCase) return;
    const next = [...timelineOrder];
    [next[index], next[target]] = [next[target], next[index]];
    setTimelineOrder(next);
  };

  const copyTeamInvite = () => {
    if (!teamInfo) return;
    void navigator.clipboard?.writeText(teamInfo.inviteCode).then(() => {
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1800);
    });
  };

  const exportResults = () => {
    const header = ['Rank', 'Team', 'Difficulty', 'Score', 'Completion time (s)'];
    const rows = leaderboard
      .filter((item) => item.mode === 'Team')
      .map((item, index) => [
        index + 1,
        item.teamName || '',
        item.difficulty || '',
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
        teamLoading={teamLoading}
        teamBusy={teamBusy}
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

        <button
          className={`nav-link admin-link ${page === 'Admin' ? 'active' : ''}`}
          onClick={() => goTo('Admin')}
        >
          <Settings2 size={17} />
          <span>Admin console</span>
        </button>

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
          <button
            type="button"
            className="leave-team-btn"
            onClick={leaveCurrentTeam}
          >
            <LogOut size={13} />
            <span>Switch team</span>
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
            transition={{ duration: 0.16 }}
          >
            {page === 'Investigation' && activeCase ? (
              <InvestigationView
                activeCase={activeCase}
                answers={answers}
                setAnswers={setAnswers}
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
                visibleCases={visibleCases}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
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

            {page === 'Admin' && (
              <AdminView
                admin={admin}
                setAdmin={setAdmin}
                games={games}
                leaderboard={leaderboard}
                exportResults={exportResults}
                setNotice={setNotice}
                reloadState={loadArenaState}
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
  teamLoading,
  teamBusy,
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
  teamLoading: boolean;
  teamBusy: boolean;
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
  const unavailable = teamBusy || teamLoading;
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

        {teamLoading ? (
          <div className="setup-callout">
            <span className="spinner" />
            <span>Preparing secure team access…</span>
          </div>
        ) : null}

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
            Your browser stores an anonymous team token so teammates can collaborate across tabs or
            devices.
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
  announcements: Announcement[];
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
          <p>Investigate, analyze forensic logs, reconstruct timelines, and submit your team verdict.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => setPage('Play Investigation')}>
              <Swords size={16} />
              <span>Enter the arena</span>
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="hero-proof">
            <span>
              <b>10</b> original cases
            </span>
            <span>
              <b>3</b> difficulty levels
            </span>
            <span>
              <b>2–4</b> per team
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
          01 <span>/</span> 10
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
            <strong>10</strong>
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
            games.slice(0, 3).map((game) => (
              <div className="lobby-row" key={game.id}>
                <span className="lobby-glyph">
                  <Radio size={16} />
                </span>
                <div>
                  <strong>{game.name}</strong>
                  <small>
                    {game.difficulty} · {game.participantCount || 0} teams · Code{' '}
                    <span className="mono-inline">{game.inviteCode}</span>
                  </small>
                </div>
                <span className={`game-status ${game.status === 'live' ? 'is-live' : ''}`}>
                  {game.status}
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
              ['01', 'Choose your case', 'Pick a difficulty and start an investigation with your team.'],
              ['02', 'Read the evidence', 'Inspect the synthetic records and collect the clues that matter.'],
              ['03', 'Build your theory', 'Answer questions, arrange events, and use hints carefully.'],
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
            announcements.slice(0, 4).map((item) => (
              <article className="dispatch" key={item.id}>
                <span className="dispatch-dot" />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <small>{new Date(item.createdAt).toLocaleDateString()}</small>
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
          value={completed.length > 3 ? 'VETERAN' : 'ACTIVE'}
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
            <span className={`difficulty-tag ${nextCase.difficulty.toLowerCase()}`}>
              {nextCase.difficulty}
            </span>
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
              can join <strong>{teamInfo.name}</strong> ({teamInfo.memberIds.length}/4 members).
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

function CaseLibrary({
  visibleCases,
  difficulty,
  setDifficulty,
  openCase,
  completed,
  search,
  setSearch,
}: {
  visibleCases: InvestigationCase[];
  difficulty: 'All' | 'Easy' | 'Medium' | 'Hard';
  setDifficulty: (d: 'All' | 'Easy' | 'Medium' | 'Hard') => void;
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
        eyebrow="CASE ARCHIVE · 10 FILES"
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
        <div className="segmented-control" role="group" aria-label="Filter cases by difficulty">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((level) => (
            <button
              key={level}
              className={difficulty === level ? 'selected' : ''}
              onClick={() => setDifficulty(level)}
            >
              {level}
            </button>
          ))}
        </div>

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
          copy="Try another title or difficulty filter."
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
        <span className={`difficulty-tag ${gameCase.difficulty.toLowerCase()}`}>
          {gameCase.difficulty}
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
  answers,
  setAnswers,
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
  answers: AnswersState;
  setAnswers: React.Dispatch<React.SetStateAction<AnswersState>>;
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
  const [activeTab, setActiveTab] = useState<'Evidence' | 'Suspects' | 'Questions'>('Evidence');
  const evidenceCollected = (id: number) => selectedEvidence.includes(id);
  const toggleEvidence = (id: number) => {
    setSelectedEvidence((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    );
  };
  const answeredCount = Object.keys(answers).filter((key) => key !== 'report').length;
  const progress = Math.round((answeredCount / activeCase.questions.length) * 100);
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
          <div className="eyebrow">
            {activeCase.difficulty.toUpperCase()} INVESTIGATION{' '}
            <span className="eyebrow-divider">·</span> {activeCase.category.toUpperCase()}
          </div>
          <h1>
            {activeCase.title}
            <span>:</span> {activeCase.subtitle}
          </h1>
        </div>
        <div className="case-progress">
          <strong>{result ? '100%' : `${progress}%`}</strong>
          <span>CASE PROGRESS</span>
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
                {(['Evidence', 'Suspects', 'Questions'] as const).map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === tab}
                    className={activeTab === tab ? 'tab-active' : ''}
                    onClick={() => setActiveTab(tab)}
                  >
                    <span>{tab}</span>
                    {tab === 'Evidence' && <span className="tab-count">{activeCase.evidence.length}</span>}
                    {tab === 'Questions' && (
                      <span className="tab-count">{activeCase.questions.length}</span>
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'Evidence' && (
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
              )}

              {activeTab === 'Suspects' && (
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
              )}

              {activeTab === 'Questions' && (
                <form className="question-list" onSubmit={submitCase}>
                  {activeCase.questions.map((question, index) => (
                    <fieldset
                      className={`question-card question-${question.type}`}
                      key={question.id}
                    >
                      <legend>
                        <span className="question-num">Q{String(index + 1).padStart(2, '0')}</span>
                        <span className="question-prompt">
                          {question.prompt}
                          <small>
                            {question.type === 'true-false'
                              ? 'TRUE OR FALSE'
                              : question.type === 'clue'
                              ? 'FIND THE CLUE'
                              : question.type === 'match'
                              ? 'MATCH REMEDIATION'
                              : 'SELECT ONE'}
                          </small>
                        </span>
                      </legend>

                      {question.type === 'match' ? (
                        <select
                          className="question-match-select"
                          aria-label={question.prompt}
                          value={answers[question.id] ?? ''}
                          onChange={(event) =>
                            setAnswers((current) => ({
                              ...current,
                              [question.id]: Number(event.target.value),
                            }))
                          }
                        >
                          <option value="" disabled>
                            Select a match
                          </option>
                          {question.options.map((option, optionIndex) => (
                            <option value={optionIndex} key={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="answer-options">
                          {question.options.map((option, optionIndex) => (
                            <label
                              className={
                                answers[question.id] === optionIndex ? 'answer-selected' : ''
                              }
                              key={option}
                            >
                              <input
                                type="radio"
                                name={question.id}
                                checked={answers[question.id] === optionIndex}
                                onChange={() =>
                                  setAnswers((current) => ({
                                    ...current,
                                    [question.id]: optionIndex,
                                  }))
                                }
                              />
                              <span className="answer-letter">
                                {question.type === 'true-false'
                                  ? optionIndex
                                    ? 'F'
                                    : 'T'
                                  : String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span className="answer-text">{option}</span>
                              <Check className="answer-check" size={14} />
                            </label>
                          ))}
                        </div>
                      )}
                    </fieldset>
                  ))}

                  <label className="report-field">
                    <span>
                      FINAL INVESTIGATION REPORT{' '}
                      <small>
                        {activeCase.difficulty === 'Hard'
                          ? 'REQUIRED · 40+ CHARACTERS'
                          : 'OPTIONAL · 500 CHARACTERS'}
                      </small>
                    </span>
                    <textarea
                      maxLength={500}
                      value={answers.report || ''}
                      onChange={(event) =>
                        setAnswers((current) => ({ ...current, report: event.target.value }))
                      }
                      placeholder="Summarize your conclusion and cite the clues that support it."
                    />
                  </label>

                  <button
                    className="button button-primary submit-verdict"
                    type="submit"
                    disabled={
                      submissionBusy ||
                      answeredCount < activeCase.questions.length ||
                      (activeCase.difficulty === 'Hard' &&
                        (answers.report || '').trim().length < 40)
                    }
                  >
                    {submissionBusy ? <span className="spinner" /> : <Flag size={16} />}
                    <span>
                      {submissionBusy ? 'Submitting to arena...' : 'Submit final verdict'}
                    </span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}

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
                  <span>DIFFICULTY</span>
                  <strong>{activeCase.difficulty}</strong>
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
                Use the arrows to arrange events in chronological order (15 pts).
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
          {result.explanations.map((item) => {
            const prompt =
              gameCase.questions.find((question) => question.id === item.question)?.prompt ||
              item.question;
            return (
              <div
                key={item.question}
                className={`debrief-item ${item.correct ? 'is-correct' : 'is-wrong'}`}
              >
                <span className="debrief-icon">
                  {item.correct ? <Check size={14} /> : <X size={14} />}
                </span>
                <div>
                  <strong>{prompt}</strong>
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
                <small>{team.difficulty || 'ARENA TEAM'}</small>
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
                  <th>LAST DIFFICULTY</th>
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
                    <td>
                      <span
                        className={`difficulty-tag ${(team.difficulty || 'easy').toLowerCase()}`}
                      >
                        {team.difficulty || '—'}
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
        description="Review closed cases and inspect your server-verified debrief."
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
  setAdmin,
  games,
  leaderboard,
  exportResults,
  setNotice,
  reloadState,
}: {
  admin: boolean;
  setAdmin: (v: boolean) => void;
  games: GameLobby[];
  leaderboard: RankingEntry[];
  exportResults: () => void;
  setNotice: (v: string) => void;
  reloadState: () => Promise<void>;
}) {
  const [passcode, setPasscode] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [eventForm, setEventForm] = useState<{
    name: string;
    caseId: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    inviteCode: string;
  }>({
    name: '',
    caseId: cases[0].id,
    difficulty: 'Easy',
    inviteCode: '',
  });
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [teams, setTeams] = useState<AdminTeamSummary[]>([]);

  const unlockAdmin = async (event: FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);
    try {
      const response = await invokeArena<{ adminToken: string; isAdmin: boolean }>('adminLogin', {
        passcode,
      });
      setStoredAdminToken(response.adminToken);
      setAdmin(true);
      setPasscode('');
      setNotice('Organizer console unlocked.');
      await reloadState();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Invalid organizer passcode.');
    } finally {
      setAuthBusy(false);
    }
  };

  const lockAdmin = () => {
    setStoredAdminToken('');
    setAdmin(false);
    setTeams([]);
    setNotice('Signed out of organizer console.');
  };

  const createEvent = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await invokeArena<GameLobby>('adminCreateGame', eventForm);
      setNotice(`Event created with invitation code ${result.inviteCode}.`);
      setEventForm({ name: '', caseId: cases[0].id, difficulty: 'Easy', inviteCode: '' });
      await reloadState();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to create event.');
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (gameId: string, status: GameLobby['status']) => {
    try {
      await invokeArena('adminSetGameStatus', { gameId, status });
      setNotice(`Event status changed to ${status}.`);
      await reloadState();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to update event status.');
    }
  };

  const publishAnnouncement = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await invokeArena('adminAnnounce', announcement);
      setAnnouncement({ title: '', message: '' });
      setNotice('Announcement published.');
      await reloadState();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to publish announcement.');
    }
  };

  const loadTeams = async () => {
    try {
      const result = await invokeArena<{ teams: AdminTeamSummary[] }>('adminListTeams', {});
      setTeams(result.teams || []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to load registered teams.');
    }
  };

  if (!admin) {
    return (
      <section className="empty-state admin-locked">
        <LockKeyhole size={28} />
        <h2>Administrator access required</h2>
        <p>
          Enter the organizer passcode configured in <code>ADMIN_PASSCODE</code> to manage event
          lobbies, dispatches, and registered teams.
        </p>
        <form className="admin-unlock-form" onSubmit={unlockAdmin}>
          <input
            type="password"
            required
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            placeholder="Organizer passcode"
            aria-label="Organizer passcode"
          />
          <button className="button button-primary" disabled={authBusy}>
            <KeyRound size={15} />
            <span>{authBusy ? 'Verifying…' : 'Unlock console'}</span>
          </button>
        </form>
      </section>
    );
  }

  return (
    <>
      <PageHeading
        eyebrow="RESTRICTED · ADMINISTRATOR ACCESS"
        title="Arena control room"
        description="Manage events and announcements. Case answers and score validation remain server-controlled."
        action={
          <div className="admin-header-actions">
            <button className="button button-outline" onClick={exportResults}>
              <ArrowDown size={15} />
              <span>Export results</span>
            </button>
            <button className="button button-outline" onClick={lockAdmin}>
              <LockKeyhole size={15} />
              <span>Lock</span>
            </button>
          </div>
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
              DIFFICULTY
              <select
                value={eventForm.difficulty}
                onChange={(event) => {
                  const diff = event.target.value as 'Easy' | 'Medium' | 'Hard';
                  const selectedCase = cases.find((gameCase) => gameCase.difficulty === diff);
                  setEventForm({
                    ...eventForm,
                    difficulty: diff,
                    caseId: selectedCase?.id || eventForm.caseId,
                  });
                }}
              >
                {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
            <label>
              INVESTIGATION
              <select
                value={eventForm.caseId}
                onChange={(event) => {
                  const selectedCase = cases.find((gameCase) => gameCase.id === event.target.value);
                  setEventForm({
                    ...eventForm,
                    caseId: event.target.value,
                    difficulty: selectedCase?.difficulty || eventForm.difficulty,
                  });
                }}
              >
                {cases
                  .filter((gameCase) => gameCase.difficulty === eventForm.difficulty)
                  .map((gameCase) => (
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
                  <small>
                    {game.inviteCode || 'No invite code'} · {game.difficulty}
                  </small>
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
                  <span>
                    {team.name} <small className="mono-inline">({team.inviteCode})</small>
                  </span>
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
