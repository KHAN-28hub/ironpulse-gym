"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { NavbarControls } from "@/components/NavbarControls";
import {
  Dumbbell,
  Flame,
  QrCode,
  Calendar,
  Award,
  Sparkles,
  LogOut,
  Zap,
  CheckCircle,
  TrendingUp,
  Apple,
  MessageSquare,
  Search,
  Plus,
  Play,
  RotateCcw,
  Clock,
  Heart,
  Share2,
  DollarSign,
  Droplet,
  ChevronRight,
  ShieldCheck,
  User,
  Activity,
  ArrowRight,
  Send,
  X,
  CreditCard,
  Camera,
  Bot,
  ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type MemberTab =
  | "HOME"
  | "WORKOUTS"
  | "NUTRITION"
  | "PROGRESS"
  | "CLASSES"
  | "TRAINER"
  | "PAYMENTS"
  | "COMMUNITY"
  | "AI_COACH";

export default function MemberDashboard() {
  const router = useRouter();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<MemberTab>("HOME");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Data states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [workoutsData, setWorkoutsData] = useState<any>(null);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [trainersList, setTrainersList] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [challengesData, setChallengesData] = useState<any>(null);
  const [paymentsData, setPaymentsData] = useState<any>(null);

  // Active Workout Logger state
  const [isLoggingWorkout, setIsLoggingWorkout] = useState(false);
  const [activeExercises, setActiveExercises] = useState<any[]>([
    { name: "Barbell Bench Press", sets: [{ reps: 8, weightKg: 90 }, { reps: 8, weightKg: 95 }] },
    { name: "Incline DB Press", sets: [{ reps: 10, weightKg: 34 }, { reps: 10, weightKg: 34 }] },
  ]);
  const [restTimerSeconds, setRestTimerSeconds] = useState(0);
  const [restTimerActive, setRestTimerActive] = useState(false);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatCoach, setChatCoach] = useState<any>(null);

  // AI Coach state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiConversation, setAiConversation] = useState<any[]>([
    {
      role: "assistant",
      text: "👋 Hey Alex! I'm your PulseAI Coach. Need a lifting form breakdown, quick nutrition advice, or exercise alternatives today?",
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Payment Renewal Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("STRIPE");
  const [couponCode, setCouponCode] = useState("");
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState("");

  // Barcode Scanner Modal Placeholder
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Rest Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (restTimerActive && restTimerSeconds > 0) {
      interval = setInterval(() => {
        setRestTimerSeconds((s) => s - 1);
      }, 1000);
    } else if (restTimerSeconds === 0 && restTimerActive) {
      setRestTimerActive(false);
      showToast("⏰ Rest timer complete! Time for the next set.");
    }
    return () => clearInterval(interval);
  }, [restTimerActive, restTimerSeconds]);

  // Load all member data
  const loadMemberData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.authenticated || meData.user.role !== "MEMBER") {
        router.push("/");
        return;
      }
      setUser(meData.user);

      // Dashboard
      const dashRes = await fetch("/api/member/dashboard");
      const dData = await dashRes.json();
      setDashboardData(dData);

      // Workouts
      const woRes = await fetch("/api/member/workouts");
      const woData = await woRes.json();
      setWorkoutsData(woData);

      // Nutrition
      const nutRes = await fetch("/api/member/nutrition");
      const nutData = await nutRes.json();
      setNutritionData(nutData);

      // Progress
      const progRes = await fetch("/api/member/progress");
      const progData = await progRes.json();
      setProgressData(progData);

      // Classes
      const clsRes = await fetch("/api/member/classes");
      const clsData = await clsRes.json();
      setClassesData(clsData.classes || []);

      // Trainers
      const trRes = await fetch("/api/member/trainers");
      const trData = await trRes.json();
      setTrainersList(trData.trainers || []);

      // Chat
      const chatRes = await fetch("/api/member/chat");
      const cData = await chatRes.json();
      setChatMessages(cData.messages || []);
      setChatCoach(cData.coach);

      // Community
      const comRes = await fetch("/api/member/community");
      const comData = await comRes.json();
      setCommunityPosts(comData.posts || []);

      // Challenges
      const chalRes = await fetch("/api/member/challenges");
      const chalData = await chalRes.json();
      setChallengesData(chalData);

      // Payments
      const payRes = await fetch("/api/member/payments");
      const payData = await payRes.json();
      setPaymentsData(payData);
    } catch (e) {
      console.error("Member data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  // Simulate gate check-in from membership card
  const handleSimulateCheckIn = async () => {
    try {
      const qr = dashboardData?.member?.qrCode || "IP-MBR-0001-ALEX";
      const res = await fetch("/api/owner/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: qr, method: "QR", action: "TOGGLE" }),
      });
      const data = await res.json();
      showToast(data.message);
      loadMemberData();
    } catch (e) {
      showToast("Error checking in");
    }
  };

  // Log water intake
  const handleAddWater = async (amountMl: number) => {
    await fetch("/api/member/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADD_WATER", waterDelta: amountMl }),
    });
    showToast(`💧 Added +${amountMl}ml water! Stay hydrated.`);
    loadMemberData();
  };

  // Book / Cancel Class
  const handleToggleClassBooking = async (classId: string, isBooked: boolean) => {
    const res = await fetch("/api/member/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, action: isBooked ? "CANCEL" : "BOOK" }),
    });
    const data = await res.json();
    showToast(data.message || "Class booking updated");
    loadMemberData();
  };

  // Send message to coach
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");

    // Optimistic append
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), isMe: true, message: msg, createdAt: new Date() },
    ]);

    await fetch("/api/member/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });

    // Simulate coach reply after 1.5 seconds
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          isMe: false,
          message: "Got your message, Alex! Reviewing your split now. Keep that intensity high for tomorrow's leg day! 🔥",
          createdAt: new Date(),
        },
      ]);
    }, 1500);
  };

  // Ask PulseAI
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;
    const q = aiPrompt.trim();
    setAiPrompt("");
    setAiConversation((prev) => [...prev, { role: "user", text: q }]);
    setAiLoading(true);

    try {
      const res = await fetch("/api/member/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q }),
      });
      const data = await res.json();
      setAiConversation((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (e) {
      setAiConversation((prev) => [
        ...prev,
        { role: "assistant", text: "PulseAI encountered a brief interruption. Please try again!" },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Process Renewal Payment
  const handleProcessPayment = async () => {
    if (!selectedPlanForPayment) return;
    try {
      const res = await fetch("/api/member/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlanForPayment.id,
          paymentMethod,
          couponCode,
          autoRenew: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPaymentSuccessMsg(data.message);
      showToast(data.message);
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentSuccessMsg("");
        loadMemberData();
      }, 2000);
    } catch (err: any) {
      alert(err.message || "Payment failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-neon-orange border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
          Loading IronPulse Athlete App...
        </p>
      </div>
    );
  }

  const member = dashboardData?.member || {};
  const membership = dashboardData?.membership || {};
  const todayNut = dashboardData?.todayNutrition || {};

  return (
    <div className="min-h-screen bg-[#08090d] text-white flex flex-col justify-between">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900 border border-neon-orange text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-neon-orange" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neon-orange flex items-center justify-center text-white font-black shadow-[0_0_15px_rgba(255,85,0,0.3)]">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight font-sans">
                IRON<span className="text-neon-orange">PULSE</span> ATHLETE
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neon-orange/20 text-neon-orange border border-neon-orange/30">
                PRO v2.0
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Facility: <span className="text-zinc-200 font-semibold">{member.branchName || "Downtown Flagship"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Streak Flame Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-orange/15 border border-neon-orange/30 text-xs text-neon-orange font-bold">
            <Flame className="w-4 h-4 fill-neon-orange animate-pulse" />
            <span>{member.streak || 18} Days Streak</span>
          </div>

          <NavbarControls />

          {/* Profile & Logout */}
          <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
            <img
              src={member.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
            />
            <div className="hidden md:block text-left text-xs">
              <p className="font-bold text-white">{member.name}</p>
              <p className="text-zinc-400 text-[10px]">Lvl {member.level} Athlete</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex w-60 border-r border-zinc-800/80 bg-zinc-950/60 p-4 flex-col justify-between shrink-0">
          <nav className="space-y-1.5">
            {[
              { id: "HOME", label: "Home Feed", icon: Activity },
              { id: "WORKOUTS", label: "Workout & Timer", icon: Dumbbell },
              { id: "NUTRITION", label: "Diet & Macros", icon: Apple },
              { id: "PROGRESS", label: "Body Progress", icon: TrendingUp },
              { id: "CLASSES", label: "Book Classes", icon: Calendar },
              { id: "TRAINER", label: "Coach & Chat", icon: MessageSquare },
              { id: "COMMUNITY", label: "Community & Ranks", icon: Award },
              { id: "PAYMENTS", label: "Membership & Invoices", icon: DollarSign },
              { id: "AI_COACH", label: "PulseAI Assistant", icon: Bot },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as MemberTab)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-neon-orange text-white font-black shadow-[0_0_15px_rgba(255,85,0,0.3)]"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-500">
            <span className="text-zinc-400 font-bold block mb-1">Wearable Sync Active</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Apple Health & Fit synced
            </span>
          </div>
        </aside>

        {/* Dynamic Center Stage */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-8 space-y-6">
          {/* TAB 1: HOME FEED */}
          {activeTab === "HOME" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Motivational Quote Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-neon-orange/15 via-zinc-900/60 to-transparent border border-neon-orange/30 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-300 italic">
                    "{dashboardData?.quote?.quote}"
                  </p>
                  <span className="text-[10px] font-bold text-neon-orange uppercase tracking-wider mt-1 block">
                    — {dashboardData?.quote?.author}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                    {membership.daysLeft || 312} Days Left on Pass
                  </span>
                </div>
              </div>

              {/* Digital Membership Holographic Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-700/80 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-orange/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-neon-orange/20 text-neon-orange border border-neon-orange/40 mb-2 inline-block">
                      Official Membership Badge
                    </span>
                    <h3 className="text-2xl font-black text-white">{member.name}</h3>
                    <p className="text-xs text-zinc-400">{membership.planName || "Annual Elite VIP Pass"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSimulateCheckIn}
                      className="px-4 py-2 rounded-xl bg-neon-orange hover:bg-orange-600 text-white font-black text-xs transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,85,0,0.3)]"
                    >
                      <QrCode className="w-4 h-4" /> Simulate Gate Check-in
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-zinc-800/80 gap-4">
                  <div className="font-mono text-sm tracking-widest text-zinc-300">
                    {member.qrCode || "IP-MBR-0001-ALEX"}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span>XP: <strong className="text-white">{member.xp || 3450}</strong></span>
                    <span>Level: <strong className="text-neon-orange">{member.level || 7}</strong></span>
                    <span>Weight: <strong className="text-white">{member.currentWeight || 78.5} kg</strong></span>
                  </div>
                </div>
              </div>

              {/* Calorie & Water Daily Goals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Calories Progress Card */}
                <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 font-medium">Daily Caloric Target</span>
                    <div className="text-2xl font-black text-white mt-1">
                      {todayNut.calories} <span className="text-xs font-normal text-zinc-500">/ {todayNut.calorieTarget} kcal</span>
                    </div>
                    <div className="w-48 h-2 rounded-full bg-zinc-800 mt-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-neon-orange to-yellow-400 rounded-full"
                        style={{ width: `${Math.min(100, (todayNut.calories / todayNut.calorieTarget) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-2 block">
                      {todayNut.protein}g Protein · {todayNut.carbs}g Carbs · {todayNut.fats}g Fats
                    </span>
                  </div>
                  <Apple className="w-8 h-8 text-neon-orange opacity-80" />
                </div>

                {/* Water Tracker Card */}
                <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 font-medium">Hydration Intake</span>
                    <div className="text-2xl font-black text-cyan-400 mt-1">
                      {(todayNut.waterMl / 1000).toFixed(1)} <span className="text-xs font-normal text-zinc-500">/ {(todayNut.waterTargetMl / 1000).toFixed(1)} Liters</span>
                    </div>
                    <div className="w-48 h-2 rounded-full bg-zinc-800 mt-3 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${Math.min(100, (todayNut.waterMl / todayNut.waterTargetMl) * 100)}%` }}
                      />
                    </div>
                    <div className="flex gap-2 mt-2.5">
                      <button
                        onClick={() => handleAddWater(250)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold border border-cyan-500/30"
                      >
                        +250ml
                      </button>
                      <button
                        onClick={() => handleAddWater(500)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold border border-cyan-500/30"
                      >
                        +500ml
                      </button>
                    </div>
                  </div>
                  <Droplet className="w-8 h-8 text-cyan-400 opacity-80" />
                </div>
              </div>

              {/* Quick Launch Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveTab("WORKOUTS")}
                  className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-neon-orange cursor-pointer transition"
                >
                  <Dumbbell className="w-5 h-5 text-neon-orange mb-2" />
                  <h4 className="text-sm font-bold text-white">Start Workout Logger</h4>
                  <p className="text-xs text-zinc-400 mt-1">Push Day A · Bench & Delts</p>
                </div>

                <div
                  onClick={() => setActiveTab("CLASSES")}
                  className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-400 cursor-pointer transition"
                >
                  <Calendar className="w-5 h-5 text-cyan-400 mb-2" />
                  <h4 className="text-sm font-bold text-white">Book Group Class</h4>
                  <p className="text-xs text-zinc-400 mt-1">CrossFit WOD & Zumba</p>
                </div>

                <div
                  onClick={() => setActiveTab("AI_COACH")}
                  className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-purple-400 cursor-pointer transition"
                >
                  <Bot className="w-5 h-5 text-purple-400 mb-2" />
                  <h4 className="text-sm font-bold text-white">Ask PulseAI Coach</h4>
                  <p className="text-xs text-zinc-400 mt-1">Form tips & macro advice</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKOUTS & REST TIMER */}
          {activeTab === "WORKOUTS" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Header with Rest Timer */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Active Workout Hub</h3>
                  <p className="text-xs text-zinc-400">{workoutsData?.activePlan?.name || "6-Day Aesthetic Hypertrophy (PPL)"}</p>
                </div>

                {/* Rest Timer Widget */}
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <Clock className="w-4 h-4 text-neon-orange" />
                  <span className="text-xs text-zinc-300 font-semibold">Rest Timer:</span>
                  <span className="font-mono text-base font-black text-neon-orange">
                    {Math.floor(restTimerSeconds / 60)}:{String(restTimerSeconds % 60).padStart(2, "0")}
                  </span>
                  <div className="flex gap-1.5 ml-1">
                    <button
                      onClick={() => {
                        setRestTimerSeconds(60);
                        setRestTimerActive(true);
                      }}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-300"
                    >
                      60s
                    </button>
                    <button
                      onClick={() => {
                        setRestTimerSeconds(90);
                        setRestTimerActive(true);
                      }}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-300"
                    >
                      90s
                    </button>
                    <button
                      onClick={() => setRestTimerActive(false)}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Workout Logger Interactive Table */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-neon-orange" /> Today's Session: Push A (Chest, Shoulders, Triceps)
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-400">Coach Sarah Connor Protocol</span>
                </div>

                <div className="space-y-4">
                  {activeExercises.map((ex, exIdx) => (
                    <div key={exIdx} className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">{ex.name}</span>
                        <span className="text-[10px] text-zinc-500">Target: 3-4 Sets · RPE 8.5</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {ex.sets.map((s: any, sIdx: number) => (
                          <div key={sIdx} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60">
                            <span className="font-mono text-zinc-400">Set {sIdx + 1}</span>
                            <span className="font-bold text-white">{s.weightKg} kg</span>
                            <span className="text-zinc-300">{s.reps} reps</span>
                            <button
                              onClick={() => {
                                setRestTimerSeconds(90);
                                setRestTimerActive(true);
                                showToast("Set completed! Rest timer started (90s).");
                              }}
                              className="px-2.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-[10px]"
                            >
                              ✓ Done
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    showToast("Workout session saved! (+150 XP recorded to profile)");
                  }}
                  className="w-full py-3 rounded-xl bg-neon-orange hover:bg-orange-600 text-white font-black text-xs transition"
                >
                  Complete & Save Workout (+150 XP)
                </button>
              </div>

              {/* Personal Records (PRs) */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" /> Personal Records (PRs) & Progressive Overload
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {workoutsData?.personalRecords?.map((pr: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                      <span className="text-zinc-400 block truncate">{pr.exercise}</span>
                      <div className="text-lg font-black text-white mt-1">{pr.weightKg} kg</div>
                      <span className="text-[10px] text-neon-orange font-bold">{pr.reps} Reps max</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NUTRITION & MACROS */}
          {activeTab === "NUTRITION" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Diet Plan & Nutrition Tracker</h3>
                  <p className="text-xs text-zinc-400">{nutritionData?.activePlan?.name || "High Protein Athletic Clean Bulk"}</p>
                </div>
                <button
                  onClick={() => setShowBarcodeScanner(true)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" /> Scan Barcode
                </button>
              </div>

              {/* Meal Protocol Items */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <h4 className="text-sm font-bold text-white">Daily Meal Schedule</h4>
                <div className="space-y-3">
                  {nutritionData?.activePlan?.meals?.map((m: any, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{m.meal}</span>
                          <span className="text-[10px] font-mono text-zinc-500">({m.time})</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{m.items?.join(" · ")}</p>
                      </div>
                      <div className="text-right text-xs">
                        <span className="font-bold text-neon-orange">{m.calories} kcal</span>
                        <div className="text-[10px] text-zinc-500">{m.protein}g P · {m.carbs}g C · {m.fats}g F</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Meal Recommendations */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-neon-orange" /> PulseAI Nutrition Recommendations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {nutritionData?.aiMealSuggestions?.map((s: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-xs">
                      <h5 className="font-bold text-white mb-1">{s.title}</h5>
                      <p className="text-zinc-400 leading-relaxed text-[11px]">{s.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BODY PROGRESS & TIMELINE */}
          {activeTab === "PROGRESS" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div>
                <h3 className="text-lg font-bold text-white">Body Recomposition & Metric History</h3>
                <p className="text-xs text-zinc-400">Weight, BMI, body fat percentage, and physique timeline</p>
              </div>

              {/* Progress Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                  <span className="text-xs text-zinc-400">Current Weight</span>
                  <div className="text-2xl font-black text-white mt-1">{progressData?.summary?.currentWeight || 78.5} kg</div>
                  <span className="text-[10px] text-emerald-400 font-bold">-4.0 kg since Day 1</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                  <span className="text-xs text-zinc-400">Body Fat %</span>
                  <div className="text-2xl font-black text-neon-orange mt-1">{progressData?.summary?.bodyFatPct || 14.2}%</div>
                  <span className="text-[10px] text-emerald-400 font-bold">-4.3% reduction</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                  <span className="text-xs text-zinc-400">Target Goal</span>
                  <div className="text-2xl font-black text-white mt-1">{progressData?.summary?.targetWeight || 75.0} kg</div>
                  <span className="text-[10px] text-zinc-400">3.5 kg remaining</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                  <span className="text-xs text-zinc-400">Calculated BMI</span>
                  <div className="text-2xl font-black text-cyan-400 mt-1">{progressData?.summary?.bmi || 24.2}</div>
                  <span className="text-[10px] text-zinc-400">Optimal Athletic Range</span>
                </div>
              </div>

              {/* Progress Trend Chart */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="text-sm font-bold text-white mb-4">Body Weight & Fat % Trend</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData?.history || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222533" />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#161822", border: "1px solid #27272a", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
                      <Line type="monotone" dataKey="weightKg" stroke="#ff5500" strokeWidth={2} name="Weight (kg)" />
                      <Line type="monotone" dataKey="bodyFatPct" stroke="#00f0ff" strokeWidth={2} name="Body Fat %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Photo Timeline */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="text-sm font-bold text-white mb-4">Physique Progress Timeline</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {progressData?.photos?.map((photo: any, i: number) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
                      <img src={photo.url} alt={photo.label} className="w-full h-56 object-cover" />
                      <div className="p-3 text-xs">
                        <span className="font-bold text-white block">{photo.label}</span>
                        <span className="text-[10px] text-zinc-500">{photo.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLASSES */}
          {activeTab === "CLASSES" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div>
                <h3 className="text-lg font-bold text-white">Browse & Book Group Classes</h3>
                <p className="text-xs text-zinc-400">HIIT, CrossFit, Sunrise Yoga, Boxing & Zumba</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classesData.map((cls) => (
                  <div key={cls.id} className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-zinc-800 text-neon-orange border border-zinc-700">
                          {cls.category}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">{cls.durationMinutes} mins</span>
                      </div>
                      <h4 className="text-base font-bold text-white mb-1">{cls.name}</h4>
                      <p className="text-xs text-zinc-400 mb-3">{cls.description}</p>

                      <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Instructor:</span>
                          <span className="font-bold text-white">{cls.trainerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Location:</span>
                          <span className="text-zinc-300">{cls.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Availability:</span>
                          <span className="text-emerald-400 font-bold">{cls.availableSpots} spots left</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800">
                      {cls.isBooked ? (
                        <button
                          onClick={() => handleToggleClassBooking(cls.id, true)}
                          className="w-full py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 font-bold text-xs"
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleClassBooking(cls.id, false)}
                          className="w-full py-2.5 rounded-xl bg-neon-orange hover:bg-orange-600 text-white font-bold text-xs"
                        >
                          Book Seat
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: TRAINER & LIVE CHAT */}
          {activeTab === "TRAINER" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assigned Coach Profile Card */}
                <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <img
                        src="https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400"
                        alt="Coach"
                        className="w-16 h-16 rounded-2xl border border-neon-orange object-cover"
                      />
                      <div>
                        <h4 className="text-base font-bold text-white">Sarah Connor</h4>
                        <span className="text-xs text-neon-orange font-semibold">Lead CrossFit & Strength</span>
                        <div className="text-xs text-yellow-400 mt-0.5">★ 4.95 (48 reviews)</div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                      Assigned 1-on-1 coach. Manages your 6-Day PPL split and nutrition protocols.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      showToast("1-on-1 PT Session requested with Coach Sarah Connor!");
                    }}
                    className="w-full py-2.5 rounded-xl bg-neon-orange text-white font-black text-xs"
                  >
                    Book 1-on-1 Session ($65)
                  </button>
                </div>

                {/* In-App Live Messaging View */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col h-[500px]">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                    <span className="font-bold text-xs text-white">Chat with Coach Sarah Connor</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Online
                    </span>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                    {chatMessages.map((m) => (
                      <div key={m.id} className={`flex ${m.isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl leading-relaxed ${
                            m.isMe
                              ? "bg-neon-orange text-white rounded-br-none"
                              : "bg-zinc-800 text-zinc-200 rounded-bl-none"
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input Form */}
                  <form onSubmit={handleSendMessage} className="pt-3 border-t border-zinc-800 flex gap-2">
                    <input
                      type="text"
                      placeholder="Message your coach..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-neon-orange"
                    />
                    <button type="submit" className="p-2.5 rounded-xl bg-neon-orange text-white">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: COMMUNITY & CHALLENGES */}
          {activeTab === "COMMUNITY" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Leaderboard Banner */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" /> Gym-wide Leaderboard (Top Athletes)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {challengesData?.leaderboard?.slice(0, 3).map((lead: any) => (
                    <div key={lead.id} className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-sm text-yellow-400">#{lead.rank}</span>
                        <img src={lead.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-zinc-700" />
                        <div>
                          <strong className="text-white block">{lead.name}</strong>
                          <span className="text-[10px] text-zinc-500">Lvl {lead.level}</span>
                        </div>
                      </div>
                      <span className="font-bold text-neon-orange">{lead.xp} XP</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Challenges */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-neon-orange" /> Monthly Fitness Challenges
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {challengesData?.challenges?.map((ch: any) => (
                    <div key={ch.id} className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
                          +{ch.rewardXp} XP Reward
                        </span>
                        <h5 className="font-bold text-white text-xs mt-2 mb-1">{ch.title}</h5>
                        <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">{ch.description}</p>
                      </div>
                      <button
                        onClick={() => showToast(`Joined "${ch.title}" challenge!`)}
                        className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-neon-orange border border-neon-orange/40"
                      >
                        Join Challenge ({ch.participantsCount} active)
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Social Feed */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <h4 className="text-sm font-bold text-white">Athlete Social Wall</h4>
                <div className="space-y-3">
                  {communityPosts.map((post) => (
                    <div key={post.id} className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-2">
                      <div className="flex items-center gap-2.5">
                        <img src={post.authorAvatar} alt="Author" className="w-8 h-8 rounded-full border border-zinc-700" />
                        <div>
                          <strong className="text-white">{post.authorName}</strong>
                          <span className="text-[10px] text-zinc-500 block">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-zinc-200">{post.content}</p>
                      {post.workoutDetails && (
                        <div className="p-2 rounded-xl bg-zinc-900 text-neon-orange font-mono text-[11px]">
                          ⚡ {post.workoutDetails}
                        </div>
                      )}
                      <div className="pt-2 flex items-center gap-4 text-zinc-400 text-[11px]">
                        <span className="flex items-center gap-1 text-red-400 font-bold">
                          <Heart className="w-3.5 h-3.5 fill-red-400" /> {post.likesCount} Likes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: MEMBERSHIP & PAYMENTS */}
          {activeTab === "PAYMENTS" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Membership Status & Billing</h3>
                  <p className="text-xs text-zinc-400">View current plan, auto-pay settings, and download past receipts</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlanForPayment(paymentsData?.availablePlans?.[0]);
                    setShowPaymentModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-neon-orange text-white font-black text-xs shadow-lg"
                >
                  Renew / Upgrade Plan
                </button>
              </div>

              {/* Current Active Plan Card */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Active Membership
                  </span>
                  <h4 className="text-2xl font-black text-white mt-1">{membership.planName || "Annual Elite VIP"}</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Valid through <strong className="text-white">{new Date(membership.endDate || "2027-01-01").toLocaleDateString()}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-neon-orange">${membership.price || 399}</span>
                  <span className="text-xs text-zinc-400 block">Auto-pay Active</span>
                </div>
              </div>

              {/* Past Invoices */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="text-sm font-bold text-white mb-3">Invoice History</h4>
                <div className="space-y-2 text-xs">
                  {paymentsData?.invoices?.map((inv: any) => (
                    <div key={inv.id} className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-white">{inv.invoiceNumber}</span>
                        <p className="text-[10px] text-zinc-500">{new Date(inv.createdAt).toLocaleDateString()} · {inv.method}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white">${inv.amount}</span>
                        <span className="text-emerald-400 text-[10px] block font-bold">PAID</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: PULSEAI COACH ASSISTANT */}
          {activeTab === "AI_COACH" && (
            <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[600px] p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">PulseAI Intelligent Fitness Coach</h4>
                  <p className="text-xs text-zinc-400">Biomechanics, form cues, injury prevention & macro advice</p>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-xs">
                {aiConversation.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl leading-relaxed whitespace-pre-line ${
                        msg.role === "user"
                          ? "bg-neon-orange text-white rounded-br-none"
                          : "bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                      PulseAI is analyzing your fitness request...
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleAskAI} className="pt-3 border-t border-zinc-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about bench press form, nutrition, or workout modifications..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-neon-orange"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-5 py-3 rounded-xl bg-neon-orange text-white font-bold text-xs"
                >
                  Ask AI
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 px-2 py-2 flex items-center justify-around z-40">
        {[
          { id: "HOME", label: "Home", icon: Activity },
          { id: "WORKOUTS", label: "Workout", icon: Dumbbell },
          { id: "NUTRITION", label: "Diet", icon: Apple },
          { id: "CLASSES", label: "Classes", icon: Calendar },
          { id: "AI_COACH", label: "AI Coach", icon: Bot },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as MemberTab)}
              className={`flex flex-col items-center gap-1 p-1.5 ${isActive ? "text-neon-orange" : "text-zinc-500"}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* PAYMENT & RENEWAL MODAL (STRIPE TEST & UPI) */}
      {showPaymentModal && selectedPlanForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl p-6 glass-panel border border-neon-orange/40 shadow-2xl relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-1">Renew / Upgrade Pass</h3>
            <p className="text-xs text-zinc-400 mb-4">{selectedPlanForPayment.name}</p>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">Total Due:</span>
                <span className="text-xl font-black text-white">${selectedPlanForPayment.price}</span>
              </div>

              {/* Coupon input */}
              <div>
                <label className="block text-zinc-400 mb-1">Apply Coupon (e.g. SUMMER20 / IRON50)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="SUMMER20"
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono uppercase"
                  />
                  <button
                    onClick={() => showToast(`Coupon ${couponCode} validated!`)}
                    className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-200 font-bold"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Payment Method Switcher */}
              <div>
                <label className="block text-zinc-400 mb-1.5">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod("STRIPE")}
                    className={`p-3 rounded-xl border text-center font-bold ${
                      paymentMethod === "STRIPE"
                        ? "bg-neon-orange/20 border-neon-orange text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    Stripe (Test Mode)
                  </button>
                  <button
                    onClick={() => setPaymentMethod("UPI")}
                    className={`p-3 rounded-xl border text-center font-bold ${
                      paymentMethod === "UPI"
                        ? "bg-neon-orange/20 border-neon-orange text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    UPI / Razorpay
                  </button>
                </div>
              </div>

              {paymentSuccessMsg ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold text-center">
                  {paymentSuccessMsg}
                </div>
              ) : (
                <button
                  onClick={handleProcessPayment}
                  className="w-full py-3 rounded-xl bg-neon-orange hover:bg-orange-600 text-white font-black text-xs mt-2"
                >
                  Confirm & Pay with {paymentMethod}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BARCODE SCANNER CAMERA PLACEHOLDER MODAL */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 glass-panel border border-zinc-700 shadow-2xl relative text-center">
            <button
              onClick={() => setShowBarcodeScanner(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <Camera className="w-12 h-12 text-neon-orange mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">Food Barcode Scanner</h4>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              Point your camera at food packaging barcode to automatically log calories and macros.
            </p>
            <div className="w-full h-44 rounded-2xl bg-zinc-950 border border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 text-xs font-mono">
              [Camera Feed Active: Scanning 1D/2D Barcode...]
            </div>
            <button
              onClick={() => {
                setShowBarcodeScanner(false);
                showToast("Scanned: Optimum Nutrition Whey Isolate (120 kcal, 24g P logged)");
              }}
              className="w-full py-2.5 rounded-xl bg-neon-orange text-white font-bold text-xs mt-4"
            >
              Simulate Barcode Detect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
