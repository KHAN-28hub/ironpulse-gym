import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.memberProfile.findUnique({
      where: { userId: user.id },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const classes = await prisma.gymClass.findMany({
      where: { isActive: true },
      include: {
        trainer: { include: { user: true } },
        bookings: true,
      },
      orderBy: { scheduleTime: "asc" },
    });

    const formatted = classes.map((c) => {
      const isBooked = c.bookings.some((b) => b.memberId === member.id && b.status === "CONFIRMED");
      const isWaitlisted = c.bookings.some((b) => b.memberId === member.id && b.status === "WAITLIST");
      const confirmedCount = c.bookings.filter((b) => b.status === "CONFIRMED").length;

      return {
        id: c.id,
        name: c.name,
        description: c.description,
        category: c.category,
        trainerName: c.trainer.user.name,
        trainerAvatar: c.trainer.user.avatar,
        scheduleTime: c.scheduleTime,
        durationMinutes: c.durationMinutes,
        capacity: c.capacity,
        location: c.location,
        confirmedCount,
        availableSpots: Math.max(0, c.capacity - confirmedCount),
        isBooked,
        isWaitlisted,
      };
    });

    return NextResponse.json({ classes: formatted });
  } catch (error: any) {
    console.error("Classes member fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.memberProfile.findUnique({
      where: { userId: user.id },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const body = await req.json();
    const { classId, action } = body;

    const gymClass = await prisma.gymClass.findUnique({
      where: { id: classId },
      include: { bookings: true },
    });

    if (!gymClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    if (action === "CANCEL") {
      await prisma.classBooking.deleteMany({
        where: {
          classId,
          memberId: member.id,
        },
      });
      return NextResponse.json({ success: true, message: "Booking cancelled" });
    }

    // Check if already booked
    const existing = await prisma.classBooking.findFirst({
      where: { classId, memberId: member.id },
    });

    if (existing) {
      return NextResponse.json({ error: "You are already booked for this class" }, { status: 400 });
    }

    const confirmedCount = gymClass.bookings.filter((b) => b.status === "CONFIRMED").length;
    const isFull = confirmedCount >= gymClass.capacity;
    const bookingStatus = isFull ? "WAITLIST" : "CONFIRMED";

    const booking = await prisma.classBooking.create({
      data: {
        classId,
        memberId: member.id,
        status: bookingStatus,
      },
    });

    return NextResponse.json({
      success: true,
      bookingStatus,
      message: isFull
        ? "Class is full. You have been added to the Priority Waitlist!"
        : "Spot confirmed! Calendar invite generated.",
    });
  } catch (error: any) {
    console.error("Class booking error:", error);
    return NextResponse.json({ error: "Failed to process class booking" }, { status: 500 });
  }
}
