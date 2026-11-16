import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const attendances = await prisma.attendance.findMany({
      include: {
        user: {
          include: {
            memberProfile: true,
          },
        },
        branch: true,
      },
      orderBy: { checkInTime: "desc" },
      take: limit,
    });

    const formatted = attendances.map((a) => ({
      id: a.id,
      name: a.user.name,
      email: a.user.email,
      avatar: a.user.avatar,
      qrCode: a.user.memberProfile?.qrCode || "N/A",
      branchName: a.branch.name,
      checkInTime: a.checkInTime,
      checkOutTime: a.checkOutTime,
      method: a.method, // "QR" | "MANUAL" | "BIOMETRIC"
      status: a.status, // "IN" | "OUT"
    }));

    return NextResponse.json({ attendances: formatted });
  } catch (error: any) {
    console.error("Attendance fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { qrCode, userId, method = "QR", action = "TOGGLE" } = body;

    // Find member by QR Code or userId
    let targetUser = null;
    if (qrCode) {
      const profile = await prisma.memberProfile.findUnique({
        where: { qrCode: qrCode.trim() },
        include: {
          user: { include: { branch: true } },
          memberships: { orderBy: { createdAt: "desc" }, take: 1, include: { plan: true } },
        },
      });
      if (profile) targetUser = profile;
    } else if (userId) {
      const profile = await prisma.memberProfile.findUnique({
        where: { userId },
        include: {
          user: { include: { branch: true } },
          memberships: { orderBy: { createdAt: "desc" }, take: 1, include: { plan: true } },
        },
      });
      if (profile) targetUser = profile;
    }

    if (!targetUser) {
      return NextResponse.json({ error: "Invalid QR code or Member ID not found" }, { status: 404 });
    }

    const currentMembership = targetUser.memberships[0];
    const membershipStatus = currentMembership?.status || "NO_PLAN";

    if (membershipStatus === "EXPIRED") {
      return NextResponse.json({
        accessGranted: false,
        member: {
          name: targetUser.user.name,
          avatar: targetUser.user.avatar,
          status: "EXPIRED",
          plan: currentMembership?.plan.name,
        },
        message: "Access Denied: Membership expired. Please renew at the desk.",
      }, { status: 403 });
    }

    if (membershipStatus === "FROZEN") {
      return NextResponse.json({
        accessGranted: false,
        member: {
          name: targetUser.user.name,
          avatar: targetUser.user.avatar,
          status: "FROZEN",
          plan: currentMembership?.plan.name,
        },
        message: "Access Denied: Membership currently frozen.",
      }, { status: 403 });
    }

    // Check if user is currently checked IN
    const activeCheckIn = await prisma.attendance.findFirst({
      where: {
        userId: targetUser.userId,
        status: "IN",
      },
    });

    const branch = targetUser.user.branch || (await prisma.branch.findFirst());

    if (activeCheckIn && (action === "TOGGLE" || action === "CHECK_OUT")) {
      // Check Out
      const updated = await prisma.attendance.update({
        where: { id: activeCheckIn.id },
        data: {
          status: "OUT",
          checkOutTime: new Date(),
        },
      });
      return NextResponse.json({
        accessGranted: true,
        action: "CHECK_OUT",
        member: {
          name: targetUser.user.name,
          avatar: targetUser.user.avatar,
          streak: targetUser.streak,
          plan: currentMembership?.plan.name,
        },
        message: `Goodbye ${targetUser.user.name}! Checked out successfully.`,
      });
    } else {
      // Check In
      const checkIn = await prisma.attendance.create({
        data: {
          userId: targetUser.userId,
          branchId: branch?.id || "default",
          checkInTime: new Date(),
          method: method || "QR",
          status: "IN",
        },
      });

      // Increment member streak
      await prisma.memberProfile.update({
        where: { id: targetUser.id },
        data: {
          streak: targetUser.streak + 1,
          xp: targetUser.xp + 50,
        },
      });

      return NextResponse.json({
        accessGranted: true,
        action: "CHECK_IN",
        member: {
          name: targetUser.user.name,
          avatar: targetUser.user.avatar,
          streak: targetUser.streak + 1,
          plan: currentMembership?.plan.name,
        },
        message: `Welcome ${targetUser.user.name}! Check-in granted via ${method}. (+50 XP)`,
      });
    }
  } catch (error: any) {
    console.error("Attendance record error:", error);
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}
