import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashToken } from './crypto';
import type { MfaLevel, MfaSession } from '@prisma/client';

export const MFA_COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-aihaat-mfa' : 'aihaat-mfa';
const MFA_SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

export async function createMfaSession(userId: string, level: MfaLevel): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const now = new Date();
  
  await prisma.mfaSession.create({
    data: {
      userId,
      tokenHash,
      mfaLevel: level,
      verifiedAt: now,
      expiresAt: new Date(now.getTime() + MFA_SESSION_DURATION_MS),
    }
  });
  
  return token;
}

export function setMfaCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: MFA_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MFA_SESSION_DURATION_MS / 1000
  });
}

export async function getMfaSession(request: Request, userId?: string): Promise<MfaSession | null> {
  const cookieStr = request.headers.get('cookie');
  if (!cookieStr) return null;
  
  const match = cookieStr.match(new RegExp(`(^| )${MFA_COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  
  const token = match[2];
  const tokenHash = hashToken(token);
  
  const whereClause: any = {
    tokenHash,
    revokedAt: null,
    expiresAt: { gt: new Date() }
  };
  
  // SECURITY: Bind MFA session to the specific user to prevent cross-user cookie abuse
  if (userId) {
    whereClause.userId = userId;
  }
  
  const session = await prisma.mfaSession.findFirst({
    where: whereClause
  });
  
  return session;
}

export async function getMfaSessionFromCookieStore(userId?: string): Promise<MfaSession | null> {
  const cookieStore = cookies();
  const tokenObj = cookieStore.get(MFA_COOKIE_NAME);
  
  if (!tokenObj?.value) return null;
  
  const tokenHash = hashToken(tokenObj.value);
  
  const whereClause: any = {
    tokenHash,
    revokedAt: null,
    expiresAt: { gt: new Date() }
  };
  
  // SECURITY: Bind MFA session to the specific user to prevent cross-user cookie abuse
  if (userId) {
    whereClause.userId = userId;
  }
  
  const session = await prisma.mfaSession.findFirst({
    where: whereClause
  });
  
  return session;
}

export async function revokeMfaSession(sessionId: string): Promise<void> {
  await prisma.mfaSession.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() }
  });
}

export async function revokeAllMfaSessions(userId: string): Promise<void> {
  await prisma.mfaSession.updateMany({
    where: { 
      userId, 
      revokedAt: null 
    },
    data: { revokedAt: new Date() }
  });
}

export async function recordStepUp(sessionId: string): Promise<void> {
  await prisma.mfaSession.update({
    where: { id: sessionId },
    data: { lastStepUpAt: new Date() }
  });
}

export function clearMfaCookie(response: NextResponse): void {
  response.cookies.set({
    name: MFA_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}
