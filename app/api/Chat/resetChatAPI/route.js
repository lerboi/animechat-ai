import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { characterId, userId } = await req.json();

        const userCharacter = await prisma.userCharacter.findFirst({
            where: {
                userId: userId,
                characterId: parseInt(characterId),
            },
        });

        if (!userCharacter) {
            return NextResponse.json({ error: "UserCharacter not found" }, { status: 404 });
        }

        await prisma.userCharacter.update({
            where: { id: userCharacter.id },
            data: { 
                chatHistory: [],
                updatedAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error resetting chat history:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}