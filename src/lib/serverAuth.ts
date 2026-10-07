import 'server-only';
import crypto from 'crypto';
import { getServerEnv } from './serverEnv';

if (typeof window !== 'undefined') {
  throw new Error('SECURITY VIOLATION: serverAuth can only be executed in a server environment.');
}

export const ADMIN_COOKIE_NAME = 'seshadmin_token';

/**
 * Constant-time string comparison helper to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Dummy comparison to mitigate timing leaks
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify admin username/email and password using constant-time string comparison.
 * Robust against surrounding quotes, whitespace, and case differences in username/email.
 */
export function verifyCredentials(identifier: string, password: string): boolean {
  if (!identifier || !password) return false;

  const env = getServerEnv();

  if (!env.adminPassword) {
    console.error('[Admin Auth Error] Authentication configuration is missing (ADMIN_PASSWORD is not set).');
    return false;
  }

  const cleanInput = identifier.trim().toLowerCase();
  const cleanUsername = env.adminUsername.toLowerCase();
  const cleanEmail = env.adminEmail.toLowerCase();

  // Identifier can be either the admin username or admin email
  const userMatch =
    timingSafeEqual(cleanInput, cleanUsername) ||
    (Boolean(cleanEmail) && timingSafeEqual(cleanInput, cleanEmail));

  // Support both raw and trimmed input password against sanitized server password
  const passMatch =
    timingSafeEqual(password, env.adminPassword) ||
    timingSafeEqual(password.trim(), env.adminPassword);

  return userMatch && passMatch;
}

/**
 * Generate a cryptographically signed session token.
 * Payload: { role: 'admin', exp: Date.now() + maxAge }
 */
export function createSessionToken(maxAgeSeconds = 86400 * 7): string {
  const env = getServerEnv();
  const secret = env.adminSessionSecret;
  if (!secret) {
    throw new Error('Authentication configuration is missing (ADMIN_SESSION_SECRET is not set).');
  }

  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: expiresAt })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
}

/**
 * Validate session token signature and expiration.
 */
export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;
  const env = getServerEnv();
  const secret = env.adminSessionSecret;
  if (!secret) {
    console.error('[Admin Auth Error] Authentication configuration is missing (ADMIN_SESSION_SECRET is not set).');
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');

  if (!timingSafeEqual(signature, expectedSig)) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (decoded.role !== 'admin') return false;
    if (typeof decoded.exp === 'number' && decoded.exp < Date.now()) {
      return false; // Token expired
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract and verify admin token from Request Cookie header or NextRequest cookies.
 */
export function isRequestAuthorized(request: Request): boolean {
  let token: string | undefined = undefined;

  // 1. Check native NextRequest cookies getter if available
  if ('cookies' in request && typeof (request as any).cookies?.get === 'function') {
    const cookieObj = (request as any).cookies.get(ADMIN_COOKIE_NAME);
    if (cookieObj && typeof cookieObj.value === 'string') {
      token = cookieObj.value;
    }
  }

  // 2. Fall back to parsing the raw Cookie header
  if (!token) {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parseCookies(cookieHeader);
    token = cookies[ADMIN_COOKIE_NAME];
  }

  return verifySessionToken(token);
}

function parseCookies(cookieString: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieString) return list;

  cookieString.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts[0]?.trim();
    if (key) {
      list[key] = decodeURIComponent(parts.slice(1).join('=').trim());
    }
  });

  return list;
}
