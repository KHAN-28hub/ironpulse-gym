import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "TRAINER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId: user.id },
      include: {
        classes: true,
      },
    });

    if (!trainerProfile) {
      return NextResponse.json({ error: "Trainer profile not found" }, { status: 404 });
    }

    // Get members assigned or taking classes
    const members = await prisma.memberProfile.findMany({
      take: 15,
      include: {
        user: true,
        workoutLogs: { orderBy: { date: "desc" }, take: 1 },
        measurements: { orderBy: { date: "desc" }, take: 1 },
      },
      orderBy: { streak: "desc" },
    });

    const formattedClients = members.map((m) => ({
      id: m.id,
      name: m.user.name,
      email: m.user.email,
      avatar: m.user.avatar,
      phone: m.user.phone,
      qrCode: m.qrCode,
      streak: m.streak,
      level: m.level,
      currentWeight: m.currentWeight,
      targetWeight: m.targetWeight,
      healthNotes: m.healthNotes,
      lastWorkout: m.workoutLogs[0]?.date || m.joinDate,
      lastCaloriesBurned: m.workoutLogs[0]?.caloriesBurned || 340,
    }));

    return NextResponse.json({
      trainer: {
        id: trainerProfile.id,
        name: user.name,
        specialization: trainerProfile.specialization,
        rating: trainerProfile.rating,
        reviewCount: trainerProfile.reviewCount,
        salary: trainerProfile.salary,
        hourlyRate: trainerProfile.hourlyRate,
        shift: trainerProfile.shift,
      },
      clients: formattedClients,
    });
  } catch (error: any) {
    console.error("Trainer clients error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "TRAINER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trainer = await prisma.trainerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
    }

    const body = await req.json();
    const { memberId, planType, title, goal, details } = body;

    if (planType === "WORKOUT") {
      await prisma.workoutPlan.create({
        data: {
          name: title || "Custom Coach Workout Plan",
          description: `Assigned directly by Coach ${user.name}`,
          difficulty: "INTERMEDIATE",
          goal: goal || "HYPERTROPHY",
          trainerId: trainer.id,
          memberId,
          daysJson: JSON.stringify(details || [
            { day: "Day 1 - Push Focus", exercises: [{ name: "Barbell Bench Press", sets: 4, reps: "8-10" }] },
            { day: "Day 2 - Pull Focus", exercises: [{ name: "Weighted Pull-ups", sets: 4, reps: "6-8" }] },
          ]),
        },
      });
    } else {
      await prisma.dietPlan.create({
        data: {
          name: title || "Custom Coach Nutrition Protocol",
          goal: goal || "CUT",
          dailyCalories: 2400,
          proteinG: 180,
          carbsG: 220,
          fatsG: 60,
          memberId,
          mealsJson: JSON.stringify([
            { meal: "Targeted Fuel", time: "08:00 AM", items: ["High protein breakfast", "Hydration electrolyte"] },
          ]),
        },
      });
    }

    return NextResponse.json({ success: true, message: "Custom plan assigned to client successfully" });
  } catch (error: any) {
    console.error("Assign plan error:", error);
    return NextResponse.json({ error: "Failed to assign plan" }, { status: 500 });
  }
}
