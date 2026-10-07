/**
 * ==============================================================================
 * ShesherPata — Public Client-Safe Environment Accessor
 * ==============================================================================
 * Contains ONLY non-sensitive public metadata safe for browser use:
 * - Public Supabase project URL
 * - Public publishable anon key (safe for browser with Supabase RLS)
 * - Public website domain
 * 
 * STRICT SECURITY:
 * Never put private API keys, admin secrets, or service role keys in this file.
 * ==============================================================================
 */

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://shesherpata.com',
};
