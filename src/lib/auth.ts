import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { sendWelcomeEmail } from "@/utils/email";
import { prisma } from "@/lib/prisma";

export const DEFAULT_ADMIN_EMAILS = [
  "mdamanullahsheikhapon@gmail.com",
  "seratul.alim@gmail.com",
  "seratulalimkhanrhythm@gmail.com",
  "admin@aihaat.com",
];

export function getAdminEmails(): string[] {
  const envAdmins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...envAdmins]));
}

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return getAdminEmails().includes(cleanEmail);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile(profile) {
        const email = profile.email?.toLowerCase().trim() || "";
        const isAdmin = isUserAdmin(email);
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
    async jwt({ token, user }) {
      // 1. Initial Sign-in: Resolve or create Canonical Prisma User
      if (user) {
        const googleSub = user.id;
        const email = (user.email || "").toLowerCase().trim();
        const isAdmin = isUserAdmin(email);

        if (email) {
          try {
            let dbUser = await prisma.user.findFirst({
              where: {
                OR: [
                  { email: email },
                  { email: email.toLowerCase() },
                ],
              },
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
            } else if (isAdmin && dbUser.role !== "ADMIN") {
              // Self-heal: elevate to ADMIN if email matches admin list
              dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: { role: "ADMIN" },
                include: { security: true },
              });
            }

            const effectiveRole = isAdmin ? "ADMIN" : (dbUser.role || "USER");
            token.appUserId = dbUser.id; // Canonical Prisma User ID
            token.id = dbUser.id;
            token.role = effectiveRole;
            token.walletBalanceBDT = dbUser.walletBalanceBDT || 0;
            token.mfaRequired = dbUser.security?.totpEnabled ?? false;
            token.googleSub = googleSub;

            // Only send welcome onboarding email once for newly created accounts
            if (isNewUser && user.name) {
              sendWelcomeEmail({ name: user.name, email }).catch(() => {});
            }
          } catch (err) {
            console.error("[NextAuth JWT Sign-in Error]:", err);
            // Fallback for offline/Prisma hiccups
            token.role = isAdmin ? "ADMIN" : "USER";
          }
        }
      } else if (token.email) {
        // 2. Token refresh / existing session
        const email = (token.email as string).toLowerCase().trim();
        const isAdmin = isUserAdmin(email);

        try {
          const dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: email },
                { email: email.toLowerCase() },
              ],
            },
            include: { security: true },
          });

          if (dbUser) {
            if (isAdmin && dbUser.role !== "ADMIN") {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { role: "ADMIN" },
              });
            }
            token.appUserId = dbUser.id;
            token.id = dbUser.id;
            token.role = isAdmin ? "ADMIN" : dbUser.role;
            token.walletBalanceBDT = dbUser.walletBalanceBDT || 0;
            token.mfaRequired = dbUser.security?.totpEnabled ?? false;
          } else {
            token.role = isAdmin ? "ADMIN" : (token.role || "USER");
          }
        } catch (err) {
          console.warn("[NextAuth Token Refresh Warning]:", err);
          if (isAdmin) {
            token.role = "ADMIN";
          }
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
        const email = session.user.email?.toLowerCase().trim();
        const isAdmin = isUserAdmin(email) || token.role === "ADMIN";
        const canonicalId = (token.appUserId || token.id) as string;
        (session.user as any).id = canonicalId;
        (session.user as any).role = isAdmin ? "ADMIN" : ((token.role as string) || "USER");
        (session.user as any).walletBalanceBDT = (token.walletBalanceBDT as number) || 0;
        (session.user as any).mfaRequired = Boolean(token.mfaRequired);
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
  secret: process.env.NEXTAUTH_SECRET || "aihaat_super_secure_nextauth_jwt_secret_key_2026_xyz",
};
