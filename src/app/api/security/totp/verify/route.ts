import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { verifyTotp } from '@/lib/mfa/totp';
import { decryptTotpSecret } from '@/lib/mfa/crypto';
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
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

    const rateLimit = checkRateLimit(`totp-verify:${user.id}`, 5, 5 * 60 * 1000);
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterMs);

    const userSec = await prisma.userSecurity.findUnique({ where: { userId: user.id } });
    if (!userSec?.totpEnabled || !userSec.totpSecretEncrypted) {
      return NextResponse.json({ error: 'TOTP not enabled' }, { status: 400 });
    }

    const secret = await decryptTotpSecret(userSec.totpSecretEncrypted);
    const result = verifyTotp(secret, token, userSec.lastTotpStep ?? undefined);

    if (result && result.valid) {
      await prisma.userSecurity.update({
        where: { userId: user.id },
        data: { lastTotpStep: result.step }
      });

      const sessionToken = await createMfaSession(user.id, 'MFA_VERIFIED');
      const res = NextResponse.json({ success: true, mfaVerified: true });
      await setMfaCookie(res, sessionToken);

      await logSecurityEvent(user.id, 'TOTP_VERIFY_OK', true, undefined, ip);
      return res;
    } else {
      await logSecurityEvent(user.id, 'TOTP_VERIFY_FAIL', false, undefined, ip);
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }
  } catch (error) {
    console.error('TOTP verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
