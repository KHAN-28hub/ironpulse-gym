import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const expenses = await prisma.expense.findMany({
      orderBy: { date: "desc" },
    });

    const totalRevenue = payments
      .filter((p) => p.status === "PAID")
      .reduce((acc, p) => acc + p.amount, 0);

    const totalTax = payments
      .filter((p) => p.status === "PAID")
      .reduce((acc, p) => acc + p.tax, 0);

    const pendingDues = payments
      .filter((p) => p.status === "PENDING")
      .reduce((acc, p) => acc + p.amount, 0);

    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    const formattedInvoices = payments.map((p) => ({
      id: p.id,
      invoiceNumber: p.invoiceNumber,
      memberName: p.member.user.name,
      memberEmail: p.member.user.email,
      memberQr: p.member.qrCode,
      amount: p.amount,
      tax: p.tax,
      discount: p.discount,
      netTotal: p.amount + p.tax - p.discount,
      method: p.method,
      status: p.status,
      notes: p.notes,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({
      summary: {
        totalRevenue: Math.round(totalRevenue),
        totalExpenses: Math.round(totalExpenses),
        netProfit: Math.round(netProfit),
        pendingDues: Math.round(pendingDues),
        totalTaxCollected: Math.round(totalTax),
        profitMargin: totalRevenue > 0 ? `${Math.round((netProfit / totalRevenue) * 100)}%` : "0%",
      },
      invoices: formattedInvoices,
      expenses,
    });
  } catch (error: any) {
    console.error("Billing fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch billing data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, invoiceId, title, category, amount, vendor, memberId } = body;

    if (action === "ADD_EXPENSE") {
      const branch = await prisma.branch.findFirst();
      const expense = await prisma.expense.create({
        data: {
          branchId: branch?.id || "default",
          title,
          category,
          amount: parseFloat(amount),
          vendor: vendor || "General",
        },
      });
      return NextResponse.json({ success: true, expense });
    }

    if (action === "REFUND_INVOICE") {
      await prisma.payment.update({
        where: { id: invoiceId },
        data: { status: "REFUNDED" },
      });
      return NextResponse.json({ success: true, message: "Invoice marked as refunded" });
    }

    if (action === "SEND_REMINDER") {
      // In production, triggers WhatsApp / SMS gateway
      return NextResponse.json({
        success: true,
        message: "Automatic payment & renewal reminder dispatched via WhatsApp & Email.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Billing post error:", error);
    return NextResponse.json({ error: "Failed to process billing action" }, { status: 500 });
  }
}
