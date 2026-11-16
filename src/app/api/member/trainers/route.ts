import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trainers = await prisma.trainerProfile.findMany({
      include: { user: true },
      orderBy: { rating: "desc" },
    });

    const formatted = trainers.map((t) => ({
      id: t.id,
      userId: t.userId,
      name: t.user.name,
      avatar: t.user.avatar,
      specialization: t.specialization,
      bio: t.bio,
      rating: t.rating,
      reviewCount: t.reviewCount,
      hourlyRate: t.hourlyRate,
      shift: t.shift,
    }));

    return NextResponse.json({ trainers: formatted });
  } catch (error: any) {
    console.error("Member trainers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch trainers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { trainerId, sessionDate, sessionTime, focusArea } = body;

    // Simulate booking confirmation and send automatic confirmation message
    const trainer = await prisma.trainerProfile.findUnique({
      where: { id: trainerId },
      include: { user: true },
    });

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
    }

    // Auto-create confirmation message in chat
    await prisma.chatMessage.create({
      data: {
        senderId: trainer.userId,
        receiverId: user.id,
        message: `Hi ${user.name}! I received your PT booking request for ${sessionDate || "tomorrow"} at ${sessionTime || "10:00 AM"} focusing on ${focusArea || "Form & Strength"}. Looking forward to training you! Bring your lifting shoes.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Personal Training session booked with Coach ${trainer.user.name}! Check your messages.`,
    });
  } catch (error: any) {
    console.error("Book trainer error:", error);
    return NextResponse.json({ error: "Failed to book trainer" }, { status: 500 });
  }
}
