/**
 * ==============================================================================
 * ShesherPata — Public Client Configuration
 * ==============================================================================
 * 
 * STRICT ZERO-ENV PUBLIC CLIENT CONFIGURATION:
 * This file is safely bundled for browser clients.
 * Contains ONLY non-sensitive public metadata required by the frontend:
 * - Public Supabase project URL
 * - Public publishable anon key (safe for browser use with Supabase RLS)
 * - Public website domain
 * 
 * SECURITY STRICT RULE:
 * This file contains NO secrets and NO environment variable dependencies.
 * NEVER place service role keys, admin passwords, or private API secrets here.
 * ==============================================================================
 */

export const publicConfig = {
  supabase: {
    url: 'https://tbgtvrveyjuupqbcldya.supabase.co',
    anonKey: 'sb_publishable_mW5PheJWTnkEuNOaTYNZ0A_bBDqjRmG',
  },
  siteUrl: 'https://shesherpata.com',
} as const;

export type PublicConfig = typeof publicConfig;
