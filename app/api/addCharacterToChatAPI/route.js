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
        const { characterId } = await req.json();

        // Fetch the character and its related persona data
        const character = await prisma.character.findUnique({
            where: { id: characterId },
            include: { personaData: true },
        });

        if (!character) {
            return NextResponse.json({ error: "Character not found" }, { status: 404 });
        }

        // Check if a UserCharacter entry already exists
        const existingUserCharacter = await prisma.userCharacter.findFirst({
            where: {
                userId: String(session.user.id),
                characterId: character.id,
            },
        });

        let userCharacter;

        if (existingUserCharacter) {
            // If it exists, update the existing entry
            userCharacter = await prisma.userCharacter.update({
                where: {
                    id: existingUserCharacter.id,
                },
                data: {
                    version: existingUserCharacter.version + 1,
                    // You might want to update other fields here if necessary
                },
            });
        } else {
            // If it doesn't exist, create a new entry
            userCharacter = await prisma.userCharacter.create({
                data: {
                    userId: String(session.user.id),
                    characterId: character.id,
                    version: 1,
                    chatHistory: [],
                },
            });
        }

        return NextResponse.json({ success: true, userCharacter });
    } catch (error) {
        console.error("Error adding character to chat:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}