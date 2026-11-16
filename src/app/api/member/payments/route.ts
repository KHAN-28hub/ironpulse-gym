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
        payments: {
          orderBy: { createdAt: "desc" },
        },
        memberships: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const plans = await prisma.membershipPlan.findMany({
      where: { isActive: true },
    });

    return NextResponse.json({
      currentMembership: member.memberships[0] || null,
      invoices: member.payments,
      availablePlans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        durationMonths: p.durationMonths,
        features: JSON.parse(p.featuresJson || "[]"),
      })),
    });
  } catch (error: any) {
    console.error("Member payments fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
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
      include: { memberships: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const body = await req.json();
    const { planId, paymentMethod, couponCode, autoRenew } = body;

    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    let discount = 0;
    if (couponCode === "SUMMER20") discount = Number((plan.price * 0.20).toFixed(2));
    else if (couponCode === "IRON50") discount = Number((plan.price * 0.50).toFixed(2));
    else if (couponCode === "WELCOME10") discount = Number((plan.price * 0.10).toFixed(2));

    const tax = Number((plan.price * 0.18).toFixed(2));
    const netAmount = Number((plan.price + tax - discount).toFixed(2));

    // Calculate new end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    // Update / create membership
    await prisma.membership.create({
      data: {
        memberId: member.id,
        planId: plan.id,
        startDate,
        endDate,
        status: "ACTIVE",
        autoRenew: !!autoRenew,
      },
    });

    // Create payment receipt
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const payment = await prisma.payment.create({
      data: {
        invoiceNumber,
        memberId: member.id,
        amount: netAmount,
        tax,
        discount,
        method: paymentMethod || "STRIPE",
        status: "PAID",
        notes: `Online renewal: ${plan.name} (${paymentMethod || "Stripe Test"})`,
      },
    });

    return NextResponse.json({
      success: true,
      invoiceNumber,
      amount: netAmount,
      message: `Payment successful! Your ${plan.name} is now active through ${endDate.toLocaleDateString()}.`,
    });
  } catch (error: any) {
    console.error("Process payment error:", error);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
