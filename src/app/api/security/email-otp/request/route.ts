import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { generateSecureOtp, hashOtp } from '@/lib/mfa/crypto';
import { sendOtpEmail } from '@/utils/email';

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
    const { purpose } = await req.json();
    if (!purpose) return NextResponse.json({ error: 'Purpose required' }, { status: 400 });

    const rateLimit = await checkRateLimit(`email-otp:${user.id}`, 3, 15 * 60 * 1000);
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterMs);

    const otp = generateSecureOtp();
    const hash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Invalidate previous unconsumed challenges for this user and purpose
    await prisma.otpChallenge.updateMany({
      where: {
        userId: user.id,
        purpose,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    await prisma.otpChallenge.create({
      data: {
        userId: user.id,
        purpose,
        codeDigest: hash,
        expiresAt,
      },
    });

    if (user.email) {
      await sendOtpEmail(user.email, otp, purpose);
    }
    
    await logSecurityEvent(user.id, 'EMAIL_OTP_SENT', true, { purpose }, ip);

    return NextResponse.json({ success: true, expiresAt });
  } catch (error) {
    console.error('Email OTP request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
