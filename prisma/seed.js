const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting IronPulse database seed...");

  // Clean existing data
  await prisma.postLike.deleteMany({});
  await prisma.postComment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.equipment.deleteMany({});
  await prisma.locker.deleteMany({});
  await prisma.bodyMeasurement.deleteMany({});
  await prisma.nutritionLog.deleteMany({});
  await prisma.dietPlan.deleteMany({});
  await prisma.workoutLog.deleteMany({});
  await prisma.exercise.deleteMany({});
  await prisma.workoutPlan.deleteMany({});
  await prisma.classBooking.deleteMany({});
  await prisma.gymClass.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.membershipPlan.deleteMany({});
  await prisma.trainerProfile.deleteMany({});
  await prisma.memberProfile.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.branch.deleteMany({});
  await prisma.challenge.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash("ironpulse123", 10);

  // 1. Create Branches
  const downtownBranch = await prisma.branch.create({
    data: {
      name: "IronPulse Downtown Flagship",
      code: "IP-DT01",
      city: "New York / Metro",
      address: "100 Broadway, 4th Floor",
      phone: "+1 (555) 234-5678",
      capacity: 250,
    },
  });

  const uptownBranch = await prisma.branch.create({
    data: {
      name: "IronPulse Uptown Elite",
      code: "IP-UP02",
      city: "New York / Uptown",
      address: "742 Lexington Ave",
      phone: "+1 (555) 345-6789",
      capacity: 180,
    },
  });

  const westBranch = await prisma.branch.create({
    data: {
      name: "IronPulse Metro West",
      code: "IP-MW03",
      city: "Jersey City / West",
      address: "55 Hudson St, Suite 200",
      phone: "+1 (555) 456-7890",
      capacity: 150,
    },
  });

  console.log("Branches created.");

  // 2. Create Membership Plans
  const monthlyPlan = await prisma.membershipPlan.create({
    data: {
      name: "Monthly Flex Pass",
      description: "Full gym floor access, locker room, and free Wi-Fi.",
      durationMonths: 1,
      price: 49.0,
      taxPercent: 18.0,
      badge: "FLEXIBLE",
      featuresJson: JSON.stringify([
        "Full gym floor access",
        "Free locker room & showers",
        "IronPulse Member App",
        "Standard water station",
      ]),
    },
  });

  const quarterlyPlan = await prisma.membershipPlan.create({
    data: {
      name: "Quarterly Pro Athlete",
      description: "Most popular. Includes all classes, sauna access, and diet review.",
      durationMonths: 3,
      price: 129.0,
      taxPercent: 18.0,
      badge: "MOST POPULAR",
      featuresJson: JSON.stringify([
        "All Monthly Flex features",
        "Unlimited group fitness classes (HIIT, Yoga, Zumba)",
        "Sauna & steam room access",
        "1 Free personal training assessment",
        "In-app diet & nutrition tracker",
      ]),
    },
  });

  const annualPlan = await prisma.membershipPlan.create({
    data: {
      name: "Annual Elite VIP",
      description: "Ultimate luxury fitness experience. All-access multi-branch & PT included.",
      durationMonths: 12,
      price: 399.0,
      taxPercent: 18.0,
      badge: "BEST VALUE",
      featuresJson: JSON.stringify([
        "All-branch passport (Downtown, Uptown, West)",
        "Dedicated VIP locker with digital key",
        "5 Personal training sessions included",
        "Priority class booking & waitlist skip",
        "Recovery lounge & ice bath access",
        "Guest passes (2 per month)",
      ]),
    },
  });

  console.log("Membership plans created.");

  // 3. Create Gym Owner (Boss)
  const ownerUser = await prisma.user.create({
    data: {
      email: "owner@ironpulse.fit",
      phone: "+1 (555) 900-0001",
      passwordHash: defaultPasswordHash,
      name: "Marcus Vance",
      role: "OWNER",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      branchId: downtownBranch.id,
      twoFactorEnabled: false,
    },
  });

  // 4. Create 5 Trainers
  const trainersData = [
    {
      name: "Sarah Connor",
      email: "trainer@ironpulse.fit",
      phone: "+1 (555) 900-0002",
      avatar: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&auto=format&fit=crop&q=80",
      specialization: "CrossFit & Olympic Lifting",
      bio: "Ex-CrossFit Games regional athlete with 8+ years coaching champions in functional strength and biomechanics.",
      rating: 4.95,
      reviewCount: 48,
      hourlyRate: 65.0,
      salary: 4200.0,
      shift: "Morning (06:00 - 14:00)",
    },
    {
      name: "Vikram Malhotra",
      email: "vikram@ironpulse.fit",
      phone: "+1 (555) 900-0003",
      avatar: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&auto=format&fit=crop&q=80",
      specialization: "Hypertrophy & Bodybuilding",
      bio: "Certified CSCS specialist focused on progressive overload, aesthetic symmetry, and injury-free heavy lifting.",
      rating: 4.9,
      reviewCount: 36,
      hourlyRate: 60.0,
      salary: 3800.0,
      shift: "Evening (14:00 - 22:00)",
    },
    {
      name: "Elena Rostova",
      email: "elena@ironpulse.fit",
      phone: "+1 (555) 900-0004",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
      specialization: "Yoga & Mobility Restoration",
      bio: "500-hr RYT yoga master. Passionate about thoracic mobility, breathwork, and nervous system recovery.",
      rating: 4.98,
      reviewCount: 62,
      hourlyRate: 55.0,
      salary: 3600.0,
      shift: "Flexible / Midday",
    },
    {
      name: "David Kim",
      email: "david@ironpulse.fit",
      phone: "+1 (555) 900-0005",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      specialization: "HIIT & Athletic Conditioning",
      bio: "Former collegiate track sprinter. Expert in metabolic conditioning, VO2 max elevation, and agility drills.",
      rating: 4.88,
      reviewCount: 29,
      hourlyRate: 50.0,
      salary: 3400.0,
      shift: "Morning (06:00 - 14:00)",
    },
    {
      name: "Priya Sharma",
      email: "priya@ironpulse.fit",
      phone: "+1 (555) 900-0006",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      specialization: "Pilates & Sports Nutrition",
      bio: "Clinical nutritionist and certified reformer instructor. Tailors nutrition protocols to your genetic profile.",
      rating: 4.92,
      reviewCount: 41,
      hourlyRate: 55.0,
      salary: 3500.0,
      shift: "Evening (14:00 - 22:00)",
    },
  ];

  const createdTrainers = [];
  for (const t of trainersData) {
    const user = await prisma.user.create({
      data: {
        email: t.email,
        phone: t.phone,
        passwordHash: defaultPasswordHash,
        name: t.name,
        role: "TRAINER",
        avatar: t.avatar,
        branchId: downtownBranch.id,
      },
    });

    const trainer = await prisma.trainerProfile.create({
      data: {
        userId: user.id,
        specialization: t.specialization,
        bio: t.bio,
        rating: t.rating,
        reviewCount: t.reviewCount,
        hourlyRate: t.hourlyRate,
        salary: t.salary,
        shift: t.shift,
      },
    });

    createdTrainers.push({ user, trainer });
  }

  console.log("5 Trainers created.");

  // 5. Create Primary Demo Member
  const primaryMemberUser = await prisma.user.create({
    data: {
      email: "member@ironpulse.fit",
      phone: "+1 (555) 900-0010",
      passwordHash: defaultPasswordHash,
      name: "Alex Rivera",
      role: "MEMBER",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      branchId: downtownBranch.id,
    },
  });

  const primaryMemberProfile = await prisma.memberProfile.create({
    data: {
      userId: primaryMemberUser.id,
      emergencyContact: "+1 (555) 911-4455 (Sophia Rivera, Sister)",
      healthNotes: "Slight patellar tendonitis in right knee. Avoid heavy leg extensions without warm-up.",
      idProofType: "DRIVERS_LICENSE",
      idProofNumber: "DL-NY-9823481",
      bloodGroup: "O+",
      dateOfBirth: new Date("1996-05-14"),
      gender: "MALE",
      qrCode: "IP-MBR-0001-ALEX",
      streak: 18,
      xp: 3450,
      level: 7,
      currentWeight: 78.5,
      targetWeight: 75.0,
      heightCm: 180.0,
      joinDate: new Date("2025-06-01"),
    },
  });

  // Assign Annual Plan to Primary Member
  await prisma.membership.create({
    data: {
      memberId: primaryMemberProfile.id,
      planId: annualPlan.id,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2027-01-01"),
      status: "ACTIVE",
      autoRenew: true,
    },
  });

  // Payment for Primary Member
  await prisma.payment.create({
    data: {
      invoiceNumber: "INV-2026-0001",
      memberId: primaryMemberProfile.id,
      amount: 399.0,
      tax: 71.82,
      discount: 20.0,
      method: "STRIPE",
      status: "PAID",
      notes: "Annual Elite VIP Membership - Online Checkout",
    },
  });

  // 6. Seed 49 additional members to total 50 members!
  const firstNames = [
    "Liam", "Noah", "Oliver", "Elijah", "James", "William", "Benjamin", "Lucas", "Henry", "Theodore",
    "Emma", "Olivia", "Ava", "Sophia", "Isabella", "Mia", "Evelyn", "Harper", "Camila", "Gianna",
    "Rohan", "Aarav", "Kabir", "Arjun", "Aditya", "Ananya", "Diya", "Isha", "Tara", "Rhea",
    "Carlos", "Mateo", "Diego", "Santiago", "Sebastian", "Valentina", "Lucia", "Sofia", "Elena", "Carmen",
    "Jin", "Kenji", "Hao", "Tariq", "Zayd", "Fatima", "Leila", "Amina", "Chloe"
  ];
  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Patel", "Sharma", "Reddy", "Verma", "Chopra", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris",
    "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright",
    "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker"
  ];

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const healthConditions = [
    "None. Peak cardiovascular fitness.",
    "Mild asthma, manages well with warm-ups.",
    "Past rotator cuff repair in 2023. Cleared for overhead presses.",
    "Lactose intolerant. Needs vegan protein options.",
    "None. Trains for marathon endurance.",
    "Hypertension monitored by physician. Low sodium diet.",
    "Lower back tightness. Prefers Romanian deadlifts over conventional.",
    "None. Former collegiate swimmer.",
  ];

  const plans = [monthlyPlan, quarterlyPlan, annualPlan];
  const branches = [downtownBranch, uptownBranch, westBranch];
  const createdMembers = [primaryMemberProfile];

  for (let i = 0; i < 49; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[i % lastNames.length];
    const name = `${fName} ${lName}`;
    const email = `member${i + 2}@ironpulse.fit`;
    const phone = `+1 (555) 400-${String(1000 + i).slice(1)}`;
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    const branch = branches[i % branches.length];

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash: defaultPasswordHash,
        name,
        role: "MEMBER",
        avatar,
        branchId: branch.id,
      },
    });

    const isMale = i % 2 === 0;
    const currentWeight = isMale ? 70 + (i % 25) : 52 + (i % 20);
    const targetWeight = currentWeight - (i % 6) + 1;
    const streak = (i * 3) % 28;
    const xp = 800 + i * 110;
    const level = Math.floor(xp / 500) + 1;

    const profile = await prisma.memberProfile.create({
      data: {
        userId: user.id,
        emergencyContact: `+1 (555) 888-${String(2000 + i).slice(1)} (Family)`,
        healthNotes: healthConditions[i % healthConditions.length],
        idProofType: i % 3 === 0 ? "PASSPORT" : i % 3 === 1 ? "DRIVERS_LICENSE" : "AADHAAR",
        idProofNumber: `ID-${100000 + i * 73}`,
        bloodGroup: bloodGroups[i % bloodGroups.length],
        dateOfBirth: new Date(1990 + (i % 14), (i % 12), (i % 27) + 1),
        gender: isMale ? "MALE" : "FEMALE",
        qrCode: `IP-MBR-${String(1002 + i).padStart(4, "0")}-${fName.toUpperCase()}`,
        streak,
        xp,
        level,
        currentWeight,
        targetWeight,
        heightCm: isMale ? 174 + (i % 12) : 160 + (i % 12),
        joinDate: new Date(2025, (i % 12), 1),
      },
    });

    createdMembers.push(profile);

    // Membership assignment: 35 active, 8 expired, 4 frozen, 2 pending
    let status = "ACTIVE";
    let startOffsetMonths = -(i % 6);
    let endOffsetMonths = 6 - (i % 5);

    if (i >= 35 && i < 43) {
      status = "EXPIRED";
      startOffsetMonths = -8;
      endOffsetMonths = -1;
    } else if (i >= 43 && i < 47) {
      status = "FROZEN";
    } else if (i >= 47) {
      status = "PENDING";
    }

    const plan = plans[i % plans.length];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + startOffsetMonths);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + endOffsetMonths);

    await prisma.membership.create({
      data: {
        memberId: profile.id,
        planId: plan.id,
        startDate,
        endDate,
        status,
        autoRenew: status === "ACTIVE",
        frozenAt: status === "FROZEN" ? new Date() : null,
        freezeReason: status === "FROZEN" ? "Work travel / medical recovery" : null,
      },
    });

    // Payment & Invoice
    const invoiceNum = `INV-2026-${String(1000 + i + 2).slice(1)}`;
    await prisma.payment.create({
      data: {
        invoiceNumber: invoiceNum,
        memberId: profile.id,
        amount: plan.price,
        tax: Number((plan.price * 0.18).toFixed(2)),
        discount: i % 4 === 0 ? 15.0 : 0.0,
        method: i % 3 === 0 ? "STRIPE" : i % 3 === 1 ? "UPI" : "CASH",
        status: status === "PENDING" ? "PENDING" : "PAID",
        notes: `${plan.name} registration payment`,
      },
    });
  }

  console.log("50 members and memberships created.");

  // 7. Seed Gym Classes
  const classDefs = [
    {
      name: "Iron HIIT Inferno",
      description: "High-intensity metabolic conditioning with kettlebells, rowers, and plyometrics.",
      category: "HIIT",
      trainerIdx: 3, // David Kim
      durationMinutes: 45,
      capacity: 22,
      location: "Studio Alpha",
    },
    {
      name: "Sunrise Vinyasa Flow",
      description: "Invigorating full-body mobility, balance, and core stability flow.",
      category: "YOGA",
      trainerIdx: 2, // Elena Rostova
      durationMinutes: 60,
      capacity: 18,
      location: "Zen Sanctuary",
    },
    {
      name: "Beast CrossFit WOD",
      description: "Barbell clean & jerks, gymnastics pull-ups, and row intervals for maximum power.",
      category: "CROSSFIT",
      trainerIdx: 0, // Sarah Connor
      durationMinutes: 60,
      capacity: 16,
      location: "CrossFit Box",
    },
    {
      name: "Hypertrophy Upper Body Masterclass",
      description: "Scientific chest, back, and arm building with mechanical drop sets and tempo control.",
      category: "STRENGTH",
      trainerIdx: 1, // Vikram Malhotra
      durationMinutes: 75,
      capacity: 15,
      location: "Heavy Iron Zone",
    },
    {
      name: "Rhythm & Pulse Zumba Party",
      description: "Energetic cardio dance fitness fusing Latin rhythms, hip-hop, and calorie burn.",
      category: "ZUMBA",
      trainerIdx: 4, // Priya Sharma
      durationMinutes: 50,
      capacity: 25,
      location: "Studio Beta",
    },
    {
      name: "Iron Boxing Fight Camp",
      description: "Heavy bag combinations, footwork conditioning, and core endurance.",
      category: "BOXING",
      trainerIdx: 0, // Sarah Connor
      durationMinutes: 55,
      capacity: 20,
      location: "Combat Ring",
    },
  ];

  const createdClasses = [];
  for (let i = 0; i < classDefs.length; i++) {
    const c = classDefs[i];
    const trainerObj = createdTrainers[c.trainerIdx];
    const schedule = new Date();
    schedule.setHours(7 + i * 2, 30, 0, 0); // Scheduled today at staggered hours

    const gymClass = await prisma.gymClass.create({
      data: {
        name: c.name,
        description: c.description,
        category: c.category,
        trainerId: trainerObj.trainer.id,
        branchId: downtownBranch.id,
        scheduleTime: schedule,
        durationMinutes: c.durationMinutes,
        capacity: c.capacity,
        location: c.location,
        isActive: true,
      },
    });
    createdClasses.push(gymClass);

    // Book 5-10 members in each class
    for (let m = 0; m < Math.min(8, createdMembers.length); m++) {
      await prisma.classBooking.create({
        data: {
          classId: gymClass.id,
          memberId: createdMembers[(m + i * 3) % createdMembers.length].id,
          status: m === 7 ? "WAITLIST" : "CONFIRMED",
        },
      });
    }
  }

  console.log("Gym classes and bookings seeded.");

  // 8. Seed Live Gym Attendance (People in gym now!)
  // Seed ~18 members currently "IN" gym right now for live dashboard counter
  for (let i = 0; i < 18; i++) {
    const member = createdMembers[i];
    const checkInTime = new Date();
    checkInTime.setMinutes(checkInTime.getMinutes() - (15 + i * 4)); // Checked in 15-90 mins ago

    await prisma.attendance.create({
      data: {
        userId: member.userId,
        branchId: downtownBranch.id,
        checkInTime,
        method: i % 2 === 0 ? "QR" : i % 3 === 0 ? "BIOMETRIC" : "MANUAL",
        status: "IN",
      },
    });
  }

  // Seed past attendance history over the last 7 days
  for (let day = 1; day <= 7; day++) {
    for (let j = 0; j < 12; j++) {
      const member = createdMembers[(day * 4 + j) % createdMembers.length];
      const checkInTime = new Date();
      checkInTime.setDate(checkInTime.getDate() - day);
      checkInTime.setHours(8 + (j % 10), 15, 0);

      const checkOutTime = new Date(checkInTime);
      checkOutTime.setMinutes(checkOutTime.getMinutes() + 55 + (j % 30));

      await prisma.attendance.create({
        data: {
          userId: member.userId,
          branchId: downtownBranch.id,
          checkInTime,
          checkOutTime,
          method: "QR",
          status: "OUT",
        },
      });
    }
  }

  console.log("Attendance and live gym count seeded.");

  // 9. Seed Exercise Library
  const exercisesData = [
    {
      name: "Barbell Back Squat",
      category: "Legs",
      muscleGroup: "Quadriceps, Glutes, Core",
      equipment: "Barbell & Squat Rack",
      instructions: "Keep chest proud, brace core with Valsalva maneuver, break at hips and knees simultaneously, achieve hip crease below knee.",
    },
    {
      name: "Flat Barbell Bench Press",
      category: "Chest",
      muscleGroup: "Pectoralis Major, Anterior Deltoid, Triceps",
      equipment: "Barbell & Flat Bench",
      instructions: "Retract scapulae, maintain 5 points of contact, lower bar to mid-sternum with elbows tucked at 45 degrees, press explosively.",
    },
    {
      name: "Conventional Deadlift",
      category: "Back",
      muscleGroup: "Hamstrings, Erector Spinae, Lats, Trapezius",
      equipment: "Barbell & Bumper Plates",
      instructions: "Bar over midfoot, engage lats to protect spine, push floor away through midfoot, lockout with glute contraction.",
    },
    {
      name: "Standing Overhead Press",
      category: "Shoulders",
      muscleGroup: "Deltoids, Upper Traps, Triceps, Core",
      equipment: "Barbell",
      instructions: "Brace glutes and abs, press bar overhead in a vertical path by moving head out of the way, lock out overhead.",
    },
    {
      name: "Pull-ups (Weighted / Bodyweight)",
      category: "Back",
      muscleGroup: "Latissimus Dorsi, Biceps, Rhomboids",
      equipment: "Pull-up Bar",
      instructions: "Full hang stretch at bottom, drive elbows down toward ribs, pull chest to bar without kipping.",
    },
    {
      name: "Incline Dumbbell Chest Press",
      category: "Chest",
      muscleGroup: "Clavicular Pectoral, Triceps",
      equipment: "Incline Bench & Dumbbells",
      instructions: "Set bench at 30 degrees, control negative descent for 3 seconds, drive weights together at peak contraction.",
    },
    {
      name: "Romanian Deadlift (RDL)",
      category: "Legs",
      muscleGroup: "Hamstrings, Gluteus Maximus",
      equipment: "Barbell or Dumbbells",
      instructions: "Slight knee bend, hinge strictly at hips pushing pelvis back, feel deep hamstring stretch, return through glutes.",
    },
    {
      name: "Cable Face Pulls",
      category: "Shoulders",
      muscleGroup: "Rear Deltoid, Rotator Cuff, Upper Traps",
      equipment: "Cable Machine & Rope",
      instructions: "Pull rope towards bridge of nose, rotate thumbs backward to maximize external shoulder rotation.",
    },
  ];

  for (const ex of exercisesData) {
    await prisma.exercise.create({ data: ex });
  }

  // 10. Seed Workout Plan for Primary Member
  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      name: "6-Day Aesthetic Hypertrophy & Power (PPL)",
      description: "Designed by Coach Sarah Connor. Targets progressive overload with mechanical tension and metabolic stress.",
      difficulty: "INTERMEDIATE",
      goal: "HYPERTROPHY",
      trainerId: createdTrainers[0].trainer.id,
      memberId: primaryMemberProfile.id,
      isTemplate: false,
      daysJson: JSON.stringify([
        {
          day: "Monday - Push A (Chest & Delts Focus)",
          exercises: [
            { name: "Barbell Bench Press", sets: 4, reps: "6-8", rpe: 8, restSec: 120 },
            { name: "Incline DB Press", sets: 3, reps: "8-10", rpe: 8.5, restSec: 90 },
            { name: "Cable Lateral Raises", sets: 4, reps: "12-15", rpe: 9, restSec: 60 },
            { name: "Tricep Rope Pushdowns", sets: 3, reps: "10-12", rpe: 9, restSec: 60 },
          ],
        },
        {
          day: "Tuesday - Pull A (Back Width & Biceps)",
          exercises: [
            { name: "Weighted Pull-ups", sets: 4, reps: "6-8", rpe: 8.5, restSec: 120 },
            { name: "Chest-Supported T-Bar Row", sets: 3, reps: "8-10", rpe: 8, restSec: 90 },
            { name: "Cable Face Pulls", sets: 4, reps: "12-15", rpe: 8, restSec: 60 },
            { name: "Incline DB Curls", sets: 3, reps: "10-12", rpe: 9, restSec: 60 },
          ],
        },
        {
          day: "Wednesday - Legs A (Quad Dominant)",
          exercises: [
            { name: "Barbell Back Squat", sets: 4, reps: "6-8", rpe: 8.5, restSec: 150 },
            { name: "Leg Press (Foot Placed Low)", sets: 3, reps: "10-12", rpe: 9, restSec: 90 },
            { name: "Romanian Deadlift", sets: 3, reps: "8-10", rpe: 8, restSec: 90 },
            { name: "Standing Calf Raises", sets: 4, reps: "15", rpe: 9, restSec: 45 },
          ],
        },
      ]),
    },
  });

  // Seed Workout Logs
  await prisma.workoutLog.create({
    data: {
      memberId: primaryMemberProfile.id,
      date: new Date(),
      durationMinutes: 52,
      caloriesBurned: 420,
      notes: "Crushed Push A. Bench felt light at 95kg. Hit 8 reps on last set!",
      exercisesJson: JSON.stringify([
        { name: "Barbell Bench Press", completedSets: [{ reps: 8, weightKg: 90 }, { reps: 8, weightKg: 95 }, { reps: 8, weightKg: 95 }] },
        { name: "Incline DB Press", completedSets: [{ reps: 10, weightKg: 34 }, { reps: 10, weightKg: 34 }] },
        { name: "Cable Lateral Raises", completedSets: [{ reps: 15, weightKg: 12 }, { reps: 14, weightKg: 12 }] },
      ]),
    },
  });

  // 11. Seed Diet Plan & Nutrition Log for Primary Member
  await prisma.dietPlan.create({
    data: {
      name: "High Protein Athletic Clean Bulk",
      goal: "BULK",
      dailyCalories: 2650,
      proteinG: 185,
      carbsG: 290,
      fatsG: 70,
      memberId: primaryMemberProfile.id,
      mealsJson: JSON.stringify([
        {
          meal: "Breakfast",
          time: "08:00 AM",
          items: ["4 Egg whites + 2 Whole eggs omelette", "100g Rolled Oats with berries", "Black Coffee"],
          calories: 550,
          protein: 42,
          carbs: 65,
          fats: 14,
        },
        {
          meal: "Lunch",
          time: "01:00 PM",
          items: ["200g Grilled Chicken Breast", "200g Jasmine Rice", "Steamed Broccoli & Olive Oil"],
          calories: 720,
          protein: 58,
          carbs: 75,
          fats: 16,
        },
        {
          meal: "Pre/Post Workout Snack",
          time: "05:00 PM",
          items: ["1 Scoop Whey Isolate", "1 Banana", "30g Almond Butter"],
          calories: 380,
          protein: 30,
          carbs: 38,
          fats: 14,
        },
        {
          meal: "Dinner",
          time: "08:30 PM",
          items: ["180g Salmon Fillet", "Sweet Potato Mash", "Mixed Greens Avocado Salad"],
          calories: 680,
          protein: 45,
          carbs: 55,
          fats: 22,
        },
      ]),
    },
  });

  await prisma.nutritionLog.create({
    data: {
      memberId: primaryMemberProfile.id,
      date: new Date(),
      totalCalories: 2150,
      proteinG: 162,
      carbsG: 230,
      fatsG: 58,
      waterMl: 2800,
      itemsJson: JSON.stringify([
        { name: "Egg whites & Oats bowl", calories: 550, protein: 42, time: "08:15 AM" },
        { name: "Grilled Chicken & Rice", calories: 720, protein: 58, time: "01:20 PM" },
        { name: "Whey shake & Banana", calories: 380, protein: 30, time: "05:15 PM" },
        { name: "Salmon dinner", calories: 500, protein: 32, time: "08:00 PM" },
      ]),
    },
  });

  // 12. Seed Body Measurement Progress
  const measurementDates = [60, 45, 30, 15, 0];
  const weightValues = [82.5, 81.2, 80.0, 79.1, 78.5];
  const fatValues = [18.5, 17.2, 16.0, 15.1, 14.2];

  for (let i = 0; i < measurementDates.length; i++) {
    const d = new Date();
    d.setDate(d.getDate() - measurementDates[i]);

    await prisma.bodyMeasurement.create({
      data: {
        memberId: primaryMemberProfile.id,
        date: d,
        weightKg: weightValues[i],
        bodyFatPct: fatValues[i],
        chestCm: 104.0 + i * 0.4,
        waistCm: 86.0 - i * 0.8,
        hipsCm: 96.0 - i * 0.2,
        armsCm: 38.5 + i * 0.3,
        notes: i === 4 ? "Veins appearing on delts and lower abs!" : "Steady recomp progress.",
      },
    });
  }

  // 13. Seed Lockers & Equipment
  for (let num = 101; num <= 125; num++) {
    await prisma.locker.create({
      data: {
        number: num,
        branchId: downtownBranch.id,
        status: num === 101 ? "OCCUPIED" : num === 115 ? "MAINTENANCE" : "AVAILABLE",
        assignedMemberId: num === 101 ? primaryMemberProfile.id : null,
      },
    });
  }

  const equipmentList = [
    { name: "Eleiko Olympic Power Rack #1", category: "Free Weights", status: "FUNCTIONAL" },
    { name: "Eleiko Olympic Power Rack #2", category: "Free Weights", status: "FUNCTIONAL" },
    { name: "Life Fitness Commercial Treadmill A1", category: "Cardio", status: "FUNCTIONAL" },
    { name: "Life Fitness Commercial Treadmill A2", category: "Cardio", status: "MAINTENANCE_DUE" },
    { name: "Concept2 RowErg Model D", category: "Cardio", status: "FUNCTIONAL" },
    { name: "Hammer Strength Dual Adjustable Pulley", category: "Resistance Machines", status: "FUNCTIONAL" },
    { name: "Hammer Strength Iso-Lateral Chest Press", category: "Resistance Machines", status: "FUNCTIONAL" },
    { name: "Rogue Echo AirBike", category: "Cardio", status: "FUNCTIONAL" },
    { name: "Urethane Dumbbell Set (2.5kg - 50kg)", category: "Free Weights", status: "FUNCTIONAL" },
    { name: "Infrared Finnish Cedar Sauna #1", category: "Recovery", status: "FUNCTIONAL" },
  ];

  for (const eq of equipmentList) {
    const nextService = new Date();
    nextService.setDate(nextService.getDate() + 45);

    await prisma.equipment.create({
      data: {
        name: eq.name,
        category: eq.category,
        branchId: downtownBranch.id,
        status: eq.status,
        lastServicedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        nextServiceDue: nextService,
      },
    });
  }

  // 14. Seed Leads CRM
  const leadsData = [
    { name: "Jessica Taylor", email: "jessica.t@gmail.com", phone: "+1 (555) 777-1001", status: "TRIAL_BOOKED", source: "Instagram Ad", notes: "Interested in HIIT classes and weight loss." },
    { name: "Daniel Martinez", email: "daniel.m@outlook.com", phone: "+1 (555) 777-1002", status: "ENQUIRY", source: "Walk-in", notes: "Looking for 1-on-1 personal training for posture." },
    { name: "Pooja Hegde", email: "pooja.h@yahoo.com", phone: "+1 (555) 777-1003", status: "CONVERTED", source: "Referral", notes: "Joined Quarterly Pro through Alex Rivera." },
    { name: "Robert Chen", email: "chen.robert@gmail.com", phone: "+1 (555) 777-1004", status: "ENQUIRY", source: "Google Maps", notes: "Asked about corporate gym discounts." },
    { name: "Samantha Green", email: "sam.green@icloud.com", phone: "+1 (555) 777-1005", status: "LOST", source: "Website", notes: "Relocating to another city next month." },
  ];

  for (const l of leadsData) {
    await prisma.lead.create({ data: l });
  }

  // 15. Seed Challenges
  const challenges = [
    {
      title: "30-Day Savage Summer Shred",
      description: "Log at least 20 intense workout sessions in 30 days. Win exclusive IronPulse Gold Shaker & 500 XP.",
      category: "WORKOUT",
      rewardXp: 500,
      badgeIcon: "Flame",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      targetValue: 20,
      participantsCount: 42,
    },
    {
      title: "50km Cardio Beast Challenge",
      description: "Accumulate 50 kilometers across treadmills, rowers, or bikes this month.",
      category: "CALORIES",
      rewardXp: 400,
      badgeIcon: "Zap",
      startDate: new Date(),
      endDate: new Date(Date.now() + 25 * 24 * 3600 * 1000),
      targetValue: 50,
      participantsCount: 28,
    },
    {
      title: "Iron Discipline Streak (14 Days)",
      description: "Check into gym or log nutrition 14 consecutive days without breaking streak.",
      category: "STREAK",
      rewardXp: 600,
      badgeIcon: "Trophy",
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 3600 * 1000),
      targetValue: 14,
      participantsCount: 35,
    },
  ];

  for (const ch of challenges) {
    await prisma.challenge.create({ data: ch });
  }

  // 16. Seed Social Community Feed Posts
  const post1 = await prisma.post.create({
    data: {
      authorId: primaryMemberUser.id,
      content: "Finally broke through my bench plateau today! 95kg for 8 clean reps. Thanks Coach @SarahConnor for fixing my shoulder arch!",
      workoutDetails: "Bench Press: 95kg x 8 reps | RPE 8.5",
      likesCount: 14,
    },
  });

  await prisma.postComment.create({
    data: {
      postId: post1.id,
      authorId: createdTrainers[0].user.id,
      content: "Leg drive made all the difference Alex! Keep locking it in 🔥",
    },
  });

  await prisma.post.create({
    data: {
      authorId: ownerUser.id,
      content: "⚡ ANNOUNCEMENT: New Eleiko calibrated barbell sets and infrared sauna recovery zone are officially open at Downtown Flagship! Come test them out.",
      likesCount: 39,
    },
  });

  // 17. Seed Expenses for P&L tracking
  const expensesList = [
    { title: "Monthly Facility Lease - Downtown", category: "Rent", amount: 6500.0, vendor: "Broadway Real Estate Holdings" },
    { title: "Commercial Power & Water Utility", category: "Utilities", amount: 1250.0, vendor: "ConEdison" },
    { title: "Supplement & Protein Shop Inventory", category: "Supplements", amount: 2100.0, vendor: "Optimum Nutrition Wholesale" },
    { title: "Quarterly HVAC & Sauna Filter Servicing", category: "Maintenance", amount: 650.0, vendor: "Apex Mechanical Services" },
    { title: "Social Media Ads (Meta & Google)", category: "Marketing", amount: 800.0, vendor: "Meta Platforms Ads" },
  ];

  for (const exp of expensesList) {
    await prisma.expense.create({
      data: {
        branchId: downtownBranch.id,
        title: exp.title,
        category: exp.category,
        amount: exp.amount,
        vendor: exp.vendor,
      },
    });
  }

  console.log("Seeding finished successfully!");
  console.log("Demo Accounts:");
  console.log("  Owner:   owner@ironpulse.fit / ironpulse123");
  console.log("  Trainer: trainer@ironpulse.fit / ironpulse123");
  console.log("  Member:  member@ironpulse.fit / ironpulse123");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
