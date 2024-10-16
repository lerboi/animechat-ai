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
        const { characterId, message } = await req.json();

        const userCharacter = await prisma.userCharacter.findFirst({
            where: {
                userId: session.user.id,
                characterId: parseInt(characterId)
            },
            include: {
                character: true // Include the Character table
            }
        });

        if (!userCharacter) {
            return NextResponse.json({ error: "UserCharacter not found" }, { status: 404 });
        }

        const newChatHistory = [
            ...userCharacter.chatHistory,
            `${message.isUser ? 'User' : userCharacter.character.name}: "${message.content}"`
        ];

        await prisma.userCharacter.update({
            where: { id: userCharacter.id },
            data: { 
                chatHistory: newChatHistory,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating chat history:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}