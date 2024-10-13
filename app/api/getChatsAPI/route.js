import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCharacters = await prisma.userCharacter.findMany({
      where: { userId: session.user.id },
      include: {
        character: {
          include: { personaData: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (userCharacters.length === 0) {
      return NextResponse.json({ message: "No characters found" }, { status: 200 });
    }

    return NextResponse.json(userCharacters);
  } catch (error) {
    console.error("Failed to fetch characters:", error);
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
  }
}