import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';
import { getMfaSessionFromCookieStore } from './mfa/session';
import { prisma } from './prisma';

interface AuthResult {
  user: { id: string; email: string; role: string; name?: string };
}

interface MfaAuthResult extends AuthResult {
  mfaSession: { id: string; mfaLevel: string; verifiedAt: Date; lastStepUpAt: Date | null };
}

export async function requireAuth(): Promise<AuthResult | NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const user = session.user as { id: string; email: string; role: string; name?: string };
  
  if (!user.id || !user.role) {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, email: true, role: true, name: true }
    });
    
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return { user: { id: dbUser.id, email: dbUser.email, role: dbUser.role, name: dbUser.name ?? undefined } };
  }
  
  return { user };
}

export async function requireAdmin(): Promise<AuthResult | NextResponse> {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  
  if (auth.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  return auth;
}

export async function requireMfaVerified(): Promise<MfaAuthResult | NextResponse> {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  
  const userSecurity = await prisma.userSecurity.findUnique({
    where: { userId: auth.user.id }
  });
  
  const isMfaEnabled = userSecurity?.totpEnabled;
  const isAdmin = auth.user.role === 'ADMIN';
  
  if (isMfaEnabled || isAdmin) {
    const mfaSession = await getMfaSessionFromCookieStore(auth.user.id);
    
    if (!mfaSession || mfaSession.mfaLevel !== 'MFA_VERIFIED') {
      return NextResponse.json(
        { error: 'MFA verification required', code: 'MFA_REQUIRED' },
        { status: 403 }
      );
    }
    
    return {
      user: auth.user,
      mfaSession: {
        id: mfaSession.id,
        mfaLevel: mfaSession.mfaLevel,
        verifiedAt: mfaSession.verifiedAt,
        lastStepUpAt: mfaSession.lastStepUpAt
      }
    };
  }
  
  return {
    user: auth.user,
    mfaSession: {
      id: 'no-mfa-required',
      mfaLevel: 'NONE',
      verifiedAt: new Date(),
      lastStepUpAt: null
    }
  };
}

export async function requireAdminMfa(): Promise<MfaAuthResult | NextResponse> {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;
  
  return requireMfaVerified();
}

export async function requireRecentMfa(maxAgeMinutes: number = 10): Promise<MfaAuthResult | NextResponse> {
  const mfaAuth = await requireMfaVerified();
  if (mfaAuth instanceof NextResponse) return mfaAuth;
  
  if (mfaAuth.mfaSession.mfaLevel === 'NONE') {
    return mfaAuth;
  }
  
  const now = new Date();
  const lastStepUpAt = mfaAuth.mfaSession.lastStepUpAt ?? mfaAuth.mfaSession.verifiedAt;
  const ageMinutes = (now.getTime() - lastStepUpAt.getTime()) / (1000 * 60);
  
  if (ageMinutes > maxAgeMinutes) {
    return NextResponse.json(
      { error: 'Step-up authentication required', code: 'STEP_UP_REQUIRED' },
      { status: 403 }
    );
  }
  
  return mfaAuth;
}
