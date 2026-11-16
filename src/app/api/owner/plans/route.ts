import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await prisma.membershipPlan.findMany({
      include: {
        _count: {
          select: { memberships: true },
        },
      },
    });

    const formattedPlans = plans.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      durationMonths: p.durationMonths,
      price: p.price,
      taxPercent: p.taxPercent,
      badge: p.badge,
      isActive: p.isActive,
      subscriberCount: p._count.memberships,
      features: JSON.parse(p.featuresJson || "[]"),
    }));

    const coupons = [
      { code: "SUMMER20", discountPct: 20, description: "Summer Shred 20% off any plan", validUntil: "2026-12-31", uses: 34 },
      { code: "IRON50", discountPct: 50, description: "Annual VIP promotional 50% discount", validUntil: "2026-11-30", uses: 12 },
      { code: "WELCOME10", discountPct: 10, description: "First-time joiner discount", validUntil: "2027-01-01", uses: 89 },
    ];

    const addOns = [
      { id: "ADD-PT", name: "1-on-1 Personal Training (5 Sessions)", price: 150, category: "TRAINING" },
      { id: "ADD-SAUNA", name: "Unlimited Infrared Sauna & Cold Plunge", price: 35, category: "RECOVERY" },
      { id: "ADD-LOCKER", name: "Dedicated VIP Smart Locker with Charger", price: 20, category: "FACILITY" },
      { id: "ADD-SHAKE", name: "Unlimited Daily Post-Workout Protein Shakes", price: 45, category: "NUTRITION" },
    ];

    return NextResponse.json({
      plans: formattedPlans,
      coupons,
      addOns,
      referralConfig: {
        rewardAmount: 25.0,
        bonusDays: 14,
        description: "Give $25 off to a friend, get $25 gym credit + 14 free days on renewal",
      },
    });
  } catch (error: any) {
    console.error("Fetch plans error:", error);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, durationMonths, price, taxPercent, features, badge } = body;

    const newPlan = await prisma.membershipPlan.create({
      data: {
        name,
        description: description || "",
        durationMonths: parseInt(durationMonths) || 1,
        price: parseFloat(price) || 49,
        taxPercent: parseFloat(taxPercent) || 18,
        badge: badge || null,
        featuresJson: JSON.stringify(features || []),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error: any) {
    console.error("Create plan error:", error);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}
