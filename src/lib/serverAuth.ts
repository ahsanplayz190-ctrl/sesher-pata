import crypto from 'crypto';

// Secret key for HMAC token signing (server-side only)
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  'shesher_pata_admin_secret_key_2026_super_secure_auth';

// Server-side admin credentials (never exposed to client browser)
const SERVER_ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'seshadmin';
const SERVER_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sesherpata12@#';

export const ADMIN_COOKIE_NAME = 'seshadmin_token';

/**
 * Verify admin username and password using constant-time string comparison
 * to prevent timing attacks.
 */
export function verifyCredentials(username: string, password: string): boolean {
  if (!username || !password) return false;

  const userMatch = timingSafeEqual(username.trim(), SERVER_ADMIN_USERNAME);
  const passMatch = timingSafeEqual(password, SERVER_ADMIN_PASSWORD);

  return userMatch && passMatch;
}

/**
 * Constant-time string comparison helper.
 */
function timingSafeEqual(a: string, b: string): boolean {
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
 * Generate a cryptographically signed session token.
 * Payload: { role: 'admin', exp: Date.now() + maxAge }
 */
export function createSessionToken(maxAgeSeconds = 86400 * 7): string {
  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: expiresAt })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
}

/**
 * Validate session token signature and expiration.
 */
export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
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
 * Extract and verify admin token from Request Cookie header.
 */
export function isRequestAuthorized(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const token = cookies[ADMIN_COOKIE_NAME];

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
