import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trainers = await prisma.trainerProfile.findMany({
      include: {
        user: true,
        classes: true,
        workoutPlans: true,
      },
    });

    const formattedTrainers = trainers.map((t, idx) => {
      const assignedCount = 8 + (idx * 3); // realistic client roster
      const monthlyCommissions = assignedCount * 4 * (t.hourlyRate * t.commissionRate);
      return {
        id: t.id,
        userId: t.userId,
        name: t.user.name,
        email: t.user.email,
        phone: t.user.phone,
        avatar: t.user.avatar,
        specialization: t.specialization,
        bio: t.bio,
        rating: t.rating,
        reviewCount: t.reviewCount,
        salary: t.salary,
        hourlyRate: t.hourlyRate,
        commissionRate: t.commissionRate,
        monthlyCommissions: Math.round(monthlyCommissions),
        totalMonthlyPayout: Math.round(t.salary + monthlyCommissions),
        shift: t.shift,
        classesCount: t.classes.length,
        assignedClientsCount: assignedCount,
      };
    });

    // Staff roster
    const staffMembers = [
      { id: "STF-01", name: "David Chen", role: "Head of Operations & Floor", shift: "08:00 - 16:00", permissions: "Full Access", monthlySalary: 3800, status: "ON_DUTY" },
      { id: "STF-02", name: "Aaliyah Brooks", role: "Front Desk & Guest Experience", shift: "06:00 - 14:00", permissions: "Check-in & POS", monthlySalary: 2600, status: "ON_DUTY" },
      { id: "STF-03", name: "Carlos Mendez", role: "Equipment Maintenance Lead", shift: "14:00 - 22:00", permissions: "Inventory & Service", monthlySalary: 3100, status: "OFF_DUTY" },
      { id: "STF-04", name: "Nina Petrov", role: "Cleanliness & Sanitation Supervisor", shift: "22:00 - 06:00 (Night)", permissions: "Locker & Facilities", monthlySalary: 2400, status: "OFF_DUTY" },
    ];

    return NextResponse.json({
      trainers: formattedTrainers,
      staff: staffMembers,
    });
  } catch (error: any) {
    console.error("Trainer fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch trainers and staff" }, { status: 500 });
  }
}
