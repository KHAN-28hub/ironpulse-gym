import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const challenges = await prisma.challenge.findMany({
      orderBy: { endDate: "asc" },
    });

    const topMembers = await prisma.memberProfile.findMany({
      include: { user: true },
      orderBy: { xp: "desc" },
      take: 10,
    });

    const leaderboard = topMembers.map((m, index) => ({
      rank: index + 1,
      id: m.id,
      name: m.user.name,
      avatar: m.user.avatar,
      xp: m.xp,
      level: m.level,
      streak: m.streak,
      isMe: m.userId === user.id,
    }));

    const badges = [
      { id: "B1", title: "Iron Streak (14 Days)", description: "Completed 14 consecutive training days", unlocked: true, icon: "Flame" },
      { id: "B2", title: "Century Club (100kg+ Bench)", description: "Logged a 100kg+ bench press", unlocked: true, icon: "Award" },
      { id: "B3", title: "Class Master", description: "Attended 10 group fitness classes", unlocked: true, icon: "Users" },
      { id: "B4", title: "Beast Mode", description: "Completed 50 total logged workouts", unlocked: false, icon: "Zap" },
    ];

    return NextResponse.json({
      challenges,
      leaderboard,
      badges,
    });
  } catch (error: any) {
    console.error("Challenges fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }
}
