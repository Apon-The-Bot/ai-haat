import { NextRequest, NextResponse } from 'next/server';
import { requireMfaVerified } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { verifyTotp } from '@/lib/mfa/totp';
import { decryptTotpSecret, verifyOtp, generateRecoveryCodes, hashToken } from '@/lib/mfa/crypto';

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
    const { totpToken, emailOtpToken } = await req.json();
    if (!totpToken || !emailOtpToken) return NextResponse.json({ error: 'Tokens required' }, { status: 400 });

    const userSec = await prisma.userSecurity.findUnique({ where: { userId: user.id } });
    if (!userSec?.totpEnabled || !userSec.totpSecretEncrypted) {
      return NextResponse.json({ error: 'TOTP not enabled' }, { status: 400 });
    }

    const secret = await decryptTotpSecret(userSec.totpSecretEncrypted);
    const result = verifyTotp(secret, totpToken, userSec.lastTotpStep ?? undefined);
    if (!result || !result.valid) {
      return NextResponse.json({ error: 'Invalid TOTP token' }, { status: 400 });
    }

    const challenge = await prisma.otpChallenge.findFirst({
      where: { userId: user.id, purpose: 'SECURITY_CHANGE', consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });

    if (!challenge || !(await verifyOtp(emailOtpToken, challenge.codeDigest))) {
      return NextResponse.json({ error: 'Invalid Email OTP' }, { status: 400 });
    }

    const plainCodes = generateRecoveryCodes(10);
    const hashedCodes = await Promise.all(plainCodes.map(c => hashToken(c)));

    await prisma.$transaction([
      prisma.userSecurity.update({
        where: { userId: user.id },
        data: { lastTotpStep: result.step }
      }),
      prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { consumedAt: new Date() }
      }),
      prisma.recoveryCode.deleteMany({ where: { userId: user.id } }),
      prisma.recoveryCode.createMany({
        data: hashedCodes.map(hash => ({ userId: user.id, codeHash: hash }))
      })
    ]);

    await logSecurityEvent(user.id, 'SECURITY_CHANGE', true, { action: 'regenerate_recovery_codes' }, ip);

    return NextResponse.json({ success: true, recoveryCodes: plainCodes });
  } catch (error) {
    console.error('Regenerate recovery error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
