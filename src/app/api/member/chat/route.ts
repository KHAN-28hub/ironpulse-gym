import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let coachUser = await prisma.user.findFirst({
      where: { role: "TRAINER" },
    });

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: coachUser?.id },
          { senderId: coachUser?.id, receiverId: user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return NextResponse.json({
      coach: coachUser ? { id: coachUser.id, name: coachUser.name, avatar: coachUser.avatar } : null,
      messages: messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        isMe: m.senderId === user.id,
        message: m.message,
        createdAt: m.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Chat fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message, receiverId } = body;

    let coachUser = receiverId
      ? await prisma.user.findUnique({ where: { id: receiverId } })
      : await prisma.user.findFirst({ where: { role: "TRAINER" } });

    if (!coachUser) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const newMsg = await prisma.chatMessage.create({
      data: {
        senderId: user.id,
        receiverId: coachUser.id,
        message: message.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: newMsg.id,
        senderId: user.id,
        isMe: true,
        message: newMsg.message,
        createdAt: newMsg.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
