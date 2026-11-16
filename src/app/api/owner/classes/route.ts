import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classes = await prisma.gymClass.findMany({
      include: {
        trainer: {
          include: { user: true },
        },
        branch: true,
        bookings: {
          include: {
            member: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: { scheduleTime: "asc" },
    });

    const formatted = classes.map((c) => {
      const confirmedBookings = c.bookings.filter((b) => b.status === "CONFIRMED");
      const waitlistedBookings = c.bookings.filter((b) => b.status === "WAITLIST");
      return {
        id: c.id,
        name: c.name,
        description: c.description,
        category: c.category,
        trainerName: c.trainer.user.name,
        trainerAvatar: c.trainer.user.avatar,
        branchName: c.branch.name,
        scheduleTime: c.scheduleTime,
        durationMinutes: c.durationMinutes,
        capacity: c.capacity,
        location: c.location,
        isActive: c.isActive,
        confirmedCount: confirmedBookings.length,
        waitlistCount: waitlistedBookings.length,
        availableSpots: Math.max(0, c.capacity - confirmedBookings.length),
        attendees: confirmedBookings.map((b) => ({
          name: b.member.user.name,
          email: b.member.user.email,
          avatar: b.member.user.avatar,
        })),
      };
    });

    return NextResponse.json({ classes: formatted });
  } catch (error: any) {
    console.error("Classes fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, category, trainerId, durationMinutes, capacity, location, scheduleTime } = body;

    const branch = await prisma.branch.findFirst();
    let trainer = trainerId
      ? await prisma.trainerProfile.findUnique({ where: { id: trainerId } })
      : await prisma.trainerProfile.findFirst();

    if (!trainer) {
      return NextResponse.json({ error: "No trainer available" }, { status: 400 });
    }

    const newClass = await prisma.gymClass.create({
      data: {
        name,
        description: description || "Intense group fitness session",
        category: category || "HIIT",
        trainerId: trainer.id,
        branchId: branch?.id || "default",
        scheduleTime: scheduleTime ? new Date(scheduleTime) : new Date(),
        durationMinutes: parseInt(durationMinutes) || 60,
        capacity: parseInt(capacity) || 20,
        location: location || "Studio Alpha",
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, gymClass: newClass });
  } catch (error: any) {
    console.error("Create class error:", error);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
