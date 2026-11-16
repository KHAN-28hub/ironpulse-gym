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
      include: {
        workoutPlans: {
          include: { trainer: { include: { user: true } } },
        },
        workoutLogs: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member profile not found" }, { status: 404 });
    }

    const exercises = await prisma.exercise.findMany({
      orderBy: { category: "asc" },
    });

    const formattedPlans = member.workoutPlans.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      difficulty: p.difficulty,
      goal: p.goal,
      trainerName: p.trainer?.user.name || "IronPulse AI",
      days: JSON.parse(p.daysJson || "[]"),
    }));

    const formattedLogs = member.workoutLogs.map((l) => ({
      id: l.id,
      date: l.date,
      durationMinutes: l.durationMinutes,
      caloriesBurned: l.caloriesBurned,
      notes: l.notes,
      exercises: JSON.parse(l.exercisesJson || "[]"),
    }));

    const personalRecords = [
      { exercise: "Barbell Bench Press", weightKg: 95, reps: 8, date: "2026-11-14" },
      { exercise: "Barbell Back Squat", weightKg: 140, reps: 6, date: "2026-11-10" },
      { exercise: "Conventional Deadlift", weightKg: 180, reps: 5, date: "2026-11-04" },
      { exercise: "Weighted Pull-ups", weightKg: 20, reps: 8, date: "2026-11-08" },
    ];

    return NextResponse.json({
      activePlan: formattedPlans[0] || null,
      exerciseLibrary: exercises,
      workoutHistory: formattedLogs,
      personalRecords,
    });
  } catch (error: any) {
    console.error("Member workouts error:", error);
    return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 });
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
      return NextResponse.json({ error: "Member profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { durationMinutes, caloriesBurned, notes, exercises } = body;

    const log = await prisma.workoutLog.create({
      data: {
        memberId: member.id,
        date: new Date(),
        durationMinutes: parseInt(durationMinutes) || 45,
        caloriesBurned: parseInt(caloriesBurned) || 350,
        notes: notes || "Session completed with intensity.",
        exercisesJson: JSON.stringify(exercises || []),
      },
    });

    // Reward XP
    await prisma.memberProfile.update({
      where: { id: member.id },
      data: {
        xp: member.xp + 150,
      },
    });

    return NextResponse.json({ success: true, log, xpGained: 150 });
  } catch (error: any) {
    console.error("Log workout error:", error);
    return NextResponse.json({ error: "Failed to log workout" }, { status: 500 });
  }
}
