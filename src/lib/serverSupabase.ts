import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from './serverEnv';

if (typeof window !== 'undefined') {
  throw new Error('SECURITY VIOLATION: getServerSupabaseClient can only be called in a server environment.');
}

let serverSupabaseInstance: SupabaseClient | null = null;

/**
 * Returns a server-only Supabase client initialized with the privileged Service Role Key.
 * Bypasses restrictive RLS policies for trusted server operations (admin tasks, orders, file uploads).
 * 
 * SECURITY NOTICE:
 * This client and its serviceRoleKey MUST NEVER be exposed or passed to the browser.
 */
export function getServerSupabaseClient(): SupabaseClient | null {
  if (serverSupabaseInstance) {
    return serverSupabaseInstance;
  }

  const { supabaseUrl, supabaseServiceRoleKey, supabaseAnonKey } = getServerEnv();

  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.error('[ServerSupabase] Invalid Supabase URL configured in environment variables');
    return null;
  }

  const keyToUse = supabaseServiceRoleKey || supabaseAnonKey;
  if (!keyToUse) {
    console.error('[ServerSupabase] Neither SUPABASE_SERVICE_ROLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY found in environment variables');
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
