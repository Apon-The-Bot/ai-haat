import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { getMfaSessionFromCookieStore, revokeMfaSession, clearMfaCookie } from '@/lib/mfa/session';

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
    const session = await getMfaSessionFromCookieStore(user.id);
    
    if (session) {
      await revokeMfaSession(session.id);
    }

    const res = NextResponse.json({ success: true });
    await clearMfaCookie(res);
    
    await logSecurityEvent(user.id, 'SESSION_REVOKED', true, undefined, ip);

    return res;
  } catch (error) {
    console.error('Revoke session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
