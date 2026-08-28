import crypto from 'crypto';

function getEncryptionKey(): Buffer {
  const key = process.env.MFA_ENCRYPTION_KEY;
  if (!key) throw new Error('Missing MFA_ENCRYPTION_KEY environment variable');
  if (key.length !== 64) throw new Error('MFA_ENCRYPTION_KEY must be a 64-character hex string');
  return Buffer.from(key, 'hex');
}

function getOtpPepper(): Buffer {
  const pepper = process.env.EMAIL_OTP_PEPPER;
  if (!pepper) throw new Error('Missing EMAIL_OTP_PEPPER environment variable');
  return Buffer.from(pepper, 'hex');
}

export function encryptTotpSecret(plainSecret: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let ciphertext = cipher.update(plainSecret, 'utf8', 'base64');
  ciphertext += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');
  
  return `v1:${iv.toString('base64')}:${ciphertext}:${authTag}`;
}

export function decryptTotpSecret(encrypted: string): string {
  const key = getEncryptionKey();
  const parts = encrypted.split(':');
  
  if (parts.length !== 4 || parts[0] !== 'v1') {
    throw new Error('Invalid encrypted TOTP secret format');
  }
  
  const [, ivBase64, ciphertextBase64, authTagBase64] = parts;
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let plain = decipher.update(ciphertextBase64, 'base64', 'utf8');
  plain += decipher.final('utf8');
  
  return plain;
}

export function encryptCredential(plaintext: string): string {
  return encryptTotpSecret(plaintext);
}

export function decryptCredential(encrypted: string): string {
  // If not encrypted with v1: format, return as-is for backward compatibility
  if (!encrypted || !encrypted.startsWith('v1:')) {
    return encrypted;
  }
  return decryptTotpSecret(encrypted);
}

export function hashOtp(otp: string): string {
  const pepper = getOtpPepper();
  return crypto.createHmac('sha256', pepper).update(otp).digest('hex');
}

export function verifyOtp(otp: string, digest: string): boolean {
  const hashed = hashOtp(otp);
  const bufHashed = Buffer.from(hashed, 'hex');
  const bufDigest = Buffer.from(digest, 'hex');
  
  if (bufHashed.length !== bufDigest.length) return false;
  return crypto.timingSafeEqual(bufHashed, bufDigest);
}

function getRecoveryCodePepper(): Buffer {
  const pepper = process.env.MFA_RECOVERY_CODE_PEPPER;
  if (!pepper) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MFA_RECOVERY_CODE_PEPPER environment variable is required in production');
    }
    // Explicit isolated fallback only for local unit tests and development
    const devFallback = 'aihaat_development_only_mfa_recovery_pepper_key';
    return Buffer.from(crypto.createHash('sha256').update(devFallback).digest('hex'), 'hex');
  }
  return Buffer.from(crypto.createHash('sha256').update(pepper).digest('hex'), 'hex');
}

export function hashRecoveryCode(code: string): string {
  const pepper = getRecoveryCodePepper();
  const normalized = code.trim().toUpperCase();
  const digest = crypto.createHmac('sha256', pepper).update(normalized).digest('hex');
  return `hmac-v1:${digest}`;
}

export function verifyRecoveryCode(code: string, storedHash: string): boolean {
  if (!code || !storedHash) return false;

  if (storedHash.startsWith('hmac-v1:')) {
    const expectedHex = storedHash.slice(8);
    const pepper = getRecoveryCodePepper();
    const normalized = code.trim().toUpperCase();
    const computedHex = crypto.createHmac('sha256', pepper).update(normalized).digest('hex');
    
    const bufComputed = Buffer.from(computedHex, 'hex');
    const bufExpected = Buffer.from(expectedHex, 'hex');
    if (bufComputed.length !== bufExpected.length) return false;
    return crypto.timingSafeEqual(bufComputed, bufExpected);
  }

  // Legacy format support (unpeppered SHA-256)
  const legacyUpper = crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
  const legacyRaw = crypto.createHash('sha256').update(code.trim()).digest('hex');
  
  if (storedHash.length === 64) {
    const bufStored = Buffer.from(storedHash, 'hex');
    const bufLegacyUpper = Buffer.from(legacyUpper, 'hex');
    const bufLegacyRaw = Buffer.from(legacyRaw, 'hex');

    if (bufStored.length === bufLegacyUpper.length && crypto.timingSafeEqual(bufStored, bufLegacyUpper)) {
      return true;
    }
    if (bufStored.length === bufLegacyRaw.length && crypto.timingSafeEqual(bufStored, bufLegacyRaw)) {
      return true;
    }
  }

  return false;
}

export function hashToken(token: string): string {
  return hashRecoveryCode(token);
}

export function generateSecureOtp(length: number = 6): string {
  const max = Math.pow(10, length) - 1;
  const num = crypto.randomInt(0, max + 1);
  return num.toString().padStart(length, '0');
}

export function generateRecoveryCodes(count: number = 10): string[] {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No 0, O, 1, I, L
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    let code = '';
    const bytes = crypto.randomBytes(8);
    for (let j = 0; j < 8; j++) {
      code += chars[bytes[j] % chars.length];
    }
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }
  
  return codes;
}
