import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userCharacters = await prisma.userCharacter.findMany({
            where: { userId: session.user.id },
            include: { character: true },
            orderBy: { updatedAt: 'desc' }
        });

        const lastMessages = userCharacters.map(uc => ({
            id: uc.id,
            characterId: uc.characterId,
            name: uc.character.name,
            avatar: uc.character.picture,
            lastMessage: uc.chatHistory.length > 0 ? uc.chatHistory[uc.chatHistory.length - 1] : null,
            updatedAt: uc.updatedAt
        }));

        return NextResponse.json(lastMessages);
    } catch (error) {
        console.error("Error fetching last messages:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}