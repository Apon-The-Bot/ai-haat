import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { generateTotpSecret, generateTotpUri, generateQrDataUrl, verifyTotp } from '@/lib/mfa/totp';
import { encryptTotpSecret, decryptTotpSecret, generateRecoveryCodes, hashToken } from '@/lib/mfa/crypto';
import { createMfaSession, setMfaCookie } from '@/lib/mfa/session';

export const dynamic = 'force-dynamic';

async function logSecurityEvent(userId: string | null, event: any, success: boolean, metadata?: Record<string, unknown>, ipAddress?: string) {
  await prisma.securityAuditLog.create({ data: { userId, event, success, metadata: metadata ? JSON.stringify(metadata) : null, ipAddress } }).catch(console.error);
}

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  const ip = getIp(req);

  try {
    const body = await req.json();
    const { action, token } = body;

    if (action === 'start') {
      const rateLimit = checkRateLimit(`totp-setup-start:${user.id}`, 5, 15 * 60 * 1000);
      if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterMs);

      let userSec = await prisma.userSecurity.findUnique({ where: { userId: user.id } });
      if (userSec?.totpEnabled) {
        return NextResponse.json({ error: 'TOTP already enabled' }, { status: 400 });
      }

      const secret = generateTotpSecret();
      const uri = generateTotpUri(user.email || user.id, secret);
      const qrDataUrl = await generateQrDataUrl(uri);

      const encrypted = await encryptTotpSecret(secret);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.userSecurity.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          pendingTotpSecret: encrypted,
          pendingTotpExpiresAt: expiresAt,
        },
        update: {
          pendingTotpSecret: encrypted,
          pendingTotpExpiresAt: expiresAt,
        },
      });

      await logSecurityEvent(user.id, 'TOTP_SETUP', true, undefined, ip);

      return NextResponse.json({ qrDataUrl, manualKey: secret, expiresAt });
    }

    if (action === 'verify') {
      const rateLimit = checkRateLimit(`totp-setup-verify:${user.id}`, 5, 5 * 60 * 1000);
      if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterMs);

      if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

      const userSec = await prisma.userSecurity.findUnique({ where: { userId: user.id } });
      if (!userSec?.pendingTotpSecret || !userSec.pendingTotpExpiresAt) {
        return NextResponse.json({ error: 'No pending setup' }, { status: 400 });
      }

      if (userSec.pendingTotpExpiresAt < new Date()) {
        return NextResponse.json({ error: 'Setup expired' }, { status: 400 });
      }

      const secret = await decryptTotpSecret(userSec.pendingTotpSecret);
      const result = verifyTotp(secret, token);

      if (!result || !result.valid) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
      }

      const permanentlyEncrypted = await encryptTotpSecret(secret);
      const plainCodes = generateRecoveryCodes(10);
      const hashedCodes = await Promise.all(plainCodes.map(c => hashToken(c)));

      await prisma.$transaction(async (tx) => {
        await tx.userSecurity.update({
          where: { userId: user.id },
          data: {
            totpEnabled: true,
            totpSecretEncrypted: permanentlyEncrypted,
            pendingTotpSecret: null,
            pendingTotpExpiresAt: null,
          }
        });
        await tx.recoveryCode.deleteMany({ where: { userId: user.id } });
        await tx.recoveryCode.createMany({
          data: hashedCodes.map(hash => ({ userId: user.id, codeHash: hash }))
        });
      });

      const sessionToken = await createMfaSession(user.id, 'MFA_VERIFIED');
      const res = NextResponse.json({ success: true, recoveryCodes: plainCodes });
      await setMfaCookie(res, sessionToken);

      await logSecurityEvent(user.id, 'TOTP_ENABLED', true, undefined, ip);

      return res;
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('TOTP setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
