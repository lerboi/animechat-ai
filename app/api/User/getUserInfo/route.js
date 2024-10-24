import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                name: true,
                email: true,
                textTokens: true,
                imageTokens: true,
            },
        });

        return new Response(JSON.stringify(user), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching user info:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch user info" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}