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
    const { chatIds } = await req.json();

    // Delete the selected chats
    await prisma.userCharacter.deleteMany({
      where: {
        id: { in: chatIds },
        userId: session.user.id
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}