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
        user: { include: { branch: true } },
        memberships: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        workoutLogs: {
          orderBy: { date: "desc" },
          take: 3,
        },
        nutritionLogs: {
          orderBy: { date: "desc" },
          take: 1,
        },
        bookings: {
          include: {
            gymClass: {
              include: {
                trainer: { include: { user: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 2,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member profile not found" }, { status: 404 });
    }

    const currentMembership = member.memberships[0];
    let daysLeft = 0;
    if (currentMembership && currentMembership.endDate) {
      const diff = new Date(currentMembership.endDate).getTime() - new Date().getTime();
      daysLeft = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
    }

    // Daily nutrition numbers (or fallback)
    const todayLog = member.nutritionLogs[0] || {
      totalCalories: 2150,
      proteinG: 162,
      carbsG: 230,
      fatsG: 58,
      waterMl: 2800,
    };

    const motivationalQuotes = [
      { quote: "The body achieves what the mind believes.", author: "Napoleon Hill" },
      { quote: "No citizen has a right to be an amateur in the matter of physical training.", author: "Socrates" },
      { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
      { quote: "Iron never lies to you. 200 pounds will always be 200 pounds.", author: "Henry Rollins" },
    ];
    const dailyQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    return NextResponse.json({
      member: {
        id: member.id,
        name: member.user.name,
        email: member.user.email,
        avatar: member.user.avatar,
        branchName: member.user.branch?.name || "Downtown Flagship",
        qrCode: member.qrCode,
        streak: member.streak,
        xp: member.xp,
        level: member.level,
        currentWeight: member.currentWeight,
        targetWeight: member.targetWeight,
        heightCm: member.heightCm,
      },
      membership: currentMembership
        ? {
            planName: currentMembership.plan.name,
            price: currentMembership.plan.price,
            status: currentMembership.status,
            daysLeft,
            endDate: currentMembership.endDate,
            autoRenew: currentMembership.autoRenew,
          }
        : null,
      todayNutrition: {
        calories: todayLog.totalCalories,
        calorieTarget: 2650,
        protein: todayLog.proteinG,
        proteinTarget: 185,
        carbs: todayLog.carbsG,
        carbsTarget: 290,
        fats: todayLog.fatsG,
        fatsTarget: 70,
        waterMl: todayLog.waterMl,
        waterTargetMl: 3500,
      },
      upcomingClass: member.bookings[0]
        ? {
            name: member.bookings[0].gymClass.name,
            category: member.bookings[0].gymClass.category,
            trainerName: member.bookings[0].gymClass.trainer.user.name,
            scheduleTime: member.bookings[0].gymClass.scheduleTime,
            location: member.bookings[0].gymClass.location,
            status: member.bookings[0].status,
          }
        : null,
      quote: dailyQuote,
    });
  } catch (error: any) {
    console.error("Member dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
