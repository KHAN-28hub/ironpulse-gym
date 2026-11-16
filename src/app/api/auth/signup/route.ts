import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password, gymCode } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim().toLowerCase() },
          ...(phone ? [{ phone: phone.trim() }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email or phone already exists. Please sign in." },
        { status: 400 }
      );
    }

    // Default branch
    const branch = await prisma.branch.findFirst();
    const defaultPlan = await prisma.membershipPlan.findFirst({
      where: { name: { contains: "Flex", mode: "insensitive" } },
    });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: "MEMBER",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        branchId: branch?.id,
      },
    });

    // Create member profile
    const memberProfile = await prisma.memberProfile.create({
      data: {
        userId: user.id,
        qrCode: `IP-MBR-${Math.floor(1000 + Math.random() * 9000)}-${name.slice(0, 3).toUpperCase()}`,
        streak: 1,
        xp: 150,
        level: 1,
        currentWeight: 75,
        targetWeight: 72,
        heightCm: 175,
      },
    });

    // Create default starter membership if plan exists
    if (defaultPlan) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + defaultPlan.durationMonths);

      await prisma.membership.create({
        data: {
          memberId: memberProfile.id,
          planId: defaultPlan.id,
          startDate: new Date(),
          endDate,
          status: "ACTIVE",
          autoRenew: true,
        },
      });
    }

    // Sign JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: "MEMBER",
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      redirectUrl: "/member/dashboard",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("ironpulse_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
