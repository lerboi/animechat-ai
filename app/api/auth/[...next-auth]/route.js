import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const authOptions = {
    providers: [
        Credentials({
            credentials: {
                email: { type: "email" },
                password: { type: "password" }
            },
            async authorize(credentials) {
                let user = null

                user = {
                    email: "leroyzzng@gmail.com",
                    password: "123"
                }

                return user
            }
        })
    ]
}

export const handlers = NextAuth(authOptions)
const GET = NextAuth()
const POST = NextAuth()
export { GET, POST }