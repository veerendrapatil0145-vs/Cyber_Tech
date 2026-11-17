import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://erfbsolezxmdunjjthgq.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_xiq2MhpCfVsvmRTyAsG4Gg_5THnxlE5';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export function isAdminUser(user) {
  if (!user) return false;
  return Boolean(
    user.app_metadata?.role === 'admin' ||
      user.app_metadata?.admin === true ||
      user.user_metadata?.role === 'admin'
  );
}
