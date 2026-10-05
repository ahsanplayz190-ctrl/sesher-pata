import 'server-only';

if (typeof window !== 'undefined') {
  throw new Error('CRITICAL SECURITY ERROR: src/lib/steadfast.ts can only run in a server environment.');
}

const STEADFAST_BASE_URL = (process.env.STEADFAST_BASE_URL || 'https://portal.packzy.com/api/v1').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 15000;

export interface SteadfastCredentials {
  apiKey: string;
  secretKey: string;
  isConnected: boolean;
  lastVerifiedAt?: string | null;
}

/**
 * Load Steadfast credentials directly from server-side environment variables (.env).
 * Server-side only: never exposed to client bundles or API responses.
 */
export async function getSteadfastCredentials(): Promise<SteadfastCredentials> {
  const apiKey = (process.env.STEADFAST_API_KEY || '').trim();
  const secretKey = (process.env.STEADFAST_SECRET_KEY || '').trim();
  const isConnected = Boolean(apiKey && secretKey);

  return {
    apiKey,
    secretKey,
    isConnected,
    lastVerifiedAt: null,
  };
}

/**
 * Validate credentials against Steadfast API before saving.
 * Safe testing: calls official get_balance endpoint.
 */
export async function verifySteadfastCredentials(
  apiKey: string,
  secretKey: string
): Promise<{ success: boolean; balance?: number; error?: string }> {
  if (!apiKey || !secretKey) {
    return { success: false, error: 'API Key এবং Secret Key আবশ্যক।' };
  }

  try {
    const res = await fetch(`${STEADFAST_BASE_URL}/get_balance`, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey.trim(),
        'Secret-Key': secretKey.trim(),
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { status: res.status, message: text.slice(0, 150) };
    }

    if (res.ok && data.status === 200) {
      return {
        success: true,
        balance: typeof data.current_balance === 'number' ? data.current_balance : 0,
      };
    }

    return {
      success: false,
      error: data.message || data.error || 'স্টেডফাস্ট এপিআই রেসপন্স ব্যর্থ হয়েছে। এপিআই কি ও সিক্রেট কি সঠিক কিনা যাচাই করুন।',
    };
  } catch (err: any) {
    const isTimeout = err?.name === 'TimeoutError';
    return {
      success: false,
      error: isTimeout
        ? 'স্টেডফাস্ট সার্ভারে সংযোগের সময়সীমা শেষ হয়েছে (Timeout)।'
        : 'স্টেডফাস্ট সার্ভারে সংযোগ করা সম্ভব হয়নি। ইন্টারনেট কানেকশন বা তথ্য যাচাই করুন।',
    };
  }
}

/**
 * Deprecated storage mechanism stub.
 * Steadfast credentials are now managed via environment variables (.env).
 */
export async function saveSteadfastCredentials(
  _apiKey: string,
  _secretKey: string
): Promise<{ success: boolean; error?: string }> {
  return {
    success: false,
    error: 'স্টেডফাস্ট ক্রিডেনশিয়ালস এখন সরাসরি সার্ভার পরিবেশ ভেরিয়েবল (.env)-এ কনফিগার করা থাকে।',
  };
}

/**
 * Deprecated storage mechanism stub.
 * Steadfast credentials are now managed via environment variables (.env).
 */
export async function disconnectSteadfast(): Promise<{ success: boolean; error?: string }> {
  return {
    success: false,
    error: 'স্টেডফাস্ট ক্রিডেনশিয়ালস এখন সরাসরি সার্ভার পরিবেশ ভেরিয়েবল (.env)-এ কনফিগার করা থাকে।',
  };
}
