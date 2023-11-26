import { NextAuthOptions } from "next-auth";
import { env } from "./env";
import { PrismaClient } from "@prisma/client";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";


const prisma = new PrismaClient();


export const authOptions: NextAuthOptions = {
    pages: {
      signIn: "/login",
    },
    adapter: PrismaAdapter(prisma),
  
    providers: [
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }),
      // ...add more providers here
    ],
    callbacks: {
      // Add userId to session
      async session({  session, user }) {
        session.user.id = user.id;
        return session
      },
    },

  
  };