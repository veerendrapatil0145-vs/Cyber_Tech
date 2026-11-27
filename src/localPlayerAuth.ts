import type { User } from '@supabase/supabase-js';

const LOCAL_PLAYER_STORAGE_KEY = 'arena-local-player-id';

export function getOrCreateLocalPlayerId(forceNew = false): string {
  if (!forceNew && typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(LOCAL_PLAYER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (typeof parsed === 'string' && /^[a-zA-Z0-9_-]{8,80}$/.test(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore malformed stored player ID and generate a new one.
    }
  }
  const randomSuffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  const nextId = `player_${randomSuffix.slice(0, 24)}`;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LOCAL_PLAYER_STORAGE_KEY, JSON.stringify(nextId));
  }
  return nextId;
}

export function createLocalUser(id: string): User {
  return {
    id,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    is_anonymous: true,
  } as User;
}

const MAX_BACKOFF_MS = 60_000;
const BASE_BACKOFF_MS = 4_000;

let consecutiveSupabaseFailures = 0;
let supabaseCooldownUntil = 0;

export function isSupabaseInCooldown(now = Date.now()): boolean {
  return now < supabaseCooldownUntil;
}

export function getSupabaseCooldownRemainingSeconds(now = Date.now()): number {
  return Math.max(0, Math.ceil((supabaseCooldownUntil - now) / 1000));
}

export function isTransientSupabaseError(err: unknown): boolean {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
      ? String((err as { message?: unknown }).message || '')
      : String(err || '');
  const lower = message.toLowerCase();
  return (
    lower.includes('timed out') ||
    lower.includes('timeout') ||
    lower.includes('429') ||
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('disk io') ||
    lower.includes('failed to send a request') ||
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('502') ||
    lower.includes('503') ||
    lower.includes('504')
  );
}

export function recordSupabaseFailure(err?: unknown): number {
  if (err && !isTransientSupabaseError(err)) {
    return 0;
  }
  consecutiveSupabaseFailures = Math.min(consecutiveSupabaseFailures + 1, 5);
  const delayMs = Math.min(
    MAX_BACKOFF_MS,
    BASE_BACKOFF_MS * Math.pow(2, consecutiveSupabaseFailures - 1)
  );
  supabaseCooldownUntil = Date.now() + delayMs;
  return delayMs;
}

export function resetSupabaseBackoff(): void {
  consecutiveSupabaseFailures = 0;
  supabaseCooldownUntil = 0;
}
