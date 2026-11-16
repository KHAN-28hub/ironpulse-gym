import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const equipment = await prisma.equipment.findMany({
      include: { branch: true },
      orderBy: { name: "asc" },
    });

    const supplementsInventory = [
      { id: "SUP-01", name: "IronPulse 100% Whey Isolate (2kg)", category: "Protein", inStock: 48, minThreshold: 15, unitPrice: 65, status: "IN_STOCK" },
      { id: "SUP-02", name: "Creapure Micronized Creatine 500g", category: "Performance", inStock: 32, minThreshold: 10, unitPrice: 28, status: "IN_STOCK" },
      { id: "SUP-03", name: "Pre-Ignite High Stim Preworkout", category: "Energy", inStock: 8, minThreshold: 12, unitPrice: 42, status: "LOW_STOCK" },
      { id: "SUP-04", name: "BCAA Electrolyte Hydration 400g", category: "Recovery", inStock: 25, minThreshold: 10, unitPrice: 30, status: "IN_STOCK" },
      { id: "SUP-05", name: "Stainless Steel Matte Shaker 750ml", category: "Merchandise", inStock: 64, minThreshold: 20, unitPrice: 22, status: "IN_STOCK" },
      { id: "SUP-06", name: "Heavy Duty Padded Lifting Straps", category: "Accessories", inStock: 4, minThreshold: 10, unitPrice: 18, status: "LOW_STOCK" },
    ];

    return NextResponse.json({
      equipment,
      supplements: supplementsInventory,
    });
  } catch (error: any) {
    console.error("Equipment fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, equipmentId, name, category, status } = body;

    if (action === "REPORT_ISSUE") {
      await prisma.equipment.update({
        where: { id: equipmentId },
        data: { status: status || "OUT_OF_ORDER" },
      });
      return NextResponse.json({ success: true, message: "Issue logged. Maintenance scheduled." });
    }

    if (action === "MARK_SERVICED") {
      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + 60);

      await prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          status: "FUNCTIONAL",
          lastServicedAt: new Date(),
          nextServiceDue: nextDue,
        },
      });
      return NextResponse.json({ success: true, message: "Equipment serviced successfully" });
    }

    const branch = await prisma.branch.findFirst();
    const nextService = new Date();
    nextService.setDate(nextService.getDate() + 90);

    const newEquip = await prisma.equipment.create({
      data: {
        name,
        category: category || "Free Weights",
        branchId: branch?.id || "default",
        status: "FUNCTIONAL",
        nextServiceDue: nextService,
      },
    });

    return NextResponse.json({ success: true, equipment: newEquip });
  } catch (error: any) {
    console.error("Equipment error:", error);
    return NextResponse.json({ error: "Failed to process equipment request" }, { status: 500 });
  }
}
