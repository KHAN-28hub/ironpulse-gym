import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "ironpulse_super_secret_jwt_key_2026";

export interface TokenPayload {
  userId: string;
  email: string;
  role: "OWNER" | "TRAINER" | "MEMBER" | "STAFF";
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ironpulse_token")?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        memberProfile: true,
        trainerProfile: true,
        branch: true,
      },
    });

    if (!user || !user.isActive) return null;

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      branch: user.branch,
      memberProfile: user.memberProfile,
      trainerProfile: user.trainerProfile,
    };
  } catch (e) {
    return null;
  }
}
