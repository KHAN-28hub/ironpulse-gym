import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    const query = prompt.toLowerCase();
    let reply = "";

    if (query.includes("bench") || query.includes("elbow") || query.includes("chest")) {
      reply = "💡 **PulseAI Form Tip for Bench Press**:\n\n1. **Tuck Elbows**: Keep elbows angled at 45-60 degrees from your torso rather than flared at 90 degrees. This shifts shear force away from the elbow tendons onto the pectoralis major.\n2. **Grip Width**: Ensure your forearms are completely vertical at the bottom of the press.\n3. **Shoulder Retraction**: Squeeze your shoulder blades together and 'drive' your upper back into the bench.\n\n*Alternative*: Switch to neutral-grip dumbbell presses for 2 weeks while your elbow recovers.";
    } else if (query.includes("squat") || query.includes("knee") || query.includes("leg")) {
      reply = "🔥 **PulseAI Squat & Knee Mechanics**:\n\n1. **Drive knees outward**: Track your knees directly in line with your 2nd and 3rd toes to prevent valgus collapse.\n2. **Hip Hinge First**: Break slightly at the hips and knees at the same time, maintaining a neutral lumbar spine.\n3. **Alternative**: If knee tendons feel strained, perform **Romanian Deadlifts (RDLs)** or **Box Squats** which emphasize the posterior chain (glutes & hamstrings) without excessive patellar shear.";
    } else if (query.includes("protein") || query.includes("diet") || query.includes("macro") || query.includes("eat")) {
      reply = "🥗 **PulseAI Nutrition Target**:\n\nBased on your 78.5 kg frame and athletic hypertrophy goal:\n- **Daily Protein**: Aim for 160g – 185g (approx. 2.2g per kg of body weight).\n- **Post-Workout Window**: 30-40g whey isolate or grilled chicken with 40-50g fast-digesting carbs (banana, white rice, or cream of rice) within 90 minutes of your session.\n- **Hydration**: Drink at least 3.5 Liters of water today.";
    } else if (query.includes("hiit") || query.includes("quick") || query.includes("cardio")) {
      reply = "⚡ **PulseAI 20-Minute Tabata / HIIT Protocol**:\n\nPerform 4 Rounds (45s Work / 15s Rest):\n1. Rogue Echo AirBike (All-Out Sprint)\n2. Kettlebell Swings (24kg / 16kg)\n3. Burpee Box Jump-Overs\n4. Concept2 Rower (Max Calorie Pace)\n5. Plank to Push-up\n\n*Rest 1 minute between rounds. Burn: ~280 kcal.*";
    } else {
      reply = `⚡ **PulseAI Coach**: Welcome to your session, ${user.name}! Keep progressive overload at the core of your lifts today. Focus on controlling the 2-3 second eccentric (lowering) phase for maximum hypertrophy. What muscle group or workout question can I assist with right now?`;
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("AI Coach error:", error);
    return NextResponse.json({ error: "AI Coach unavailable" }, { status: 500 });
  }
}
