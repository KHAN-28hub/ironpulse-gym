"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { NavbarControls } from "@/components/NavbarControls";
import {
  Users,
  Calendar,
  DollarSign,
  Star,
  LogOut,
  CheckCircle,
  Dumbbell,
  MessageSquare,
  Search,
  Plus,
  Send,
  Sparkles,
  Clock,
  Apple,
  FileText,
  X,
  ChevronRight,
} from "lucide-react";

export default function TrainerDashboard() {
  const router = useRouter();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [trainerData, setTrainerData] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [trainerMessages, setTrainerMessages] = useState<any[]>([
    { id: "1", isMe: false, senderName: "Alex Rivera", message: "Hi Coach Sarah! Shoulder felt great today during bench press. Ready for legs tomorrow!" },
    { id: "2", isMe: true, senderName: "Sarah Connor", message: "Fantastic news Alex! Remember to warm up the patellar tendon before hitting the squat rack." },
  ]);

  // Form for assigning plan
  const [assignForm, setAssignForm] = useState({
    planType: "WORKOUT",
    title: "",
    goal: "HYPERTROPHY",
  });

  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || data.user.role !== "TRAINER") {
          router.push("/");
          return;
        }
        setCurrentUser(data.user);

        return fetch("/api/trainer/clients");
      })
      .then((res) => res?.json())
      .then((cData) => {
        if (cData) {
          setTrainerData(cData.trainer);
          setClients(cData.clients || []);
          if (cData.clients?.length) setSelectedClient(cData.clients[0]);
        }
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    await fetch("/api/trainer/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: selectedClient.id,
        planType: assignForm.planType,
        title: assignForm.title,
        goal: assignForm.goal,
      }),
    });

    setShowAssignModal(false);
    showToast(`New ${assignForm.planType.toLowerCase()} plan assigned to ${selectedClient.name}!`);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setTrainerMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), isMe: true, senderName: "Sarah Connor", message: chatInput.trim() },
    ]);
    setChatInput("");
    showToast("Message sent to client.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
          Loading Coach Portal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-white flex flex-col">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900 border border-cyan-400 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-400 flex items-center justify-center text-black font-black">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight font-sans">
                IRON<span className="text-cyan-400">PULSE</span> COACH HQ
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-400 border border-cyan-400/30">
                TRAINER PORTAL
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Shift: <span className="text-zinc-200 font-semibold">{trainerData?.shift || "Morning (06:00 - 14:00)"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NavbarControls />

          <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400"}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
            />
            <div className="hidden md:block text-left text-xs">
              <p className="font-bold text-white">{currentUser?.name}</p>
              <p className="text-cyan-400 text-[10px]">Head Coach</p>
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

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* KPI Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-xs text-zinc-400">Assigned Athletes</span>
            <div className="text-2xl font-black text-white mt-1">{clients.length} Clients</div>
            <span className="text-[10px] text-emerald-400 font-bold">All 100% Active</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-xs text-zinc-400">Coach Rating</span>
            <div className="text-2xl font-black text-yellow-400 mt-1 flex items-center gap-1">
              ★ {trainerData?.rating || 4.95}
            </div>
            <span className="text-[10px] text-zinc-400">{trainerData?.reviewCount || 48} verified reviews</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-xs text-zinc-400">Monthly Compensation</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">${trainerData?.salary || 4200}</div>
            <span className="text-[10px] text-zinc-400">Salary + PT commissions</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-xs text-zinc-400">Weekly Classes</span>
            <div className="text-2xl font-black text-white mt-1">8 Sessions</div>
            <span className="text-[10px] text-cyan-400 font-bold">CrossFit & Iron Boxing</span>
          </div>
        </div>

        {/* Client Roster and Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Roster List */}
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h4 className="text-sm font-bold text-white">Client Roster ({clients.length})</h4>
              <span className="text-[10px] text-cyan-400 font-mono">Downtown Flagship</span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {clients.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedClient(c)}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    selectedClient?.id === c.id
                      ? "bg-cyan-500/10 border-cyan-400 text-white"
                      : "bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full border border-zinc-700 object-cover" />
                    <div>
                      <strong className="text-xs block">{c.name}</strong>
                      <span className="text-[10px] text-zinc-500 font-mono">{c.qrCode}</span>
                    </div>
                  </div>
                  <div className="text-right text-[11px]">
                    <span className="font-bold text-cyan-400">{c.streak}d streak</span>
                    <span className="text-zinc-500 block text-[10px]">{c.currentWeight} kg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Deep-Dive Profile */}
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            {selectedClient ? (
              <div>
                <div className="flex items-center gap-3.5 mb-4 pb-4 border-b border-zinc-800">
                  <img src={selectedClient.avatar} alt="Avatar" className="w-14 h-14 rounded-2xl border border-cyan-400 object-cover" />
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedClient.name}</h3>
                    <p className="text-xs text-zinc-400">{selectedClient.email}</p>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{selectedClient.qrCode}</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between p-2 rounded-xl bg-zinc-950">
                    <span className="text-zinc-400">Current Weight:</span>
                    <strong className="text-white">{selectedClient.currentWeight} kg (Target: {selectedClient.targetWeight} kg)</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-zinc-950">
                    <span className="text-zinc-400">Workout Streak:</span>
                    <strong className="text-neon-orange">{selectedClient.streak} Days Active</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-zinc-950">
                    <span className="text-zinc-400">Health & Medical:</span>
                    <span className="text-zinc-300 max-w-[180px] text-right truncate">{selectedClient.healthNotes}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs transition"
                  >
                    Assign Custom Workout / Diet Plan
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-zinc-500 py-12 text-xs">
                Select a client from the roster to view details
              </div>
            )}
          </div>

          {/* Client Chat Box */}
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col h-[520px]">
            <div className="pb-3 border-b border-zinc-800 mb-3 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white">Client Direct Chat (Alex Rivera)</h4>
              <span className="text-[10px] text-emerald-400 font-bold">Active</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {trainerMessages.map((m) => (
                <div key={m.id} className={`flex ${m.isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      m.isMe
                        ? "bg-cyan-500 text-black font-medium rounded-br-none"
                        : "bg-zinc-800 text-zinc-200 rounded-bl-none"
                    }`}
                  >
                    <p className="text-[10px] opacity-70 mb-0.5">{m.senderName}</p>
                    <p>{m.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendReply} className="pt-3 border-t border-zinc-800 flex gap-2">
              <input
                type="text"
                placeholder="Reply to athlete..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button type="submit" className="p-2 rounded-xl bg-cyan-400 text-black">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* MODAL: ASSIGN PLAN */}
      {showAssignModal && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl p-6 glass-panel border border-cyan-400/40 shadow-2xl relative">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-1">Assign Plan to {selectedClient.name}</h3>
            <p className="text-xs text-zinc-400 mb-4">Directly updates the athlete's in-app workout or diet schedule</p>

            <form onSubmit={handleAssignPlan} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1">Plan Category</label>
                <select
                  value={assignForm.planType}
                  onChange={(e) => setAssignForm({ ...assignForm, planType: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                >
                  <option value="WORKOUT">Workout Protocol</option>
                  <option value="DIET">Nutrition / Diet Protocol</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Plan Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6-Week Squat & Deadlift Peak"
                  value={assignForm.title}
                  onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Primary Objective</label>
                <select
                  value={assignForm.goal}
                  onChange={(e) => setAssignForm({ ...assignForm, goal: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                >
                  <option value="HYPERTROPHY">Hypertrophy (Muscle Growth)</option>
                  <option value="STRENGTH">Pure Strength & Powerlifting</option>
                  <option value="FAT_LOSS">Fat Loss & Conditioning</option>
                  <option value="MOBILITY">Joint Mobility & Recovery</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-400 text-black font-black text-xs mt-2"
              >
                Publish Plan to Athlete's App
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
