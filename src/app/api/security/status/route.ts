import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { getMfaSessionFromCookieStore } from '@/lib/mfa/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const userSecurity = await prisma.userSecurity.findUnique({
      where: { userId: user.id },
    });

    const recoveryCodesRemaining = await prisma.recoveryCode.count({
      where: { userId: user.id, usedAt: null },
    });

    const trustedDeviceCount = await prisma.trustedDevice.count({
      where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
    });

    const activeSessions = await prisma.mfaSession.count({
      where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
    });

    const mfaSession = await getMfaSessionFromCookieStore(user.id);
    const isMfaVerified = !!(mfaSession && mfaSession.mfaLevel === 'MFA_VERIFIED');

    const totpEnabled = userSecurity?.totpEnabled ?? false;
    const mfaRequired = user.role === 'ADMIN' ? true : totpEnabled;

    return NextResponse.json({
      totpEnabled,
      mfaRequired,
      isMfaVerified,
      recoveryCodesRemaining,
      trustedDeviceCount,
      activeSessions,
    });
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
