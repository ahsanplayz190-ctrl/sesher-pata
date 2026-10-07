import 'server-only';

if (typeof window !== 'undefined') {
  throw new Error('CRITICAL SECURITY ERROR: serverEnv can only run in a server environment.');
}

/**
 * Sanitizes an environment variable value by:
 * 1. Removing leading/trailing whitespace and carriage returns (\r, \n)
 * 2. Unwrapping surrounding single or double quotes introduced by hosting dashboards
 */
export function cleanEnvValue(value: string | undefined): string {
  if (!value) return '';
  let cleaned = value.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

export interface ServerEnvironment {
  // Admin Authentication (Server-Only)
  adminUsername: string;
  adminEmail: string;
  adminPassword: string;
  adminSessionSecret: string;

  // Supabase Configuration (Server-Only elevated access)
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;

  // Steadfast Courier Integration (Server-Only)
  steadfastBaseUrl: string;
  steadfastApiKey: string;
  steadfastSecretKey: string;

  // Encryption Key (Optional format validation for deployment environments)
  encryptionKeyHex: string;

  // Public Site URL
  siteUrl: string;
}

let cachedServerEnv: ServerEnvironment | null = null;

/**
 * Returns sanitized, validated server-side environment configuration.
 * All secrets remain strictly server-side.
 */
export function getServerEnv(): ServerEnvironment {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  const env: ServerEnvironment = {
    adminUsername: cleanEnvValue(process.env.ADMIN_USERNAME) || 'seshadmin',
    adminEmail: cleanEnvValue(process.env.ADMIN_EMAIL) || 'admin@shesherpata.com',
    adminPassword: cleanEnvValue(process.env.ADMIN_PASSWORD),
    adminSessionSecret: cleanEnvValue(process.env.ADMIN_SESSION_SECRET),

    supabaseUrl: cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabaseServiceRoleKey: cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY),

    steadfastBaseUrl:
      cleanEnvValue(process.env.STEADFAST_BASE_URL) || 'https://portal.packzy.com/api/v1',
    steadfastApiKey: cleanEnvValue(process.env.STEADFAST_API_KEY),
    steadfastSecretKey: cleanEnvValue(process.env.STEADFAST_SECRET_KEY),

    encryptionKeyHex: cleanEnvValue(process.env.ENCRYPTION_KEY_HEX),

    siteUrl: cleanEnvValue(process.env.NEXT_PUBLIC_SITE_URL) || 'https://shesherpata.com',
  };

  cachedServerEnv = env;
  return env;
}

export interface EnvValidationResult {
  valid: boolean;
  missingVariables: string[];
  warnings: string[];
}

/**
 * Audits server environment health without exposing any secret values.
 * Returns only variable names and validation status.
 */
export function validateServerEnv(): EnvValidationResult {
  const env = getServerEnv();
  const missingVariables: string[] = [];
  const warnings: string[] = [];

  if (!env.supabaseUrl) missingVariables.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!env.supabaseAnonKey) missingVariables.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!env.supabaseServiceRoleKey) warnings.push('SUPABASE_SERVICE_ROLE_KEY (falling back to anon key for server operations)');

  if (!env.adminPassword) missingVariables.push('ADMIN_PASSWORD');
  if (!env.adminSessionSecret) {
    missingVariables.push('ADMIN_SESSION_SECRET');
  } else if (env.adminSessionSecret.length < 32) {
    warnings.push('ADMIN_SESSION_SECRET is shorter than 32 characters (recommended minimum 32 characters for HMAC SHA-256)');
  }

  if (!env.steadfastApiKey) warnings.push('STEADFAST_API_KEY (courier automation disabled until provided)');
  if (!env.steadfastSecretKey) warnings.push('STEADFAST_SECRET_KEY (courier automation disabled until provided)');

  // Validate format of ENCRYPTION_KEY_HEX if provided in deployment
  if (env.encryptionKeyHex) {
    const isValidHex = /^[0-9a-fA-F]{64}$/.test(env.encryptionKeyHex);
    if (!isValidHex) {
      warnings.push('ENCRYPTION_KEY_HEX is provided but not in standard 64-character (32-byte) hex format');
    }
  }

  return {
    valid: missingVariables.length === 0,
    missingVariables,
    warnings,
  };
}
