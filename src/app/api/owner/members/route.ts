import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";

    const members = await prisma.memberProfile.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { user: { name: { contains: search, mode: "insensitive" } } },
                  { user: { email: { contains: search, mode: "insensitive" } } },
                  { qrCode: { contains: search, mode: "insensitive" } },
                  { user: { phone: { contains: search, mode: "insensitive" } } },
                ],
              }
            : {},
          status !== "ALL"
            ? {
                memberships: {
                  some: { status },
                },
              }
            : {},
        ],
      },
      include: {
        user: {
          include: { branch: true },
        },
        memberships: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { joinDate: "desc" },
    });

    const formatted = members.map((m) => {
      const currentMembership = m.memberships[0];
      return {
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        phone: m.user.phone,
        avatar: m.user.avatar,
        branch: m.user.branch?.name || "Downtown Flagship",
        qrCode: m.qrCode,
        streak: m.streak,
        xp: m.xp,
        level: m.level,
        weight: m.currentWeight,
        targetWeight: m.targetWeight,
        heightCm: m.heightCm,
        emergencyContact: m.emergencyContact,
        healthNotes: m.healthNotes,
        idProofType: m.idProofType,
        idProofNumber: m.idProofNumber,
        bloodGroup: m.bloodGroup,
        gender: m.gender,
        joinDate: m.joinDate,
        membership: currentMembership
          ? {
              id: currentMembership.id,
              planName: currentMembership.plan.name,
              price: currentMembership.plan.price,
              status: currentMembership.status,
              startDate: currentMembership.startDate,
              endDate: currentMembership.endDate,
              autoRenew: currentMembership.autoRenew,
              freezeReason: currentMembership.freezeReason,
            }
          : null,
      };
    });

    return NextResponse.json({ members: formatted });
  } catch (error: any) {
    console.error("Fetch members error:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      planId,
      branchId,
      bloodGroup,
      emergencyContact,
      healthNotes,
      idProofType,
      idProofNumber,
      gender,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.trim().toLowerCase() }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "User already exists with this email or phone" }, { status: 400 });
    }

    const defaultPasswordHash = await bcrypt.hash("ironpulse123", 10);
    const branch = branchId
      ? await prisma.branch.findUnique({ where: { id: branchId } })
      : await prisma.branch.findFirst();

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone || null,
        passwordHash: defaultPasswordHash,
        role: "MEMBER",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        branchId: branch?.id,
      },
    });

    const qrCode = `IP-MBR-${Math.floor(1000 + Math.random() * 9000)}-${name.slice(0, 3).toUpperCase()}`;

    const memberProfile = await prisma.memberProfile.create({
      data: {
        userId: newUser.id,
        emergencyContact: emergencyContact || null,
        healthNotes: healthNotes || "None reported",
        idProofType: idProofType || "DRIVERS_LICENSE",
        idProofNumber: idProofNumber || `ID-${Math.floor(100000 + Math.random() * 900000)}`,
        bloodGroup: bloodGroup || "O+",
        gender: gender || "OTHER",
        qrCode,
        streak: 0,
        xp: 100,
        level: 1,
        currentWeight: 75.0,
        targetWeight: 72.0,
      },
    });

    // Assign plan
    let plan = planId ? await prisma.membershipPlan.findUnique({ where: { id: planId } }) : null;
    if (!plan) plan = await prisma.membershipPlan.findFirst();

    if (plan) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.durationMonths);

      await prisma.membership.create({
        data: {
          memberId: memberProfile.id,
          planId: plan.id,
          startDate: new Date(),
          endDate,
          status: "ACTIVE",
          autoRenew: true,
        },
      });

      // Create initial payment
      await prisma.payment.create({
        data: {
          invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          memberId: memberProfile.id,
          amount: plan.price,
          tax: Number((plan.price * 0.18).toFixed(2)),
          discount: 0,
          method: "STRIPE",
          status: "PAID",
          notes: `New registration: ${plan.name}`,
        },
      });
    }

    return NextResponse.json({ success: true, memberId: memberProfile.id });
  } catch (error: any) {
    console.error("Create member error:", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      memberId,
      action, // "UPDATE_DETAILS" | "FREEZE" | "RESUME" | "TRANSFER"
      name,
      phone,
      healthNotes,
      emergencyContact,
      freezeReason,
      newBranchId,
    } = body;

    const member = await prisma.memberProfile.findUnique({
      where: { id: memberId },
      include: { user: true, memberships: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (action === "FREEZE") {
      const currentMembership = member.memberships[0];
      if (currentMembership) {
        await prisma.membership.update({
          where: { id: currentMembership.id },
          data: {
            status: "FROZEN",
            frozenAt: new Date(),
            freezeReason: freezeReason || "Member requested freeze / travel",
          },
        });
      }
    } else if (action === "RESUME") {
      const currentMembership = member.memberships[0];
      if (currentMembership) {
        await prisma.membership.update({
          where: { id: currentMembership.id },
          data: {
            status: "ACTIVE",
            frozenAt: null,
            freezeReason: null,
          },
        });
      }
    } else if (action === "TRANSFER") {
      if (newBranchId) {
        await prisma.user.update({
          where: { id: member.userId },
          data: { branchId: newBranchId },
        });
      }
    } else {
      // General Update
      if (name) {
        await prisma.user.update({
          where: { id: member.userId },
          data: { name: name.trim(), ...(phone ? { phone: phone.trim() } : {}) },
        });
      }
      await prisma.memberProfile.update({
        where: { id: memberId },
        data: {
          ...(healthNotes ? { healthNotes } : {}),
          ...(emergencyContact ? { emergencyContact } : {}),
        },
      });
    }

    return NextResponse.json({ success: true, message: "Member updated successfully" });
  } catch (error: any) {
    console.error("Update member error:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json({ error: "Member ID required" }, { status: 400 });
    }

    const member = await prisma.memberProfile.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Cascades delete to profile, memberships, payments, attendances
    await prisma.user.delete({
      where: { id: member.userId },
    });

    return NextResponse.json({ success: true, message: "Member deleted successfully" });
  } catch (error: any) {
    console.error("Delete member error:", error);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
