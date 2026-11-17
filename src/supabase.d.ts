import type { SupabaseClient, User } from '@supabase/supabase-js';

export const supabaseConfigured: boolean;
export const supabase: SupabaseClient | null;
export function isAdminUser(user: User | null | undefined): boolean;
