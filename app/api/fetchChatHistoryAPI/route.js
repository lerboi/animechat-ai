import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get('characterId');
    const userId = searchParams.get('userId');

    if (!characterId || !userId) {
        return NextResponse.json({ error: "Missing characterId or userId" }, { status: 400 });
    }

    try {
        const userCharacter = await prisma.userCharacter.findFirst({
            where: {
                userId: userId,
                characterId: parseInt(characterId),
            },
            include: {
                character: true
            }
        });

        if (!userCharacter) {
            return NextResponse.json({ error: "UserCharacter not found" }, { status: 404 });
        }

        return NextResponse.json({ 
            chatHistory: userCharacter.chatHistory,
            characterName: userCharacter.character.name
        });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}