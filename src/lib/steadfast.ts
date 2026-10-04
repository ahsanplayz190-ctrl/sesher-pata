import 'server-only';
import { getServerSupabaseClient } from './serverSupabase';
import { serverConfig } from '../server/config';
import { encrypt, decrypt } from './serverCrypto';

if (typeof window !== 'undefined') {
  throw new Error('CRITICAL SECURITY ERROR: src/lib/steadfast.ts can only run in a server environment.');
}

const STEADFAST_BASE_URL = serverConfig.steadfast.baseUrl.replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 15000;

export interface SteadfastCredentials {
  apiKey: string;
  secretKey: string;
  isConnected: boolean;
  lastVerifiedAt?: string | null;
}

/**
 * Load encrypted Steadfast credentials strictly from Supabase public.steadfast_config
 * and decrypt them server-side using AES-256-GCM.
 * Never exposed to client code or API responses.
 * 
 * If Supabase steadfast_config cannot be accessed or does not exist,
 * returns disconnected status without ANY local fallback.
 */
export async function getSteadfastCredentials(): Promise<SteadfastCredentials> {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return { apiKey: '', secretKey: '', isConnected: false, lastVerifiedAt: null };
  }

  try {
    const { data, error } = await supabase
      .from('steadfast_config')
      .select('api_key_encrypted, secret_key_encrypted, is_connected, last_verified_at')
      .eq('id', 'primary')
      .maybeSingle();

    if (error) {
      return { apiKey: '', secretKey: '', isConnected: false, lastVerifiedAt: null };
    }

    if (data && data.is_connected && data.api_key_encrypted && data.secret_key_encrypted) {
      const apiKey = decrypt(data.api_key_encrypted);
      const secretKey = decrypt(data.secret_key_encrypted);
      if (apiKey && secretKey) {
        return {
          apiKey,
          secretKey,
          isConnected: true,
          lastVerifiedAt: data.last_verified_at || null,
        };
      }
    }
  } catch {
    return { apiKey: '', secretKey: '', isConnected: false, lastVerifiedAt: null };
  }

  return { apiKey: '', secretKey: '', isConnected: false, lastVerifiedAt: null };
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
 * Save and encrypt Steadfast credentials strictly in Supabase public.steadfast_config.
 * Enforces AES-256-GCM authenticated encryption.
 * ZERO LOCAL FILES / ZERO VAULT / SINGLE SOURCE OF TRUTH.
 */
export async function saveSteadfastCredentials(
  apiKey: string,
  secretKey: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      error: 'Steadfast configuration storage is unavailable. Supabase client is not initialized.',
    };
  }

  const encryptedApiKey = encrypt(apiKey.trim());
  const encryptedSecretKey = encrypt(secretKey.trim());
  const now = new Date().toISOString();

  try {
    const { error } = await supabase.from('steadfast_config').upsert({
      id: 'primary',
      api_key_encrypted: encryptedApiKey,
      secret_key_encrypted: encryptedSecretKey,
      is_connected: true,
      last_verified_at: now,
      updated_at: now,
    });

    if (error) {
      return {
        success: false,
        error: 'Steadfast configuration storage is unavailable. Please run the database migration (supabase_schema.sql) in your Supabase SQL Editor.',
      };
    }

    // Sync status with site_settings table if present
    try {
      await supabase.from('site_settings').upsert({
        id: 'default_settings',
        steadfast_enabled: true,
        updated_at: now,
      });
    } catch {
      // Non-blocking
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: 'Steadfast configuration storage is unavailable. ' + (err?.message || 'Please check database permissions.'),
    };
  }
}

/**
 * Disconnect and clear Steadfast credentials strictly in Supabase public.steadfast_config.
 * ZERO LOCAL FILES / SINGLE SOURCE OF TRUTH.
 */
export async function disconnectSteadfast(): Promise<{ success: boolean; error?: string }> {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      error: 'Steadfast configuration storage is unavailable. Supabase client is not initialized.',
    };
  }

  const now = new Date().toISOString();

  try {
    const { error } = await supabase.from('steadfast_config').upsert({
      id: 'primary',
      api_key_encrypted: '',
      secret_key_encrypted: '',
      is_connected: false,
      last_verified_at: null,
      updated_at: now,
    });

    if (error) {
      return {
        success: false,
        error: 'Steadfast configuration storage is unavailable. Please run the database migration (supabase_schema.sql) in your Supabase SQL Editor.',
      };
    }

    try {
      await supabase.from('site_settings').upsert({
        id: 'default_settings',
        steadfast_enabled: false,
        updated_at: now,
      });
    } catch {
      // Non-blocking
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: 'Steadfast configuration storage is unavailable. ' + (err?.message || ''),
    };
  }
}
