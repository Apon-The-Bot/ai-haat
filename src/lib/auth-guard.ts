import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions, isUserAdmin } from './auth';
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
  const isAdmin = isUserAdmin(user.email);
  
  if (!user.id || !user.role) {
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: user.email },
          { email: user.email.toLowerCase() },
        ]
      },
      select: { id: true, email: true, role: true, name: true }
    });
    
    if (!dbUser) {
      return {
        user: {
          id: user.id || `user-${user.email}`,
          email: user.email,
          role: isAdmin ? 'ADMIN' : 'USER',
          name: user.name
        }
      };
    }
    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: isAdmin ? 'ADMIN' : dbUser.role,
        name: dbUser.name ?? undefined
      }
    };
  }
  
  if (isAdmin) {
    user.role = 'ADMIN';
  }
  
  return { user };
}

export async function requireAdmin(): Promise<AuthResult | NextResponse> {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  
  const isAdmin = auth.user.role === 'ADMIN' || isUserAdmin(auth.user.email);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  auth.user.role = 'ADMIN';
  return auth;
}

export async function requireMfaVerified(): Promise<MfaAuthResult | NextResponse> {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  
  let isMfaEnabled = false;
  try {
    const userSecurity = await prisma.userSecurity.findUnique({
      where: { userId: auth.user.id }
    });
    isMfaEnabled = userSecurity?.totpEnabled ?? false;
  } catch (err) {
    console.warn("[MFA Status Check Warning]:", err);
  }
  
  if (isMfaEnabled) {
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
  const mfa = await requireMfaVerified();
  if (mfa instanceof NextResponse) return mfa;
  
  if (mfa.mfaSession.mfaLevel === 'NONE') {
    return mfa;
  }
  
  const now = new Date();
  const maxAgeMs = maxAgeMinutes * 60 * 1000;
  
  if (now.getTime() - mfa.mfaSession.verifiedAt.getTime() > maxAgeMs) {
    return NextResponse.json(
      { error: 'Recent MFA re-authentication required for this sensitive action', code: 'STEP_UP_REQUIRED' },
      { status: 403 }
    );
  }
  
  return mfa;
}
