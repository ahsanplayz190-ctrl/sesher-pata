import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { serverConfig } from '../server/config';

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

  const { url: supabaseUrl, serviceRoleKey, anonKey } = serverConfig.supabase;

  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.error('[ServerSupabase] Invalid Supabase URL configured in serverConfig');
    return null;
  }

  const keyToUse = serviceRoleKey || anonKey;
  if (!keyToUse) {
    console.error('[ServerSupabase] Neither serviceRoleKey nor anonKey found in serverConfig');
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
