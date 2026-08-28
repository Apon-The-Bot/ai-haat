import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { verifyRecoveryCode } from '@/lib/mfa/crypto';
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
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

    const rateLimit = checkRateLimit(`recovery-verify:${user.id}`, 3, 15 * 60 * 1000);
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterMs);

    const unusedCodes = await prisma.recoveryCode.findMany({
      where: { userId: user.id, usedAt: null }
    });

    const matchingCode = unusedCodes.find(c => verifyRecoveryCode(String(code), c.codeHash));

    if (matchingCode) {
      await prisma.$transaction([
        prisma.recoveryCode.update({
          where: { id: matchingCode.id },
          data: { usedAt: new Date() }
        }),
        prisma.userSecurity.update({
          where: { userId: user.id },
          data: { totpEnabled: false, totpSecretEncrypted: null, lastTotpStep: null }
        })
      ]);

      const sessionToken = await createMfaSession(user.id, 'MFA_VERIFIED');
      const res = NextResponse.json({ 
        success: true, 
        remainingCodes: unusedCodes.length - 1,
        totpDisabled: true,
        message: 'Please re-enroll TOTP'
      });
      await setMfaCookie(res, sessionToken);

      await logSecurityEvent(user.id, 'RECOVERY_USED', true, undefined, ip);
      return res;
    } else {
      await logSecurityEvent(user.id, 'RECOVERY_USED', false, { reason: 'Invalid code' }, ip);
      return NextResponse.json({ error: 'Invalid recovery code' }, { status: 400 });
    }
  } catch (error) {
    console.error('Recovery verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
