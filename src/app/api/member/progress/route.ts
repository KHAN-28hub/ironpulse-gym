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
        measurements: {
          orderBy: { date: "asc" },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const formatted = member.measurements.map((m) => ({
      id: m.id,
      date: m.date.toISOString().split("T")[0],
      weightKg: m.weightKg,
      bodyFatPct: m.bodyFatPct,
      chestCm: m.chestCm,
      waistCm: m.waistCm,
      hipsCm: m.hipsCm,
      armsCm: m.armsCm,
      notes: m.notes,
    }));

    const heightM = (member.heightCm || 180) / 100;
    const currentWeight = member.currentWeight || 78.5;
    const currentBmi = Number((currentWeight / (heightM * heightM)).toFixed(1));

    return NextResponse.json({
      summary: {
        currentWeight,
        targetWeight: member.targetWeight || 75.0,
        heightCm: member.heightCm || 180,
        bmi: currentBmi,
        bodyFatPct: member.measurements[member.measurements.length - 1]?.bodyFatPct || 14.2,
      },
      history: formatted,
      photos: [
        { label: "Day 1 Baseline", date: "2025-06-01", url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500" },
        { label: "Day 90 Mid-Point", date: "2025-09-01", url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500" },
        { label: "Current Physique", date: "2026-11-15", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500" },
      ],
    });
  } catch (error: any) {
    console.error("Progress fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
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
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const body = await req.json();
    const { weightKg, bodyFatPct, chestCm, waistCm, hipsCm, armsCm, notes } = body;

    const newRecord = await prisma.bodyMeasurement.create({
      data: {
        memberId: member.id,
        date: new Date(),
        weightKg: parseFloat(weightKg),
        bodyFatPct: bodyFatPct ? parseFloat(bodyFatPct) : null,
        chestCm: chestCm ? parseFloat(chestCm) : null,
        waistCm: waistCm ? parseFloat(waistCm) : null,
        hipsCm: hipsCm ? parseFloat(hipsCm) : null,
        armsCm: armsCm ? parseFloat(armsCm) : null,
        notes: notes || "Progress logged",
      },
    });

    // Update current weight in member profile
    await prisma.memberProfile.update({
      where: { id: member.id },
      data: { currentWeight: parseFloat(weightKg) },
    });

    return NextResponse.json({ success: true, measurement: newRecord });
  } catch (error: any) {
    console.error("Progress log error:", error);
    return NextResponse.json({ error: "Failed to log progress" }, { status: 500 });
  }
}
