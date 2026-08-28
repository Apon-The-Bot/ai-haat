import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { sendWelcomeEmail } from "@/utils/email";
import { prisma } from "@/lib/prisma";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET must be set");
}
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
}

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        const email = profile.email?.toLowerCase() || "";
        const isAdmin = adminEmails.includes(email);
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: isAdmin ? "ADMIN" : "USER",
          walletBalanceBDT: 0,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // 1. Initial Sign-in: Resolve or create Canonical Prisma User
      if (user) {
        const googleSub = user.id;
        const email = (user.email || "").toLowerCase().trim();
        const isAdmin = adminEmails.includes(email);

        if (email) {
          try {
            let dbUser = await prisma.user.findUnique({
              where: { email },
              include: { security: true },
            });

            let isNewUser = false;
            if (!dbUser) {
              dbUser = await prisma.user.create({
                data: {
                  email,
                  name: user.name || null,
                  image: user.image || null,
                  role: isAdmin ? "ADMIN" : "USER",
                  walletBalanceBDT: 0,
                },
                include: { security: true },
              });
              isNewUser = true;
            }

            const effectiveRole = dbUser.role || (isAdmin ? "ADMIN" : "USER");
            token.appUserId = dbUser.id; // Canonical Prisma User ID
            token.id = dbUser.id; // Canonical Prisma User ID
            token.role = effectiveRole;
            token.walletBalanceBDT = dbUser.walletBalanceBDT || 0;
            token.mfaRequired = effectiveRole === "ADMIN" || (dbUser.security?.totpEnabled ?? false);
            token.googleSub = googleSub;

            // Only send welcome onboarding email once for newly created accounts
            if (isNewUser && user.name) {
              sendWelcomeEmail({ name: user.name, email }).catch(() => {});
            }
          } catch (err) {
            console.error("[NextAuth JWT Sign-in Error]:", err);
          }
        }
      } else if (!token.appUserId && token.email) {
        // 2. Backward-Compatible Self-Healing for Legacy JWTs containing Google sub
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: (token.email as string).toLowerCase().trim() },
            include: { security: true },
          });
          if (dbUser) {
            token.appUserId = dbUser.id;
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.walletBalanceBDT = dbUser.walletBalanceBDT || 0;
            token.mfaRequired = dbUser.role === "ADMIN" || (dbUser.security?.totpEnabled ?? false);
          }
        } catch (err) {
          console.warn("[NextAuth Legacy Token Self-Healing Warning]:", err);
        }
      }

      // Guarantee canonical token.id maps to appUserId if available
      if (token.appUserId) {
        token.id = token.appUserId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const canonicalId = (token.appUserId || token.id) as string;
        (session.user as any).id = canonicalId;
        (session.user as any).role = (token.role as string) || "USER";
        (session.user as any).walletBalanceBDT = (token.walletBalanceBDT as number) || 0;
        (session.user as any).mfaRequired = token.mfaRequired as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
