import { cases, type InvestigationCase } from './cases';

const CASE_CACHE_VERSION = 'v3-2026-11-27-qr-case09';
const CASE_CACHE_STORAGE_KEY = `arena_cases_cache_${CASE_CACHE_VERSION}`;

export interface CaseSummary {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  difficulty: InvestigationCase['difficulty'];
  duration: number;
  icon: InvestigationCase['icon'];
  color: InvestigationCase['color'];
  evidenceCount: number;
  hasTimeline: boolean;
  briefingPreview: string;
}

let memoryCases: InvestigationCase[] | null = null;
let memoryById: Map<string, InvestigationCase> | null = null;
let memorySummaries: CaseSummary[] | null = null;

function pruneStaleCaseCaches(): void {
  if (typeof window === 'undefined') return;
  for (const store of [window.sessionStorage, window.localStorage]) {
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < store.length; i += 1) {
        const key = store.key(i);
        if (key && key.startsWith('arena_cases_cache_') && key !== CASE_CACHE_STORAGE_KEY) {
          toRemove.push(key);
        }
      }
      toRemove.forEach((key) => store.removeItem(key));
    } catch {
      // Ignore storage access errors in restricted frames.
    }
  }
}

export function getCachedCases(): InvestigationCase[] {
  if (memoryCases) return memoryCases;

  if (typeof window !== 'undefined') {
    pruneStaleCaseCaches();
    try {
      const raw =
        window.sessionStorage.getItem(CASE_CACHE_STORAGE_KEY) ||
        window.localStorage.getItem(CASE_CACHE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed) && parsed.length === cases.length) {
          memoryCases = parsed as InvestigationCase[];
          memoryById = new Map(memoryCases.map((entry) => [entry.id, entry]));
          return memoryCases;
        }
      }
    } catch {
      // Fall back to static cases array and refresh cache.
    }

    try {
      const serialized = JSON.stringify(cases);
      window.sessionStorage.setItem(CASE_CACHE_STORAGE_KEY, serialized);
    } catch {
      // Ignore storage quota errors.
    }
  }

  memoryCases = cases;
  memoryById = new Map(cases.map((entry) => [entry.id, entry]));
  return memoryCases;
}

export function getCachedCaseById(caseId: string): InvestigationCase | null {
  if (!memoryById) {
    getCachedCases();
  }
  return memoryById?.get(caseId) || null;
}

export function getCachedCaseSummaries(): CaseSummary[] {
  if (memorySummaries) return memorySummaries;
  const all = getCachedCases();
  memorySummaries = all.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    category: item.category,
    difficulty: item.difficulty,
    duration: item.duration,
    icon: item.icon,
    color: item.color,
    evidenceCount: item.evidence.length,
    hasTimeline: item.timeline.length > 0,
    briefingPreview: item.briefing,
  }));
  return memorySummaries;
}
