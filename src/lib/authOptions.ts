import { NextAuthOptions } from "next-auth";
import { env } from "./env";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  adapter: PrismaAdapter(db),

  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, user }) {
      const userId = user?.id;
      if (userId) {
        token.id = userId;
      }
      return token;
    },

    async session({ session, user, token }) {
      // Add userId into session object
      const userId = token.id as string | undefined;
      if (userId) {
        session.user.id = userId;
      }
      return session;
    },
  },
};
