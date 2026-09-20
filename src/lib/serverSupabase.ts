import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Private server-side key with elevated privileges (never exposed to client browser)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let serverSupabaseInstance: SupabaseClient | null = null;

export function getServerSupabaseClient(): SupabaseClient | null {
  if (serverSupabaseInstance) {
    return serverSupabaseInstance;
  }

  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    return null;
  }

  // Prioritize service_role key on the server to bypass restrictive RLS policies for admin tasks
  const keyToUse = serviceRoleKey || anonKey;
  if (!keyToUse) {
    return null;
  }

  try {
    serverSupabaseInstance = createClient(supabaseUrl, keyToUse, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return serverSupabaseInstance;
  } catch (err) {
    console.error('[ServerSupabase] Initialization failed:', err);
    return null;
  }
}
