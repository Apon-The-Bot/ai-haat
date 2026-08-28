import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import crypto from 'crypto';

export function generateTotpSecret(): string {
  const bytes = crypto.randomBytes(20);
  return new OTPAuth.Secret({ buffer: new Uint8Array(bytes).buffer }).base32;
}

export function generateTotpUri(email: string, secret: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: 'AI Haat',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret)
  });
  
  return totp.toString();
}

export async function generateQrDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, { width: 256, margin: 2 });
}

export function verifyTotp(secret: string, token: string, lastStep?: number | null): { valid: boolean; step: number } | null {
  const totp = new OTPAuth.TOTP({
    issuer: 'AI Haat',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret)
  });

  const delta = totp.validate({ token, window: 1 });
  if (delta === null) {
    return null;
  }

  const step = Math.floor(Date.now() / 1000 / 30) + delta;
  
  if (lastStep != null && step <= lastStep) {
    return null; // Replay attack prevention
  }

  return { valid: true, step };
}
