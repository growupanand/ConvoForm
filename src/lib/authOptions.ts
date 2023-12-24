import { NextAuthOptions, Profile } from "next-auth";
import { env } from "./env";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import { EMAIL_SERVER } from "./constants";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";

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
      // To prevent the error 'OAuthAccountNotLinkedThis' we are using this.
      //
      // This will allow user to login with same email with multiple providers, If we don't use this
      // then user will get an error 'OAuthAccountNotLinkedThis' if he tries to login with different provider,
      //
      // Example:
      // - User first logged in with email provider
      // - then he tries to login with google for the same email,
      //
      allowDangerousEmailAccountLinking: true,
    }),
    ...(EMAIL_SERVER
      ? [
          EmailProvider({
            server: EMAIL_SERVER,
            async sendVerificationRequest({
              identifier: email,
              url,
              provider: { server, from },
            }) {
              const transport = nodemailer.createTransport(server);
              await transport.sendMail({
                to: email,
                from,
                subject: `Sign in to Smart form wizard`,
                html: `
            <p>Hi ${email},</p>
            <p>Click the link below to sign in to your app. This link is valid for 24 hours.</p>
            <p><a href="${url}">Sign In</a></p>
            <p>Thanks,</p>
            <p>Smart form wizard</p>
            `,
              });
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // If user logged in using google, We want to save updated user data in database
      if (account?.provider === "google") {
        const existUser = await db.user.findFirst({
          where: {
            email: user.email,
          },
        });

        if (existUser && profile) {
          const updatedProfile = profile as Profile & {
            picture?: string;
          };
          const updatedData = {
            name: updatedProfile.name || existUser.name,
            image: updatedProfile.picture || existUser.image,
          };

          await db.user.update({
            where: {
              id: existUser.id,
            },
            data: updatedData,
          });

          // We also want to use updated user data in sessions
          token.name = updatedData.name;
          token.image = updatedData.image;
        }
      }

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
