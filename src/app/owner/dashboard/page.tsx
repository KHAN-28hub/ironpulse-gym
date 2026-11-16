"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { NavbarControls } from "@/components/NavbarControls";
import {
  ShieldCheck,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  Settings,
  Bell,
  LogOut,
  QrCode,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  PauseCircle,
  PlayCircle,
  Trash2,
  Edit,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Dumbbell,
  Sparkles,
  Award,
  Zap,
  Flame,
  FileText,
  Mail,
  MessageSquare,
  Wrench,
  Lock,
  ChevronRight,
  RefreshCw,
  Building,
  Eye,
  Camera,
  X,
  Send,
  PieChart,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type OwnerTab =
  | "OVERVIEW"
  | "MEMBERS"
  | "PLANS"
  | "BILLING"
  | "ATTENDANCE"
  | "TRAINERS"
  | "CLASSES"
  | "EQUIPMENT"
  | "MARKETING"
  | "SETTINGS";

export default function OwnerDashboard() {
  const router = useRouter();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<OwnerTab>("OVERVIEW");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Data states
  const [statsData, setStatsData] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [plansData, setPlansData] = useState<any>(null);
  const [billingData, setBillingData] = useState<any>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [trainersData, setTrainersData] = useState<any>(null);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [equipmentData, setEquipmentData] = useState<any>(null);
  const [lockersData, setLockersData] = useState<any[]>([]);
  const [marketingData, setMarketingData] = useState<any>(null);

  // Filters & Search
  const [memberSearch, setMemberSearch] = useState("");
  const [memberStatusFilter, setMemberStatusFilter] = useState("ALL");
  const [selectedBranchId, setSelectedBranchId] = useState("");

  // Modals
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState<any>(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showMemberDetailsModal, setShowMemberDetailsModal] = useState<any>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scannerInput, setScannerInput] = useState("IP-MBR-0001-ALEX");
  const [toastMessage, setToastMessage] = useState("");

  // Form states for new member
  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "O+",
    emergencyContact: "",
    healthNotes: "",
    idProofNumber: "",
    gender: "MALE",
  });

  // Form state for new expense
  const [newExpenseForm, setNewExpenseForm] = useState({
    title: "",
    category: "Rent",
    amount: "",
    vendor: "",
  });

  // Form state for new class
  const [newClassForm, setNewClassForm] = useState({
    name: "",
    category: "HIIT",
    durationMinutes: "60",
    capacity: "20",
    location: "Studio Alpha",
  });

  // Fetch initial data
  const loadAllData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.authenticated || meData.user.role !== "OWNER") {
        router.push("/");
        return;
      }
      setCurrentUser(meData.user);

      // Load Stats
      const statsRes = await fetch(`/api/owner/stats${selectedBranchId ? `?branchId=${selectedBranchId}` : ""}`);
      const sData = await statsRes.json();
      setStatsData(sData);

      // Load Members
      const membersRes = await fetch(`/api/owner/members?search=${memberSearch}&status=${memberStatusFilter}`);
      const mData = await membersRes.json();
      setMembers(mData.members || []);

      // Load Plans
      const plansRes = await fetch("/api/owner/plans");
      const pData = await plansRes.json();
      setPlansData(pData);

      // Load Billing
      const billRes = await fetch("/api/owner/billing");
      const bData = await billRes.json();
      setBillingData(bData);

      // Load Attendance
      const attRes = await fetch("/api/owner/attendance");
      const aData = await attRes.json();
      setAttendanceLogs(aData.attendances || []);

      // Load Trainers
      const trRes = await fetch("/api/owner/trainers");
      const trData = await trRes.json();
      setTrainersData(trData);

      // Load Classes
      const clsRes = await fetch("/api/owner/classes");
      const clsData = await clsRes.json();
      setClassesData(clsData.classes || []);

      // Load Equipment
      const eqRes = await fetch("/api/owner/equipment");
      const eqData = await eqRes.json();
      setEquipmentData(eqData);

      // Load Lockers
      const lkRes = await fetch("/api/owner/lockers");
      const lkData = await lkRes.json();
      setLockersData(lkData.lockers || []);

      // Load Marketing
      const mktRes = await fetch("/api/owner/marketing");
      const mktData = await mktRes.json();
      setMarketingData(mktData);
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedBranchId, memberStatusFilter]);

  // Handle Search Member debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/owner/members?search=${encodeURIComponent(memberSearch)}&status=${memberStatusFilter}`)
        .then((r) => r.json())
        .then((data) => setMembers(data.members || []));
    }, 300);
    return () => clearTimeout(timer);
  }, [memberSearch]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  // Member CRUD Actions
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/owner/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMemberForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowAddMemberModal(false);
      showToast("New member successfully registered and starter plan assigned!");
      loadAllData();
      setNewMemberForm({
        name: "",
        email: "",
        phone: "",
        bloodGroup: "O+",
        emergencyContact: "",
        healthNotes: "",
        idProofNumber: "",
        gender: "MALE",
      });
    } catch (err: any) {
      alert(err.message || "Failed to create member");
    }
  };

  const handleFreezeMember = async (memberId: string) => {
    await fetch("/api/owner/members", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, action: "FREEZE", freezeReason: "Medical recovery / travel" }),
    });
    showToast("Membership paused/frozen successfully.");
    loadAllData();
  };

  const handleResumeMember = async (memberId: string) => {
    await fetch("/api/owner/members", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, action: "RESUME" }),
    });
    showToast("Membership resumed to ACTIVE status.");
    loadAllData();
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to permanently delete this member record?")) return;
    await fetch(`/api/owner/members?memberId=${memberId}`, { method: "DELETE" });
    showToast("Member record removed.");
    loadAllData();
  };

  // QR Attendance Check-in Simulator
  const handleScanQr = async (codeToScan?: string) => {
    const code = codeToScan || scannerInput;
    try {
      const res = await fetch("/api/owner/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: code, method: "QR", action: "TOGGLE" }),
      });
      const data = await res.json();
      setScanResult(data);
      if (res.ok) {
        showToast(data.message);
        loadAllData();
      }
    } catch (e) {
      setScanResult({ accessGranted: false, message: "Error communicating with turnstile scanner" });
    }
  };

  // Add Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/owner/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADD_EXPENSE", ...newExpenseForm }),
    });
    setShowAddExpenseModal(false);
    showToast("Expense logged successfully.");
    loadAllData();
    setNewExpenseForm({ title: "", category: "Rent", amount: "", vendor: "" });
  };

  // Add Class
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/owner/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClassForm),
    });
    setShowAddClassModal(false);
    showToast("New fitness class scheduled!");
    loadAllData();
    setNewClassForm({ name: "", category: "HIIT", durationMinutes: "60", capacity: "20", location: "Studio Alpha" });
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!members.length) return;
    const headers = "Name,Email,Phone,QR_Code,Status,Plan,Streak,XP\n";
    const rows = members
      .map(
        (m) =>
          `"${m.name}","${m.email}","${m.phone || ""}","${m.qrCode}","${m.membership?.status || "NONE"}","${
            m.membership?.planName || ""
          }",${m.streak},${m.xp}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `IronPulse_Members_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    showToast("CSV export generated and downloaded.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-neon-lime border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
          Loading IronPulse Boss HQ...
        </p>
      </div>
    );
  }

  const metrics = statsData?.metrics || {};

  return (
    <div className="min-h-screen bg-[#08090d] text-white flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900 border border-neon-lime text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-neon-lime" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neon-lime flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(204,255,0,0.3)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight font-sans">
                IRON<span className="text-neon-lime">PULSE</span> BOSS HQ
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neon-lime/15 text-neon-lime border border-neon-lime/30">
                OWNER PANEL
              </span>
            </div>
            {/* Multi-Branch Switcher */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Building className="w-3 h-3 text-neon-lime" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-zinc-200 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {statsData?.branches?.map((b: any) => (
                  <option key={b.id} value={b.id} className="bg-zinc-900 text-white">
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Occupancy Ticker & Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Live Attendance Scanner Quick Button */}
          <button
            onClick={() => {
              setScanResult(null);
              setShowQrScannerModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neon-lime/10 hover:bg-neon-lime/20 border border-neon-lime/40 text-neon-lime text-xs font-bold transition shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">QR Check-in Scanner</span>
          </button>

          {/* Live headcount pulse */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-lime opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-lime"></span>
            </span>
            <span className="text-zinc-400 hidden md:inline">Floor:</span>
            <span className="font-bold text-neon-lime">{metrics.liveHeadcount || 18} Live</span>
          </div>

          <NavbarControls />

          {/* Profile & Logout */}
          <div className="flex items-center gap-2 border-l border-zinc-800 pl-3 sm:pl-4">
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-zinc-700"
            />
            <div className="hidden lg:block text-left text-xs">
              <p className="font-bold text-white">{currentUser?.name}</p>
              <p className="text-zinc-500 text-[10px]">Boss / Owner</p>
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

      {/* Main Body with Sidebar Navigation */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside className="w-16 sm:w-60 border-r border-zinc-800/80 bg-zinc-950/60 p-3 sm:p-4 flex flex-col justify-between shrink-0">
          <nav className="space-y-1.5">
            {[
              { id: "OVERVIEW", label: "Business Dashboard", icon: Activity },
              { id: "MEMBERS", label: "Member Management", icon: Users },
              { id: "PLANS", label: "Plans & Pricing", icon: Award },
              { id: "BILLING", label: "Billing & Invoices", icon: DollarSign },
              { id: "ATTENDANCE", label: "Attendance Logs", icon: Clock },
              { id: "TRAINERS", label: "Trainers & Staff", icon: Sparkles },
              { id: "CLASSES", label: "Class Schedule", icon: Calendar },
              { id: "EQUIPMENT", label: "Equipment & Lockers", icon: Dumbbell },
              { id: "MARKETING", label: "Lead CRM & Marketing", icon: Flame },
              { id: "SETTINGS", label: "Gym Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as OwnerTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-neon-lime text-black font-black shadow-[0_0_15px_rgba(204,255,0,0.25)]"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden sm:block pt-4 border-t border-zinc-800/60 text-[11px] text-zinc-500">
            <p className="font-bold text-zinc-400">IronPulse Pro v2.0</p>
            <p>SQLite + RBAC Active</p>
          </div>
        </aside>

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW / EXECUTIVE DASHBOARD */}
          {activeTab === "OVERVIEW" && (
            <div className="space-y-6">
              {/* Top Banner KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-medium">Monthly Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">${metrics.revenueMonth?.toLocaleString() || "14,820"}</div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                    <TrendingUp className="w-3 h-3" /> +18.4% vs last month
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-medium">Active Members</span>
                    <Users className="w-4 h-4 text-neon-lime" />
                  </div>
                  <div className="text-2xl font-black text-white">{metrics.activeMembers || 36} <span className="text-sm font-normal text-zinc-500">/ {metrics.totalMembers || 50}</span></div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    {metrics.expiredMembers || 8} expired · {metrics.frozenMembers || 4} frozen
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-medium">Live Floor Occupancy</span>
                    <Activity className="w-4 h-4 text-neon-lime animate-pulse" />
                  </div>
                  <div className="text-2xl font-black text-neon-lime">{metrics.liveHeadcount || 18} <span className="text-xs text-zinc-500 font-normal">/ {metrics.capacity || 200} cap</span></div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    {Math.round(((metrics.liveHeadcount || 18) / (metrics.capacity || 200)) * 100)}% floor density
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-medium">Member Churn Rate</span>
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{metrics.churnRate || "16.0%"}</div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Industry benchmark: 28%
                  </div>
                </div>
              </div>

              {/* Peak Hours Heatmap & Revenue Trend Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly Attendance Flow */}
                <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-neon-lime" /> Peak Hours Attendance Heatmap
                      </h3>
                      <p className="text-xs text-zinc-400">Hourly foot traffic across gym gates</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      Peak: 17:00 - 20:00
                    </span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={statsData?.peakHours || []}>
                        <defs>
                          <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ccff00" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#ccff00" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222533" />
                        <XAxis dataKey="hour" stroke="#71717a" fontSize={10} tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: "#161822", border: "1px solid #27272a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                        />
                        <Area type="monotone" dataKey="count" stroke="#ccff00" strokeWidth={2} fillOpacity={1} fill="url(#hourGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Trainer Performance Leaderboard */}
                <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400" /> Trainer Performance & Ratings
                        </h3>
                        <p className="text-xs text-zinc-400">Coach client volume and ratings</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("TRAINERS")}
                        className="text-xs text-neon-lime hover:underline font-semibold"
                      >
                        View All Roster →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {statsData?.trainerLeaderboard?.slice(0, 4).map((trainer: any, idx: number) => (
                        <div key={trainer.id} className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={trainer.avatar} alt={trainer.name} className="w-10 h-10 rounded-xl border border-zinc-700 object-cover" />
                            <div>
                              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                {trainer.name}
                                {idx === 0 && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.2 rounded font-bold">TOP COACH</span>}
                              </h4>
                              <p className="text-[11px] text-zinc-400">{trainer.specialization}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                              <span className="text-yellow-400">★</span> {trainer.rating} <span className="text-zinc-500 text-[10px]">({trainer.reviewCount})</span>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">{trainer.classesCount} Classes/wk</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <span>Average Staff Satisfaction: <strong className="text-white">96.4%</strong></span>
                    <span>Total Payroll: <strong className="text-emerald-400">${(trainersData?.trainers?.reduce((a: any, t: any) => a + t.totalMonthlyPayout, 0) || 18500).toLocaleString()}/mo</strong></span>
                  </div>
                </div>
              </div>

              {/* Real-time People in Gym Floor Snapshot */}
              <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-lime opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-lime"></span>
                      </span>
                      Live Athletes Training on Floor Right Now ({statsData?.livePeople?.length || 18})
                    </h3>
                    <p className="text-xs text-zinc-400">Real-time gate check-ins with active duration</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("ATTENDANCE")}
                    className="text-xs text-neon-lime hover:underline font-semibold"
                  >
                    View Attendance History →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {statsData?.livePeople?.slice(0, 12).map((person: any) => (
                    <div key={person.id} className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col items-center text-center">
                      <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-full border border-neon-lime/40 mb-2 object-cover" />
                      <h4 className="text-xs font-bold text-white truncate w-full">{person.name}</h4>
                      <span className="text-[10px] font-mono text-neon-lime mt-0.5">{person.qrCode}</span>
                      <span className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" /> {person.streak}d streak
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEMBER MANAGEMENT */}
          {activeTab === "MEMBERS" && (
            <div className="space-y-6">
              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, or QR code..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon-lime"
                    />
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={memberStatusFilter}
                    onChange={(e) => setMemberStatusFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-neon-lime"
                  >
                    <option value="ALL">All Statuses ({members.length})</option>
                    <option value="ACTIVE">Active Members</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="FROZEN">Frozen / Paused</option>
                    <option value="PENDING">Pending Payment</option>
                  </select>
                </div>

                {/* Bulk Actions & Add Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCsv}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1.5"
                    title="Export Members to CSV / Excel"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-neon-lime hover:bg-lime-400 text-black text-xs font-black transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                  >
                    <Plus className="w-4 h-4" /> Add New Member
                  </button>
                </div>
              </div>

              {/* Members Table */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">Member</th>
                        <th className="p-4">QR / ID Code</th>
                        <th className="p-4">Membership Plan</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Streak & XP</th>
                        <th className="p-4">Emergency Contact</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {members.map((m) => {
                        const status = m.membership?.status || "PENDING";
                        return (
                          <tr key={m.id} className="hover:bg-zinc-800/40 transition">
                            <td className="p-4 flex items-center gap-3">
                              <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-full border border-zinc-700 object-cover" />
                              <div>
                                <div className="font-bold text-white hover:text-neon-lime cursor-pointer" onClick={() => setShowMemberDetailsModal(m)}>
                                  {m.name}
                                </div>
                                <div className="text-[11px] text-zinc-500">{m.email} · {m.phone || "No phone"}</div>
                              </div>
                            </td>
                            <td className="p-4 font-mono text-[11px] text-zinc-300">{m.qrCode}</td>
                            <td className="p-4">
                              <div className="font-semibold text-white">{m.membership?.planName || "No Plan"}</div>
                              <div className="text-[10px] text-zinc-500">Exp: {m.membership?.endDate ? new Date(m.membership.endDate).toLocaleDateString() : "N/A"}</div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  status === "ACTIVE"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                    : status === "EXPIRED"
                                    ? "bg-red-500/10 text-red-400 border-red-500/30"
                                    : status === "FROZEN"
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-white flex items-center gap-1">
                                <Flame className="w-3 h-3 text-orange-400" /> {m.streak} Days
                              </div>
                              <div className="text-[10px] text-zinc-400">{m.xp} XP (Lvl {m.level})</div>
                            </td>
                            <td className="p-4 text-[11px] text-zinc-400 max-w-[180px] truncate">
                              {m.emergencyContact || "Not provided"}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setShowMemberDetailsModal(m)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                                  title="View Full Profile & ID Proof"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {status === "ACTIVE" ? (
                                  <button
                                    onClick={() => handleFreezeMember(m.id)}
                                    className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
                                    title="Freeze / Pause Membership"
                                  >
                                    <PauseCircle className="w-3.5 h-3.5" />
                                  </button>
                                ) : status === "FROZEN" ? (
                                  <button
                                    onClick={() => handleResumeMember(m.id)}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                                    title="Resume Membership"
                                  >
                                    <PlayCircle className="w-3.5 h-3.5" />
                                  </button>
                                ) : null}
                                <button
                                  onClick={() => handleDeleteMember(m.id)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                  title="Delete Member"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLANS & PRICING */}
          {activeTab === "PLANS" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Membership Plans & Pricing</h3>
                  <p className="text-xs text-zinc-400">Configure tiers, durations, GST/tax rates, and perks</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plansData?.plans?.map((plan: any) => (
                  <div key={plan.id} className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between relative overflow-hidden group hover:border-zinc-700 transition">
                    {plan.badge && (
                      <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-neon-lime/20 text-neon-lime border border-neon-lime/40">
                        {plan.badge}
                      </span>
                    )}
                    <div>
                      <h4 className="text-xl font-black text-white mb-1">{plan.name}</h4>
                      <p className="text-xs text-zinc-400 mb-4">{plan.description}</p>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-black text-white">${plan.price}</span>
                        <span className="text-xs text-zinc-400">/ {plan.durationMonths === 1 ? "month" : `${plan.durationMonths} months`}</span>
                        <span className="text-[10px] text-zinc-500 ml-2">(+18% GST)</span>
                      </div>

                      <div className="space-y-2 py-4 border-t border-zinc-800 text-xs text-zinc-300">
                        {plan.features?.map((f: string, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-neon-lime shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                      <span>Subscribers: <strong className="text-white">{plan.subscriberCount || 16} Active</strong></span>
                      <span className="text-emerald-400 font-bold">Active Tier</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Coupons & Add-ons */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neon-lime" /> Active Promo Coupons & Discounts
                  </h4>
                  <div className="space-y-2.5">
                    {plansData?.coupons?.map((c: any) => (
                      <div key={c.code} className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-neon-lime bg-neon-lime/10 px-2 py-0.5 rounded border border-neon-lime/30">
                            {c.code}
                          </span>
                          <p className="text-xs text-zinc-400 mt-1">{c.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-white">{c.discountPct}% OFF</span>
                          <p className="text-[10px] text-zinc-500">{c.uses} redemptions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-cyan-400" /> Revenue Add-ons & Upsells
                  </h4>
                  <div className="space-y-2.5">
                    {plansData?.addOns?.map((a: any) => (
                      <div key={a.id} className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-white">{a.name}</h5>
                          <span className="text-[10px] text-zinc-500 uppercase">{a.category}</span>
                        </div>
                        <span className="text-sm font-black text-neon-lime">+${a.price}/mo</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BILLING & INVOICES */}
          {activeTab === "BILLING" && (
            <div className="space-y-6">
              {/* Financial KPI Banner */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-xs text-zinc-400">Total Revenue Collected</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    ${billingData?.summary?.totalRevenue?.toLocaleString() || "14,820"}
                  </div>
                  <span className="text-[10px] text-zinc-500">Stripe + UPI + Cash</span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-xs text-zinc-400">Total Operating Expenses</span>
                  <div className="text-2xl font-black text-red-400 mt-1">
                    ${billingData?.summary?.totalExpenses?.toLocaleString() || "11,300"}
                  </div>
                  <span className="text-[10px] text-zinc-500">Rent, utilities, payroll</span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-xs text-zinc-400">Net Profit (P&L)</span>
                  <div className="text-2xl font-black text-neon-lime mt-1">
                    ${billingData?.summary?.netProfit?.toLocaleString() || "3,520"}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Margin: {billingData?.summary?.profitMargin || "24%"}</span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-xs text-zinc-400">GST / Tax Collected (18%)</span>
                  <div className="text-2xl font-black text-white mt-1">
                    ${billingData?.summary?.totalTaxCollected?.toLocaleString() || "2,667"}
                  </div>
                  <span className="text-[10px] text-zinc-500">Remitted quarterly</span>
                </div>
              </div>

              {/* Invoices List & Expense Manager */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="text-base font-bold text-white">Invoices & Payment Records</h3>
                  <p className="text-xs text-zinc-400">Downloadable PDF receipts, tax compliance, and refunds</p>
                </div>
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Facility Expense
                </button>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">Invoice #</th>
                        <th className="p-4">Member</th>
                        <th className="p-4">Base Amount</th>
                        <th className="p-4">Tax (GST)</th>
                        <th className="p-4">Net Total</th>
                        <th className="p-4">Method</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {billingData?.invoices?.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-zinc-800/40 transition">
                          <td className="p-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{inv.memberName}</div>
                            <div className="text-[10px] text-zinc-500">{inv.memberEmail}</div>
                          </td>
                          <td className="p-4">${inv.amount}</td>
                          <td className="p-4 text-zinc-400">${inv.tax}</td>
                          <td className="p-4 font-bold text-white">${inv.netTotal}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 font-mono text-[10px]">
                              {inv.method}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                inv.status === "PAID"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : inv.status === "REFUNDED"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setShowInvoiceModal(inv)}
                                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-neon-lime flex items-center gap-1"
                              >
                                <FileText className="w-3 h-3" /> PDF View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ATTENDANCE HUB */}
          {activeTab === "ATTENDANCE" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Live Attendance & Check-in Hub</h3>
                  <p className="text-xs text-zinc-400">QR code scanner simulator, biometric gate records, and manual entry</p>
                </div>
                <button
                  onClick={() => setShowQrScannerModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-neon-lime hover:bg-lime-400 text-black text-xs font-black transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                >
                  <QrCode className="w-4 h-4" /> Open Turnstile Scanner
                </button>
              </div>

              {/* Attendance Logs Table */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">Member</th>
                        <th className="p-4">QR Code</th>
                        <th className="p-4">Check-In Time</th>
                        <th className="p-4">Check-Out Time</th>
                        <th className="p-4">Method</th>
                        <th className="p-4">Gate Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {attendanceLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-800/40 transition">
                          <td className="p-4 flex items-center gap-3">
                            <img src={log.avatar} alt={log.name} className="w-8 h-8 rounded-full border border-zinc-700 object-cover" />
                            <div>
                              <div className="font-bold text-white">{log.name}</div>
                              <div className="text-[10px] text-zinc-500">{log.email}</div>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-neon-lime">{log.qrCode}</td>
                          <td className="p-4 text-zinc-200">
                            {new Date(log.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            <span className="text-[10px] text-zinc-500 ml-1.5">({new Date(log.checkInTime).toLocaleDateString()})</span>
                          </td>
                          <td className="p-4 text-zinc-400">
                            {log.checkOutTime
                              ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : <span className="text-neon-lime font-bold">Currently On Floor</span>}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono">
                              {log.method}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.status === "IN"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-zinc-800 text-zinc-400"
                              }`}
                            >
                              {log.status === "IN" ? "INSIDE" : "CHECKED OUT"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TRAINERS & STAFF */}
          {activeTab === "TRAINERS" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Trainer Roster & Payroll Management</h3>
                <p className="text-xs text-zinc-400">Specialties, client volumes, shift schedules, and commission calculators</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainersData?.trainers?.map((trainer: any) => (
                  <div key={trainer.id} className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3.5 mb-4">
                        <img src={trainer.avatar} alt={trainer.name} className="w-14 h-14 rounded-2xl border border-zinc-700 object-cover" />
                        <div>
                          <h4 className="text-sm font-bold text-white">{trainer.name}</h4>
                          <span className="text-[11px] text-neon-lime font-semibold">{trainer.specialization}</span>
                          <div className="flex items-center gap-1 text-xs text-yellow-400 mt-0.5">
                            ★ {trainer.rating} <span className="text-zinc-500 text-[10px]">({trainer.reviewCount} reviews)</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">
                        {trainer.bio}
                      </p>

                      <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Shift Hours:</span>
                          <span className="text-white font-medium">{trainer.shift}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Assigned Clients:</span>
                          <span className="text-white font-bold">{trainer.assignedClientsCount} athletes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Base Salary:</span>
                          <span className="text-white">${trainer.salary}/mo</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">PT Commissions:</span>
                          <span className="text-emerald-400">+${trainer.monthlyCommissions}/mo</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-semibold">Total Payout:</span>
                      <span className="text-base font-black text-neon-lime">${trainer.totalMonthlyPayout}/mo</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Staff Roster */}
              <div className="pt-4">
                <h4 className="text-sm font-bold text-white mb-3">Facility Staff & Shifts</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trainersData?.staff?.map((st: any) => (
                    <div key={st.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-xs font-bold text-white">{st.name}</h5>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${st.status === "ON_DUTY" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                          {st.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">{st.role}</p>
                      <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                        <span>{st.shift}</span>
                        <span className="font-bold text-white">${st.monthlySalary}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CLASS SCHEDULE */}
          {activeTab === "CLASSES" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Class & Group Fitness Schedule</h3>
                  <p className="text-xs text-zinc-400">Manage studio timetable, capacity caps, waitlists, and coaches</p>
                </div>
                <button
                  onClick={() => setShowAddClassModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-neon-lime hover:bg-lime-400 text-black text-xs font-black transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                >
                  <Plus className="w-4 h-4" /> Schedule New Class
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classesData.map((cls) => (
                  <div key={cls.id} className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-zinc-800 text-neon-lime border border-zinc-700">
                          {cls.category}
                        </span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" /> {cls.durationMinutes} mins
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mb-1">{cls.name}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-4">{cls.description}</p>

                      <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Instructor:</span>
                          <span className="font-bold text-white">{cls.trainerName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Location:</span>
                          <span className="text-zinc-300">{cls.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Booked Seats:</span>
                          <span className="font-bold text-neon-lime">{cls.confirmedCount} / {cls.capacity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">{cls.availableSpots} spots left</span>
                      {cls.waitlistCount > 0 && (
                        <span className="text-yellow-400 font-bold">{cls.waitlistCount} Waitlisted</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: EQUIPMENT & LOCKERS */}
          {activeTab === "EQUIPMENT" && (
            <div className="space-y-6">
              {/* Locker Management Grid */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-neon-lime" /> Visual Locker Management Grid (25 Lockers)
                    </h3>
                    <p className="text-xs text-zinc-400">Live occupation map across Downtown Flagship locker rooms</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Occupied</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Maintenance</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
                  {lockersData.map((locker) => (
                    <div
                      key={locker.id}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition hover:scale-105 ${
                        locker.status === "AVAILABLE"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : locker.status === "OCCUPIED"
                          ? "bg-red-500/10 border-red-500/40 text-red-400"
                          : "bg-yellow-500/10 border-yellow-500/40 text-yellow-400"
                      }`}
                      title={locker.assignedMemberName ? `Assigned to: ${locker.assignedMemberName}` : "Available for assignment"}
                    >
                      <Lock className="w-4 h-4 mb-1" />
                      <span className="font-mono font-bold text-xs">#{locker.number}</span>
                      <span className="text-[9px] uppercase tracking-wider mt-0.5 truncate max-w-full">
                        {locker.status === "OCCUPIED" ? "Taken" : locker.status === "AVAILABLE" ? "Free" : "Fix"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment Inventory Table */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-neon-lime" /> Commercial Equipment & Maintenance Schedule
                    </h3>
                    <p className="text-xs text-zinc-400">Track service schedules, safety inspections, and repair logs</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipmentData?.equipment?.map((eq: any) => (
                    <div key={eq.id} className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{eq.name}</h4>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{eq.category}</span>
                        <p className="text-[10px] text-zinc-500 mt-1">
                          Next Service Due: <strong className="text-zinc-300">{new Date(eq.nextServiceDue).toLocaleDateString()}</strong>
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          eq.status === "FUNCTIONAL"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                        }`}
                      >
                        {eq.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supplements Stock */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <h3 className="text-base font-bold text-white mb-4">Pro Shop & Supplement Inventory</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {equipmentData?.supplements?.map((item: any) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-white">{item.name}</h5>
                        <p className="text-[10px] text-zinc-400">${item.unitPrice} retail</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-white">{item.inStock} units</span>
                        <p className={`text-[10px] font-bold ${item.status === "LOW_STOCK" ? "text-orange-400" : "text-emerald-400"}`}>
                          {item.status === "LOW_STOCK" ? "Low Stock Alert" : "In Stock"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: MARKETING & LEAD CRM */}
          {activeTab === "MARKETING" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Lead CRM & Automated Growth Engine</h3>
                <p className="text-xs text-zinc-400">Enquiry pipeline, WhatsApp/SMS campaigns, and birthday retention automations</p>
              </div>

              {/* Lead Pipeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {["ENQUIRY", "TRIAL_BOOKED", "CONVERTED", "LOST"].map((stage) => {
                  const stageLeads = marketingData?.leads?.filter((l: any) => l.status === stage) || [];
                  return (
                    <div key={stage} className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{stage.replace("_", " ")}</h4>
                        <span className="text-xs font-black text-neon-lime">{stageLeads.length}</span>
                      </div>
                      <div className="space-y-2.5">
                        {stageLeads.map((lead: any) => (
                          <div key={lead.id} className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 text-xs">
                            <h5 className="font-bold text-white">{lead.name}</h5>
                            <p className="text-[11px] text-zinc-400">{lead.phone}</p>
                            <span className="text-[10px] text-neon-lime bg-neon-lime/10 px-1.5 py-0.2 rounded mt-1 inline-block">
                              Source: {lead.source}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Automations */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="text-sm font-bold text-white mb-3">Retention & Birthday Automations</h4>
                <div className="space-y-3">
                  {marketingData?.automations?.map((auto: any) => (
                    <div key={auto.id} className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-white">{auto.name}</h5>
                        <p className="text-xs text-zinc-400 mt-0.5">{auto.action}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {auto.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === "SETTINGS" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-base font-bold text-white">Gym Settings & Brand Identity</h3>
                <p className="text-xs text-zinc-400">Facility profile, operating timings, tax identification, and RBAC rules</p>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4 text-xs">
                <h4 className="text-sm font-bold text-white">Facility Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">Gym Name</label>
                    <input type="text" defaultValue="IronPulse Fitness Downtown" className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">GSTIN / Tax Registration Number</label>
                    <input type="text" defaultValue="GSTIN-36AAACI1234F1Z5" className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Weekday Operating Hours</label>
                    <input type="text" defaultValue="05:30 AM - 11:00 PM" className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Weekend Operating Hours</label>
                    <input type="text" defaultValue="07:00 AM - 09:00 PM" className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => showToast("Gym profile & operating timings updated.")}
                    className="px-4 py-2.5 rounded-xl bg-neon-lime text-black font-black"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: QR ATTENDANCE SCANNER SIMULATOR */}
      {showQrScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl p-6 glass-panel border border-neon-lime/40 shadow-2xl relative">
            <button
              onClick={() => setShowQrScannerModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-neon-lime/10 border border-neon-lime flex items-center justify-center text-neon-lime mx-auto mb-3 shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">Live Turnstile QR Scanner</h3>
              <p className="text-xs text-zinc-400">Simulate member barcode/QR scan at the front desk</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Member QR Code String
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannerInput}
                    onChange={(e) => setScannerInput(e.target.value)}
                    placeholder="e.g. IP-MBR-0001-ALEX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm font-mono text-white focus:outline-none focus:border-neon-lime"
                  />
                  <button
                    onClick={() => handleScanQr()}
                    className="px-4 py-2.5 rounded-xl bg-neon-lime text-black font-black text-xs shrink-0"
                  >
                    Simulate Scan
                  </button>
                </div>
              </div>

              {/* Quick Select Preset Members */}
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1.5 font-bold">
                  Quick Test Profiles
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      setScannerInput("IP-MBR-0001-ALEX");
                      handleScanQr("IP-MBR-0001-ALEX");
                    }}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left"
                  >
                    <p className="font-bold text-white">Alex Rivera</p>
                    <p className="text-[10px] text-emerald-400">Active VIP Member</p>
                  </button>
                  <button
                    onClick={() => {
                      setScannerInput("IP-MBR-1035-HARPER");
                      handleScanQr("IP-MBR-1035-HARPER");
                    }}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left"
                  >
                    <p className="font-bold text-white">Harper Wilson</p>
                    <p className="text-[10px] text-red-400">Expired Member</p>
                  </button>
                </div>
              </div>

              {/* Scan Feedback Result */}
              {scanResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs ${
                    scanResult.accessGranted
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                      : "bg-red-500/10 border-red-500/40 text-red-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {scanResult.accessGranted ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span>{scanResult.accessGranted ? "ACCESS GRANTED" : "ACCESS DENIED"}</span>
                  </div>
                  <p>{scanResult.message}</p>
                  {scanResult.member && (
                    <div className="mt-2 pt-2 border-t border-current/20 flex items-center gap-2">
                      <img src={scanResult.member.avatar} alt="Member" className="w-7 h-7 rounded-full" />
                      <div>
                        <strong className="text-white">{scanResult.member.name}</strong>
                        <span className="text-[10px] opacity-80 block">{scanResult.member.plan}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD MEMBER MODAL */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl p-6 glass-panel border border-zinc-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddMemberModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-white mb-1">Register New Member</h3>
            <p className="text-xs text-zinc-400 mb-4">Assigns credentials, digital QR code, and starter membership</p>

            <form onSubmit={handleCreateMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  placeholder="e.g. Liam Taylor"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                    placeholder="liam@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Blood Group</label>
                  <select
                    value={newMemberForm.bloodGroup}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={newMemberForm.emergencyContact}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, emergencyContact: e.target.value })}
                    placeholder="Name & Phone"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Health Notes / Medical Conditions</label>
                <textarea
                  rows={2}
                  value={newMemberForm.healthNotes}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, healthNotes: e.target.value })}
                  placeholder="e.g. Asthma, lower back sensitivity"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-neon-lime text-black font-black text-sm hover:bg-lime-400 transition"
                >
                  Create & Issue QR Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INVOICE VIEWER & PDF EXPORT MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl p-8 bg-zinc-900 border border-zinc-700 shadow-2xl relative text-zinc-200">
            <button
              onClick={() => setShowInvoiceModal(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Receipt Layout */}
            <div className="border-b border-zinc-800 pb-4 mb-4 flex items-center justify-between">
              <div>
                <h4 className="font-black text-xl text-white">IRONPULSE FITNESS</h4>
                <p className="text-xs text-zinc-400">100 Broadway, 4th Fl · Tax ID: GSTIN-36AAACI1234F1Z5</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-neon-lime">{showInvoiceModal.invoiceNumber}</span>
                <p className="text-[10px] text-zinc-500">{new Date(showInvoiceModal.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-zinc-400">Billed To:</span>
                <strong className="text-white">{showInvoiceModal.memberName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Payment Channel:</span>
                <span className="font-mono text-zinc-300">{showInvoiceModal.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Base Membership Charge:</span>
                <span className="text-white">${showInvoiceModal.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Applicable GST / Tax (18%):</span>
                <span className="text-white">+${showInvoiceModal.tax}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm font-black text-white">
                <span>Total Paid:</span>
                <span className="text-neon-lime">${showInvoiceModal.netTotal}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-neon-lime text-black font-black text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Print / Save PDF Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MEMBER DETAILS MODAL */}
      {showMemberDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl p-6 glass-panel border border-zinc-700 shadow-2xl relative">
            <button
              onClick={() => setShowMemberDetailsModal(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img src={showMemberDetailsModal.avatar} alt="Avatar" className="w-16 h-16 rounded-2xl border border-neon-lime/40 object-cover" />
              <div>
                <h3 className="text-lg font-black text-white">{showMemberDetailsModal.name}</h3>
                <p className="text-xs text-zinc-400">{showMemberDetailsModal.email}</p>
                <span className="text-xs font-mono text-neon-lime font-bold mt-1 inline-block">
                  QR: {showMemberDetailsModal.qrCode}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <div className="flex justify-between">
                <span className="text-zinc-400">Membership Tier:</span>
                <strong className="text-white">{showMemberDetailsModal.membership?.planName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Blood Group:</span>
                <span className="text-white font-mono">{showMemberDetailsModal.bloodGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">ID Proof:</span>
                <span className="text-zinc-300 font-mono">{showMemberDetailsModal.idProofType} ({showMemberDetailsModal.idProofNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Emergency Contact:</span>
                <span className="text-zinc-300">{showMemberDetailsModal.emergencyContact || "None"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Health & Medical Notes:</span>
                <span className="text-zinc-300 max-w-[200px] text-right">{showMemberDetailsModal.healthNotes}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl p-6 glass-panel border border-zinc-700 shadow-2xl relative">
            <button onClick={() => setShowAddExpenseModal(false)} className="absolute top-5 right-5 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-3">Log Operational Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Treadmill Belt Replacement"
                  value={newExpenseForm.title}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Category</label>
                  <select
                    value={newExpenseForm.category}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                  >
                    {["Rent", "Utilities", "Maintenance", "Supplements", "Marketing", "Payroll"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="450"
                    value={newExpenseForm.amount}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-neon-lime text-black font-black text-xs mt-2">
                Save Expense Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD CLASS MODAL */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl p-6 glass-panel border border-zinc-700 shadow-2xl relative">
            <button onClick={() => setShowAddClassModal(false)} className="absolute top-5 right-5 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-3">Schedule New Group Class</h3>
            <form onSubmit={handleAddClass} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1">Class Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Iron Kettlebell Conditioning"
                  value={newClassForm.name}
                  onChange={(e) => setNewClassForm({ ...newClassForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Category</label>
                  <select
                    value={newClassForm.category}
                    onChange={(e) => setNewClassForm({ ...newClassForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                  >
                    {["HIIT", "YOGA", "ZUMBA", "CROSSFIT", "BOXING", "STRENGTH"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Capacity Limit</label>
                  <input
                    type="number"
                    value={newClassForm.capacity}
                    onChange={(e) => setNewClassForm({ ...newClassForm, capacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-neon-lime text-black font-black text-xs mt-2">
                Add to Timetable
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
