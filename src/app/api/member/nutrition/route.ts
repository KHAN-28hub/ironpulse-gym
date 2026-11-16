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
        dietPlans: true,
        nutritionLogs: {
          orderBy: { date: "desc" },
          take: 7,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member profile not found" }, { status: 404 });
    }

    const activeDietPlan = member.dietPlans[0]
      ? {
          id: member.dietPlans[0].id,
          name: member.dietPlans[0].name,
          goal: member.dietPlans[0].goal,
          dailyCalories: member.dietPlans[0].dailyCalories,
          proteinG: member.dietPlans[0].proteinG,
          carbsG: member.dietPlans[0].carbsG,
          fatsG: member.dietPlans[0].fatsG,
          meals: JSON.parse(member.dietPlans[0].mealsJson || "[]"),
        }
      : null;

    const todayLog = member.nutritionLogs[0] || {
      totalCalories: 2150,
      proteinG: 162,
      carbsG: 230,
      fatsG: 58,
      waterMl: 2800,
      itemsJson: "[]",
    };

    const foodDatabase = [
      { name: "Grilled Chicken Breast (150g)", calories: 247, protein: 46, carbs: 0, fats: 5 },
      { name: "Cooked Jasmine Rice (200g)", calories: 260, protein: 5, carbs: 56, fats: 1 },
      { name: "Whey Protein Isolate (1 scoop / 30g)", calories: 120, protein: 26, carbs: 2, fats: 1 },
      { name: "Whole Eggs (3 large)", calories: 215, protein: 18, carbs: 1, fats: 15 },
      { name: "Rolled Oats (100g dry)", calories: 389, protein: 17, carbs: 66, fats: 7 },
      { name: "Greek Yogurt 0% Fat (200g)", calories: 120, protein: 20, carbs: 8, fats: 0 },
      { name: "Salmon Fillet (180g)", calories: 370, protein: 36, carbs: 0, fats: 24 },
      { name: "Avocado (Half / 100g)", calories: 160, protein: 2, carbs: 9, fats: 15 },
      { name: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fats: 0.3 },
      { name: "Almond Butter (30g)", calories: 190, protein: 7, carbs: 6, fats: 16 },
    ];

    const aiMealSuggestions = [
      { title: "Post-Workout Muscle Recovery", suggestion: "40g Whey Isolate + 1 ripe Banana + 5g Creatine in almond milk (320 kcal, 40g P, 32g C, 2g F)" },
      { title: "High-Protein Low-Carb Dinner", suggestion: "200g Grilled Atlantic Salmon with steamed asparagus and olive oil drizzle (480 kcal, 44g P, 6g C, 30g F)" },
      { title: "Bedtime Casein & Recovery Bowl", suggestion: "200g Greek Yogurt with a handful of crushed walnuts and cinnamon (230 kcal, 22g P, 10g C, 11g F)" },
    ];

    return NextResponse.json({
      activePlan: activeDietPlan,
      todayLog: {
        calories: todayLog.totalCalories,
        protein: todayLog.proteinG,
        carbs: todayLog.carbsG,
        fats: todayLog.fatsG,
        waterMl: todayLog.waterMl,
        loggedItems: JSON.parse(todayLog.itemsJson || "[]"),
      },
      targets: {
        calories: activeDietPlan?.dailyCalories || 2650,
        protein: activeDietPlan?.proteinG || 185,
        carbs: activeDietPlan?.carbsG || 290,
        fats: activeDietPlan?.fatsG || 70,
        waterMl: 3500,
      },
      foodDatabase,
      aiMealSuggestions,
    });
  } catch (error: any) {
    console.error("Nutrition fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch nutrition data" }, { status: 500 });
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
      include: { nutritionLogs: { orderBy: { date: "desc" }, take: 1 } },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const body = await req.json();
    const { action, waterDelta, foodItem } = body;

    let log = member.nutritionLogs[0];
    if (!log) {
      log = await prisma.nutritionLog.create({
        data: {
          memberId: member.id,
          date: new Date(),
          totalCalories: 0,
          proteinG: 0,
          carbsG: 0,
          fatsG: 0,
          waterMl: 0,
          itemsJson: "[]",
        },
      });
    }

    if (action === "ADD_WATER") {
      const updated = await prisma.nutritionLog.update({
        where: { id: log.id },
        data: { waterMl: log.waterMl + (parseInt(waterDelta) || 250) },
      });
      return NextResponse.json({ success: true, waterMl: updated.waterMl });
    }

    if (action === "LOG_FOOD" && foodItem) {
      const currentItems = JSON.parse(log.itemsJson || "[]");
      currentItems.push({
        name: foodItem.name,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fats: foodItem.fats,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });

      const updated = await prisma.nutritionLog.update({
        where: { id: log.id },
        data: {
          totalCalories: log.totalCalories + foodItem.calories,
          proteinG: log.proteinG + foodItem.protein,
          carbsG: log.carbsG + foodItem.carbs,
          fatsG: log.fatsG + foodItem.fats,
          itemsJson: JSON.stringify(currentItems),
        },
      });

      return NextResponse.json({ success: true, todayLog: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Nutrition post error:", error);
    return NextResponse.json({ error: "Failed to update nutrition" }, { status: 500 });
  }
}
