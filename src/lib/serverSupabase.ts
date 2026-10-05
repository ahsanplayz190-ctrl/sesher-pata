import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.error('[ServerSupabase] Invalid Supabase URL configured in environment variables');
    return null;
  }

  const keyToUse = serviceRoleKey || anonKey;
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
