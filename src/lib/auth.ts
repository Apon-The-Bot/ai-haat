import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { sendWelcomeEmail } from "@/utils/email";

const adminEmails = (process.env.ADMIN_EMAILS || "mdamanullahsheikhapon@gmail.com,admin@aihaat.com")
  .split(",")
  .map((e) => e.trim().toLowerCase());

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "google_dummy_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google_dummy_client_secret",
      profile(profile) {
        const isAdmin = adminEmails.includes(profile.email?.toLowerCase() || "");
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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email / Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email.toLowerCase().trim();
        const isAdmin = adminEmails.includes(email) || email.includes("admin");

        return {
          id: `usr-${Date.now()}`,
          name: isAdmin ? "Admin (Amanullah)" : "Amanullah Sheikh",
          email: email.includes("@") ? email : `${email}@aihaat.com`,
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          role: isAdmin ? "ADMIN" : "USER",
          walletBalanceBDT: 500,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
        token.walletBalanceBDT = (user as any).walletBalanceBDT || 0;

        if (user.email && user.name) {
          sendWelcomeEmail({ name: user.name, email: user.email }).catch(() => {});
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as string) || "USER";
        (session.user as any).walletBalanceBDT = (token.walletBalanceBDT as number) || 0;
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
