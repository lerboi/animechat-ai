import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const { name } = await req.json();

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { name },
        });

        return new Response(JSON.stringify({ name: updatedUser.name }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error updating user name:", error);
        return new Response(JSON.stringify({ error: "Failed to update user name" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}