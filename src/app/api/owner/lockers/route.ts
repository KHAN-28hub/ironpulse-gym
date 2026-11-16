import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lockers = await prisma.locker.findMany({
      include: {
        assignedMember: {
          include: { user: true },
        },
      },
      orderBy: { number: "asc" },
    });

    const formatted = lockers.map((l) => ({
      id: l.id,
      number: l.number,
      status: l.status, // "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"
      assignedMemberName: l.assignedMember?.user.name || null,
      assignedMemberQr: l.assignedMember?.qrCode || null,
      expiresAt: l.expiresAt,
    }));

    return NextResponse.json({ lockers: formatted });
  } catch (error: any) {
    console.error("Lockers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch lockers" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lockerId, action, memberId, status } = body;

    if (action === "ASSIGN") {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await prisma.locker.update({
        where: { id: lockerId },
        data: {
          status: "OCCUPIED",
          assignedMemberId: memberId,
          expiresAt,
        },
      });
      return NextResponse.json({ success: true, message: "Locker assigned" });
    }

    if (action === "RELEASE") {
      await prisma.locker.update({
        where: { id: lockerId },
        data: {
          status: "AVAILABLE",
          assignedMemberId: null,
          expiresAt: null,
        },
      });
      return NextResponse.json({ success: true, message: "Locker released" });
    }

    if (action === "MAINTENANCE") {
      await prisma.locker.update({
        where: { id: lockerId },
        data: { status: status || "MAINTENANCE" },
      });
      return NextResponse.json({ success: true, message: "Locker status updated" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Update locker error:", error);
    return NextResponse.json({ error: "Failed to update locker" }, { status: 500 });
  }
}
