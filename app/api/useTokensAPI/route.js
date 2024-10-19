import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const { userId, messageType } = await req.json();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { textTokens: true, imageTokens: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let updatedUser;

    if (messageType === "message") {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { textTokens: user.textTokens - 1 },
      });
    } else if (messageType === "image") {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { imageTokens: user.imageTokens - 1 },
      });
    } else {
      return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
    }

    return NextResponse.json({
      textTokens: updatedUser.textTokens,
      imageTokens: updatedUser.imageTokens
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating tokens:', error);
    return NextResponse.json({ error: 'Failed to update tokens' }, { status: 500 });
  }
}