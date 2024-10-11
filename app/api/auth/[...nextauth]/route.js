import NextAuth from "next-auth/next";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.uid = user.id;
      }
      if (account?.provider === 'google') {
        token.googleAccountId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.uid;
        session.googleAccountId = token.googleAccountId;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      if (account.provider === "google") {
        if (!profile?.email) {
          return false;
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
          include: { accounts: true },
        });

        if (existingUser) {
          const existingGoogleAccount = existingUser.accounts.find(
            (acc) => acc.provider === "google"
          );

          if (!existingGoogleAccount) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          }
        } else {
          await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name,
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              },
            },
          });
        }
      }
      return true;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };