import { NextRequest, NextResponse } from 'next/server';
import { requireMfaVerified } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { verifyTotp } from '@/lib/mfa/totp';
import { decryptTotpSecret, verifyOtp } from '@/lib/mfa/crypto';
import { revokeAllMfaSessions } from '@/lib/mfa/session';

export const dynamic = 'force-dynamic';

async function logSecurityEvent(userId: string | null, event: any, success: boolean, metadata?: Record<string, unknown>, ipAddress?: string) {
  await prisma.securityAuditLog.create({ data: { userId, event, success, metadata: metadata ? JSON.stringify(metadata) : null, ipAddress } }).catch(console.error);
}

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  const mfaResult = await requireMfaVerified();
  if (mfaResult instanceof NextResponse) return mfaResult;
  const { user } = mfaResult;
  const ip = getIp(req);

  try {
    const { token, emailOtpToken } = await req.json();
    if (!token || !emailOtpToken) {
      return NextResponse.json({ error: 'Tokens required' }, { status: 400 });
    }

    const userSec = await prisma.userSecurity.findUnique({ where: { userId: user.id } });
    if (!userSec?.totpEnabled || !userSec.totpSecretEncrypted) {
      return NextResponse.json({ error: 'TOTP not enabled' }, { status: 400 });
    }

    const secret = await decryptTotpSecret(userSec.totpSecretEncrypted);
    const result = verifyTotp(secret, token, userSec.lastTotpStep ?? undefined);
    if (!result || !result.valid) {
      return NextResponse.json({ error: 'Invalid TOTP token' }, { status: 400 });
    }

    const challenge = await prisma.otpChallenge.findFirst({
      where: { userId: user.id, purpose: 'MFA_DISABLE', consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });

    if (!challenge || !(await verifyOtp(emailOtpToken, challenge.codeDigest))) {
      return NextResponse.json({ error: 'Invalid Email OTP' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.userSecurity.update({
        where: { userId: user.id },
        data: { totpEnabled: false, totpSecretEncrypted: null, lastTotpStep: null }
      }),
      prisma.recoveryCode.deleteMany({ where: { userId: user.id } }),
      prisma.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } })
    ]);

    await revokeAllMfaSessions(user.id);
    await logSecurityEvent(user.id, 'MFA_DISABLED', true, undefined, ip);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('TOTP disable error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
