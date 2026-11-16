import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password, role } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Identifier (email or phone) and password are required" },
        { status: 400 }
      );
    }

    // Lookup user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.trim().toLowerCase() },
          { phone: identifier.trim() },
        ],
      },
      include: {
        memberProfile: true,
        trainerProfile: true,
        branch: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your email or phone." },
        { status: 401 }
      );
    }

    // Verify role if specified
    if (role && user.role !== role) {
      return NextResponse.json(
        { error: `This account is registered as ${user.role}, not ${role}. Please switch role.` },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid password. Default demo password is: ironpulse123" },
        { status: 401 }
      );
    }

    // Sign JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    // Determine redirect destination
    let redirectUrl = "/member/dashboard";
    if (user.role === "OWNER") {
      redirectUrl = "/owner/dashboard";
    } else if (user.role === "TRAINER") {
      redirectUrl = "/trainer/dashboard";
    }

    const response = NextResponse.json({
      success: true,
      redirectUrl,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        branch: user.branch?.name,
      },
    });

    // Set HTTP-Only Cookie
    response.cookies.set("ironpulse_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
