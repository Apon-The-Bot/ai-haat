import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { verifyOtp } from '@/lib/mfa/crypto';

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
    const { token, purpose } = await req.json();
    if (!token || !purpose) return NextResponse.json({ error: 'Token and purpose required' }, { status: 400 });

    const rateLimit = checkRateLimit(`email-otp-verify:${user.id}`, 5, 5 * 60 * 1000);
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterMs);

    const challenge = await prisma.otpChallenge.findFirst({
      where: { userId: user.id, purpose, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });

    if (!challenge) {
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 });
    }

    if (challenge.attemptCount >= 3) {
      return NextResponse.json({ error: 'Max attempts reached' }, { status: 400 });
    }

    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attemptCount: { increment: 1 } }
    });

    const isValid = await verifyOtp(token, challenge.codeDigest);
    if (isValid) {
      await prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { consumedAt: new Date() }
      });
      await logSecurityEvent(user.id, 'EMAIL_OTP_OK', true, { purpose }, ip);
      return NextResponse.json({ success: true });
    } else {
      await logSecurityEvent(user.id, 'EMAIL_OTP_FAIL', false, { purpose }, ip);
      return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 });
    }
  } catch (error) {
    console.error('Email OTP verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
