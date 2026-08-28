import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function logSecurityEvent(userId: string | null, event: any, success: boolean, metadata?: Record<string, unknown>, ipAddress?: string) {
  await prisma.securityAuditLog.create({ data: { userId, event, success, metadata: metadata ? JSON.stringify(metadata) : null, ipAddress } }).catch(console.error);
}

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function GET(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const devices = await prisma.trustedDevice.findMany({
      where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastUsedAt: 'desc' }
    });

    const cookieStore = cookies();
    const currentDeviceToken = cookieStore.get('DEVICE_TOKEN')?.value;
    
    const formatted = devices.map(d => ({
      id: d.id,
      label: d.label,
      lastUsedAt: d.lastUsedAt,
      createdAt: d.createdAt,
      isCurrent: false 
    }));

    return NextResponse.json({ devices: formatted });
  } catch (error) {
    console.error('List devices error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  const ip = getIp(req);

  try {
    const { action, deviceId, revokeAll } = await req.json();

    if (action === 'revoke') {
      if (revokeAll) {
        await prisma.trustedDevice.updateMany({
          where: { userId: user.id, revokedAt: null },
          data: { revokedAt: new Date() }
        });
        await logSecurityEvent(user.id, 'DEVICE_REVOKED', true, { revokeAll: true }, ip);
        return NextResponse.json({ success: true });
      } else if (deviceId) {
        await prisma.trustedDevice.updateMany({
          where: { id: deviceId, userId: user.id, revokedAt: null },
          data: { revokedAt: new Date() }
        });
        await logSecurityEvent(user.id, 'DEVICE_REVOKED', true, { deviceId }, ip);
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Revoke device error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
