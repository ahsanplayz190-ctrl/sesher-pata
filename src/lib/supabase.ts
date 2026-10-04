import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { publicConfig } from '../config/publicConfig';

const supabaseUrl = publicConfig.supabase.url;
const supabaseAnonKey = publicConfig.supabase.anonKey;

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (err) {
    console.warn('[Supabase] Initialization failed, falling back to local cache:', err);
  }
}

export const supabase = supabaseInstance;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseInstance);
};

