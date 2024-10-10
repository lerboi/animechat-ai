import NextAuth from "next-auth/next";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt"
import { NextResponse } from "next/server";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            credentials: {
                email: { type: "email" },
                password: { type: "password" }
            },
            async authorize(credentials) {
                let user = null

                try{
                    const hashedPass = await bcrypt.hash(credentials.password, 10)
                    const checkUser = await prisma.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    })
                    if(checkUser){ 
                        const checkPass = await bcrypt.compare(credentials.password, checkUser.password)
                        if(checkPass){
                            user = {
                                email: credentials.email
                            }
                            return user
                        }
                        else {
                            return NextResponse.json({status: 402})
                        }

                    } else {
                        return NextResponse.json({status: 402})
                    }
                } 
                catch(err){
                    return NextResponse.json({status: 402})
                }
            }
        })
    ],
    session: {
        jwt: true
      },
    callbacks: {
        async session({ session, user }) {
            session.user.id = user?.id
            session.googleAccountId = token.googleAccountId;
            return session
        },
        async jwt({ token, user, account }) {
            if (account?.provider === 'google') {
              token.googleAccountId = account.id; // or the correct field from the response
            }
            return token;
          },
          async signIn({ user, account, profile }) {
            if (account.provider === "google") {
              if (!profile?.email) {
                throw new Error("No profile");
              }
          
              const existingUser = await prisma.user.findUnique({
                where: { email: profile.email },
                include: { accounts: true },
              });
          
              if (existingUser) {
                // Check if Google account is already linked
                const existingGoogleAccount = existingUser.accounts.find(
                  (acc) => acc.provider === "google"
                );
          
                if (!existingGoogleAccount) {
                  // Link the Google account if it's not already linked
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
                return true;
              } else {
                // Create new user if it doesn't exist
                const newUser = await prisma.user.create({
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
                return true;
              }
            }
          
            return true; // Allow sign in
          }
        
    },
    cookies: {
        sessionToken: {
          name: 'next-auth.session-token',
          options: {
            httpOnly: true,
            //secure: process.env.NODE_ENV === "production", // set to false in development
          },
        },
      }
}

export const handler = NextAuth(authOptions)
const GET = handler
const POST = handler

export { GET, POST }