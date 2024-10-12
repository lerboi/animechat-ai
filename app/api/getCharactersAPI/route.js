import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const characters = await prisma.character.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                picture: true,
            }
        });

        return NextResponse.json(characters);
    } catch (error) {
        console.error("Failed to fetch characters:", error);
        return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
    }
}