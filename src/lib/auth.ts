import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { sendWelcomeEmail } from "@/utils/email";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile(profile) {
        if (!profile.email_verified || !profile.email) throw new Error("Verified Google email required");
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "USER",
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
                  role: "USER",
                  walletBalanceBDT: 0,
                },
                include: { security: true },
              });
              isNewUser = true;
            } else {
              // Update user name/image and admin role if needed
              const updateData: any = {};
              if (user.image && user.image !== dbUser.image) {
                updateData.image = user.image;
              }
              if (user.name && !dbUser.name) {
                updateData.name = user.name;
              }
              if (Object.keys(updateData).length > 0) {
                dbUser = await prisma.user.update({
                  where: { id: dbUser.id },
                  data: updateData,
                  include: { security: true },
                });
              }
            }

            const effectiveRole = dbUser.role;
            token.appUserId = dbUser.id; // Canonical Prisma User ID
            token.id = dbUser.id;
            token.role = effectiveRole;
            token.picture = dbUser.image || user.image;
            token.walletBalanceBDT = dbUser.walletBalanceBDT || 0;
            token.mfaRequired = dbUser.security?.totpEnabled ?? false;
            token.googleSub = googleSub;
            token.registrationAt = isNewUser ? Date.now() : undefined;

            // Only send welcome onboarding email once for newly created accounts
            if (isNewUser && user.name) {
              sendWelcomeEmail({ name: user.name, email }).catch(() => {});
            }
          } catch {
            throw new Error("Unable to verify account");
          }
        }
      } else if (token.email) {
        // 2. Token refresh / existing session
        const email = (token.email as string).toLowerCase().trim();

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
            token.appUserId = dbUser.id;
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.walletBalanceBDT = dbUser.walletBalanceBDT || 0;
            token.mfaRequired = dbUser.security?.totpEnabled ?? false;
          } else {
            delete token.appUserId;
            delete token.id;
            token.role = "USER";
          }
        } catch {
          delete token.appUserId;
          delete token.id;
          token.role = "USER";
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
        (session.user as any).role = token.role === "ADMIN" ? "ADMIN" : "USER";
        (session.user as any).walletBalanceBDT = (token.walletBalanceBDT as number) || 0;
        (session.user as any).mfaRequired = Boolean(token.mfaRequired);
        if (canonicalId && typeof token.registrationAt === "number" && Date.now() - token.registrationAt < 10 * 60_000) {
          (session.user as typeof session.user & { registrationAt?: number }).registrationAt = token.registrationAt;
        }
        if (token.picture) {
          session.user.image = token.picture as string;
        }
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
  secret: (() => {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error(
        "[FATAL] NEXTAUTH_SECRET environment variable is not set. " +
        "Generate one with: openssl rand -base64 32"
      );
    }
    return secret;
  })(),
};
