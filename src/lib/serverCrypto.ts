import 'server-only';
import crypto from 'crypto';
import { serverConfig } from '../server/config';

if (typeof window !== 'undefined') {
  throw new Error('CRITICAL SECURITY ERROR: serverCrypto can only run in a server environment.');
}

// 32-byte key derived from serverConfig.encryption.keyHex
const ENCRYPTION_KEY = Buffer.from(serverConfig.encryption.keyHex, 'hex');

/**
 * Encrypt plaintext using authenticated AES-256-GCM.
 * Output format: `<iv_hex>:<authTag_hex>:<ciphertext_hex>`
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return '';

  // 12-byte IV standard for GCM mode
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext}`;
}

/**
 * Decrypt ciphertext using authenticated AES-256-GCM.
 * Validates integrity via GCM auth tag before returning plaintext.
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData || typeof encryptedData !== 'string') return '';

  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    // If not in 3-part GCM format, return empty
    return '';
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  if (!ivHex || !authTagHex || !ciphertextHex) return '';

  try {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch {
    // Safe failure: do not log ciphertext or sensitive data
    return '';
  }
}
