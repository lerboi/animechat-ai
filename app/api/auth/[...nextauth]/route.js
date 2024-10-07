import NextAuth from "next-auth/next";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            credentials: {
                email: { type: "email" },
                password: { type: "password" }
            },
            async authorize(credentials) {
                let user = null

                const checkExist = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })
                if (checkExist) {
                    user = {
                        email: credentials.email
                    }
                    return user
                }
                else {
                    return null
                }
            }
        })
    ]
}

export const handler = NextAuth(authOptions)
const GET = handler
const POST = handler

export { GET, POST } 