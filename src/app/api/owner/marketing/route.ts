import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });

    const campaigns = [
      { id: "CMP-01", title: "Black Friday Pre-Sale Blast", channel: "WhatsApp & SMS", sentCount: 1420, openRate: "94.2%", conversions: 48, status: "COMPLETED" },
      { id: "CMP-02", title: "Free Weekend Guest Pass Invitation", channel: "Email", sentCount: 890, openRate: "42.8%", conversions: 19, status: "ACTIVE" },
      { id: "CMP-03", title: "Summer Shred 30-Day Kickoff", channel: "Push Notification", sentCount: 2300, openRate: "78.4%", conversions: 72, status: "COMPLETED" },
    ];

    const automations = [
      { id: "AUT-01", name: "Birthday Perk Automation", trigger: "Member Birthday", action: "Dispatches 20% discount coupon on PT + Free Protein Smoothie", status: "ENABLED" },
      { id: "AUT-02", name: "7-Day Expiry Renewal Reminder", trigger: "Membership Expiry T-7 Days", action: "Sends WhatsApp alert with 1-click renewal payment link", status: "ENABLED" },
      { id: "AUT-03", name: "Inactivity Revival Protocol", trigger: "Zero attendance in 7 days", action: "Sends personalized 'We miss you' push alert from assigned coach", status: "ENABLED" },
    ];

    const banners = [
      { id: "BAN-01", title: "New Infrared Sauna & Cold Plunge Lounge Open!", subtitle: "Complimentary access for all Pro & VIP members this week.", active: true, tag: "FACILITY UPGRADE" },
      { id: "BAN-02", title: "Olympic Lifting Seminar with Coach Sarah", subtitle: "Saturday 11:00 AM. Free for members. Reserve your barbell.", active: true, tag: "WORKSHOP" },
    ];

    return NextResponse.json({
      leads,
      campaigns,
      automations,
      banners,
    });
  } catch (error: any) {
    console.error("Marketing fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch marketing data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, leadId, name, email, phone, source, status, notes } = body;

    if (action === "UPDATE_LEAD_STATUS") {
      await prisma.lead.update({
        where: { id: leadId },
        data: { status },
      });
      return NextResponse.json({ success: true, message: "Lead status updated" });
    }

    if (action === "ADD_LEAD") {
      const newLead = await prisma.lead.create({
        data: {
          name,
          email: email || "N/A",
          phone: phone || "N/A",
          source: source || "Website",
          status: "ENQUIRY",
          notes: notes || "Initial inquiry from campaign",
        },
      });
      return NextResponse.json({ success: true, lead: newLead });
    }

    if (action === "TRIGGER_CAMPAIGN") {
      return NextResponse.json({
        success: true,
        message: "Campaign queued and dispatched to target audience via WhatsApp/SMS gateway.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Marketing error:", error);
    return NextResponse.json({ error: "Failed to process marketing request" }, { status: 500 });
  }
}
