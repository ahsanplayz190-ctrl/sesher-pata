import 'server-only';

/**
 * ==============================================================================
 * ShesherPata — Dedicated Server-Only Configuration Module
 * ==============================================================================
 * 
 * STRICT ZERO-ENV ARCHITECTURE:
 * All backend secrets (except admin-configured integrations like Steadfast)
 * are stored directly in this server-only file.
 * 
 * SECURITY RULES:
 * 1. Admin authentication remains code-based and independent of the database.
 * 2. Supabase service role key is private to the server.
 * 3. Steadfast API credentials are NOT hardcoded here; they are managed dynamically
 *    by the admin via the Admin Panel and stored AES-256-GCM encrypted in Supabase.
 * 4. Compiler enforcement: `import 'server-only'`.
 * 5. Runtime enforcement: Throws if evaluated in a browser environment.
 * ==============================================================================
 */

if (typeof window !== 'undefined') {
  throw new Error('CRITICAL SECURITY ERROR: Server configuration cannot be used in the browser.');
}

export const serverConfig = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tbgtvrveyjuupqbcldya.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_mW5PheJWTnkEuNOaTYNZ0A_bBDqjRmG',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  admin: {
    username: process.env.ADMIN_USERNAME || 'seshadmin',
    email: process.env.ADMIN_EMAIL || 'admin@shesherpata.com',
    password: process.env.ADMIN_PASSWORD || 'sesherpata12@#',
    sessionSecret: process.env.ADMIN_SESSION_SECRET || '8f9f58cbf955cef7494662d558752d7a60aaaf2d41114bebfa97fcb2cd38ec7b',
  },

  encryption: {
    // 256-bit (32-byte) key for AES-256-GCM encryption of third-party credentials
    keyHex: process.env.ENCRYPTION_KEY_HEX || '7f9a1b3c5e7d9f2a4b6c8e0d2f4a6b8c1e3d5f7a9b1c3e5d7f9a1b3c5e7d9f2a',
  },

  steadfast: {
    baseUrl: process.env.STEADFAST_BASE_URL || 'https://portal.packzy.com/api/v1',
  },
} as const;

export type ServerConfig = typeof serverConfig;
