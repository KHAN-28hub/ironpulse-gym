"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { NavbarControls } from "@/components/NavbarControls";
import {
  ShieldCheck,
  Dumbbell,
  Users,
  Sparkles,
  ArrowRight,
  Fingerprint,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Activity,
  Flame,
  Award,
  Zap,
} from "lucide-react";

type RoleType = "OWNER" | "MEMBER" | "TRAINER" | null;
type AuthMode = "LOGIN" | "SIGNUP" | "FORGOT_PW";

export default function EntryPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState<RoleType>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("LOGIN");

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gymCode, setGymCode] = useState("IRONPULSE2026");

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [biometricScanning, setBiometricScanning] = useState(false);

  // Quick 1-Click Demo Logins
  const handleDemoLogin = async (role: "OWNER" | "MEMBER" | "TRAINER") => {
    setLoading(true);
    setErrorMsg("");
    const credentials = {
      OWNER: { identifier: "owner@ironpulse.fit", password: "ironpulse123" },
      MEMBER: { identifier: "member@ironpulse.fit", password: "ironpulse123" },
      TRAINER: { identifier: "trainer@ironpulse.fit", password: "ironpulse123" },
    }[role];

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: credentials.identifier,
          password: credentials.password,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(data.redirectUrl);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in");
      setLoading(false);
    }
  };

  // Regular Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (authMode === "SIGNUP") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName,
            email: identifier,
            phone,
            password,
            gymCode,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");
        router.push(data.redirectUrl);
        return;
      }

      if (authMode === "FORGOT_PW") {
        // Simulated password reset
        await new Promise((r) => setTimeout(r, 800));
        setSuccessMsg("Password reset link has been dispatched to your email/phone.");
        setLoading(false);
        return;
      }

      // Login
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          password,
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(data.redirectUrl);
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication error");
      setLoading(false);
    }
  };

  // Biometric Placeholder Flow
  const handleBiometricAuth = () => {
    setBiometricScanning(true);
    setTimeout(() => {
      setBiometricScanning(false);
      // Auto-login with primary demo user for the selected role
      if (selectedRole === "OWNER") handleDemoLogin("OWNER");
      else if (selectedRole === "TRAINER") handleDemoLogin("TRAINER");
      else handleDemoLogin("MEMBER");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#07080c] text-white">
      {/* Background Decorative Lighting Gradients */}
      <div className="absolute top-[-10rem] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-neon-lime/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10rem] right-[-10rem] w-[500px] h-[500px] bg-neon-orange/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-[-10rem] w-[400px] h-[400px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-lime via-lime-400 to-emerald-500 p-[1.5px] shadow-[0_0_20px_rgba(204,255,0,0.3)]">
            <div className="w-full h-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-neon-lime fill-neon-lime" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white font-sans">
                IRON<span className="text-neon-lime">PULSE</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-neon-lime/10 text-neon-lime border border-neon-lime/30">
                PRO v2.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              {t("tagline")}
            </p>
          </div>
        </div>

        {/* Live gym occupancy pill + Navbar Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-lime opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-lime"></span>
            </span>
            <span className="text-zinc-300 font-medium">Downtown Floor:</span>
            <span className="font-bold text-neon-lime">18 Inside</span>
          </div>

          <NavbarControls />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col justify-center items-center">
        {!selectedRole ? (
          /* STEP 1: Stunning Role Selection Landing Page */
          <div className="w-full max-w-5xl flex flex-col items-center">
            {/* Hero Headlines */}
            <div className="text-center mb-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/60 mb-5 shadow-sm">
                <Sparkles className="w-4 h-4 text-neon-lime animate-pulse" />
                <span className="text-xs font-semibold tracking-wide text-zinc-200">
                  Precision Gym Management & Member Super-App
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
                {t("welcomeHeader")}
              </h1>
              <p className="text-base sm:text-lg text-zinc-400">
                {t("welcomeSubheader")}
              </p>
            </div>

            {/* Two Big Animated Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-8">
              {/* CARD 1: Gym Owner (Boss) */}
              <div
                onClick={() => {
                  setSelectedRole("OWNER");
                  setAuthMode("LOGIN");
                  setIdentifier("owner@ironpulse.fit");
                  setPassword("ironpulse123");
                }}
                className="group relative cursor-pointer overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] glass-panel hover:glass-panel-glow"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-neon-lime/10 rounded-full blur-2xl group-hover:bg-neon-lime/20 transition-all duration-500" />
                
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-neon-lime group-hover:bg-neon-lime group-hover:text-black transition-colors duration-300 shadow-lg">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-neon-lime/15 text-neon-lime border border-neon-lime/30">
                    {t("ownerCardBadge")}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 flex items-center gap-2">
                  {t("ownerCardTitle")}
                  <ArrowRight className="w-5 h-5 text-neon-lime group-hover:translate-x-1.5 transition-transform duration-300" />
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  {t("ownerCardDesc")}
                </p>

                {/* Key feature pills */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/80">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/70 text-zinc-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-neon-lime" /> Live Floor Headcount
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/70 text-zinc-300">
                    Revenue & Invoices
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/70 text-zinc-300">
                    Lead CRM
                  </span>
                </div>
              </div>

              {/* CARD 2: Member (Athlete) */}
              <div
                onClick={() => {
                  setSelectedRole("MEMBER");
                  setAuthMode("LOGIN");
                  setIdentifier("member@ironpulse.fit");
                  setPassword("ironpulse123");
                }}
                className="group relative cursor-pointer overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] glass-panel hover:glass-panel-orange"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-neon-orange/10 rounded-full blur-2xl group-hover:bg-neon-orange/20 transition-all duration-500" />

                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-neon-orange group-hover:bg-neon-orange group-hover:text-black transition-colors duration-300 shadow-lg">
                    <Dumbbell className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-neon-orange/15 text-neon-orange border border-neon-orange/30">
                    {t("memberCardBadge")}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 flex items-center gap-2">
                  {t("memberCardTitle")}
                  <ArrowRight className="w-5 h-5 text-neon-orange group-hover:translate-x-1.5 transition-transform duration-300" />
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  {t("memberCardDesc")}
                </p>

                {/* Key feature pills */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/80">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/70 text-zinc-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-neon-orange" /> Workout & Rest Timer
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/70 text-zinc-300">
                    Digital QR Badge
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/70 text-zinc-300">
                    AI Coach & Macros
                  </span>
                </div>
              </div>
            </div>

            {/* Smaller Trainer / Staff Option */}
            <div
              onClick={() => {
                setSelectedRole("TRAINER");
                setAuthMode("LOGIN");
                setIdentifier("trainer@ironpulse.fit");
                setPassword("ironpulse123");
              }}
              className="cursor-pointer flex items-center justify-between w-full max-w-xl p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/60 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {t("trainerOption")}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {t("trainerOptionDesc")}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Quick 1-Click Instant Demo Bar */}
            <div className="mt-8 pt-6 border-t border-zinc-800/60 flex flex-col items-center">
              <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-neon-lime" /> {t("demoQuickLogin")}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleDemoLogin("OWNER")}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-neon-lime/40 text-neon-lime text-xs font-bold transition hover:shadow-[0_0_15px_rgba(204,255,0,0.2)] flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> {t("demoOwnerBtn")}
                </button>
                <button
                  onClick={() => handleDemoLogin("MEMBER")}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-neon-orange/40 text-neon-orange text-xs font-bold transition hover:shadow-[0_0_15px_rgba(255,85,0,0.2)] flex items-center gap-1.5"
                >
                  <Dumbbell className="w-3.5 h-3.5" /> {t("demoMemberBtn")}
                </button>
                <button
                  onClick={() => handleDemoLogin("TRAINER")}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-cyan-400/40 text-cyan-400 text-xs font-bold transition hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" /> {t("demoTrainerBtn")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: Dedicated Role Authentication Screen */
          <div className="w-full max-w-md">
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedRole(null);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="mb-4 text-xs font-semibold text-zinc-400 hover:text-white transition flex items-center gap-1"
            >
              {t("backToRoleSelect")}
            </button>

            {/* Auth Glass Card */}
            <div className={`rounded-3xl p-8 glass-panel shadow-2xl relative overflow-hidden ${
              selectedRole === "OWNER"
                ? "border-neon-lime/30"
                : selectedRole === "MEMBER"
                ? "border-neon-orange/30"
                : "border-cyan-400/30"
            }`}>
              {/* Header Icon & Title */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-md ${
                  selectedRole === "OWNER"
                    ? "bg-neon-lime text-black"
                    : selectedRole === "MEMBER"
                    ? "bg-neon-orange text-black"
                    : "bg-cyan-400 text-black"
                }`}>
                  {selectedRole === "OWNER" ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : selectedRole === "MEMBER" ? (
                    <Dumbbell className="w-6 h-6" />
                  ) : (
                    <Users className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {authMode === "LOGIN"
                      ? `${t("loginTitle")} ${
                          selectedRole === "OWNER"
                            ? "Boss HQ"
                            : selectedRole === "MEMBER"
                            ? "Member App"
                            : "Trainer Portal"
                        }`
                      : authMode === "SIGNUP"
                      ? "Create Member Account"
                      : "Reset Password"}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {selectedRole === "OWNER"
                      ? "Executive credentials with multi-branch authority"
                      : selectedRole === "MEMBER"
                      ? "Access workout logs, diet plans & gym entry QR"
                      : "Manage assigned clients, classes & commissions"}
                  </p>
                </div>
              </div>

              {/* Status & Error Messages */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                  {successMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {authMode === "SIGNUP" && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jordan Miller"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon-lime transition"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {selectedRole === "MEMBER" ? "Email or Phone Number" : "Email Address"}
                  </label>
                  <div className="relative">
                    <input
                      type={selectedRole === "MEMBER" ? "text" : "email"}
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        selectedRole === "OWNER"
                          ? "owner@ironpulse.fit"
                          : selectedRole === "TRAINER"
                          ? "trainer@ironpulse.fit"
                          : "member@ironpulse.fit or +1..."
                      }
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon-lime transition"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                      {selectedRole === "MEMBER" && identifier.startsWith("+") ? (
                        <Phone className="w-4 h-4" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {authMode === "SIGNUP" && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Gym Joining Code
                    </label>
                    <input
                      type="text"
                      value={gymCode}
                      onChange={(e) => setGymCode(e.target.value)}
                      placeholder="e.g. IRONPULSE2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon-lime transition uppercase tracking-wider"
                    />
                  </div>
                )}

                {authMode !== "FORGOT_PW" && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-zinc-300">
                        {t("passwordLabel")}
                      </label>
                      {authMode === "LOGIN" && (
                        <button
                          type="button"
                          onClick={() => setAuthMode("FORGOT_PW")}
                          className="text-[11px] text-zinc-400 hover:text-white transition"
                        >
                          {t("forgotPassword")}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon-lime transition"
                      />
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Owner Specific: Optional 2FA Switch */}
                {selectedRole === "OWNER" && authMode === "LOGIN" && (
                  <div className="pt-2">
                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs cursor-pointer">
                      <span className="text-zinc-300 flex items-center gap-2">
                        <KeyRound className="w-3.5 h-3.5 text-neon-lime" /> {t("twoFactorLabel")}
                      </span>
                      <input
                        type="checkbox"
                        checked={twoFactorEnabled}
                        onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                        className="accent-neon-lime w-4 h-4 rounded"
                      />
                    </label>

                    {twoFactorEnabled && (
                      <div className="mt-2.5">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit Authenticator Code"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-neon-lime/40 text-center tracking-widest text-sm text-white placeholder-zinc-600 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Remember Me */}
                {authMode === "LOGIN" && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-neon-lime w-3.5 h-3.5 rounded"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-zinc-400 cursor-pointer">
                      {t("rememberMe")}
                    </label>
                  </div>
                )}

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-black text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                    selectedRole === "OWNER"
                      ? "bg-neon-lime text-black hover:bg-lime-400 hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                      : selectedRole === "MEMBER"
                      ? "bg-neon-orange text-white hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(255,85,0,0.3)]"
                      : "bg-cyan-400 text-black hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                  }`}
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : authMode === "LOGIN" ? (
                    t("signInButton")
                  ) : authMode === "SIGNUP" ? (
                    "Complete Registration"
                  ) : (
                    "Send Reset Link"
                  )}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Biometric / Face Unlock UI Placeholder */}
              {authMode === "LOGIN" && (
                <div className="mt-4 pt-4 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={handleBiometricAuth}
                    disabled={biometricScanning || loading}
                    className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Fingerprint className={`w-4 h-4 ${biometricScanning ? "text-neon-lime animate-pulse" : "text-zinc-400"}`} />
                    {biometricScanning ? "Scanning Biometrics / Face ID..." : t("faceUnlockPlaceholder")}
                  </button>
                </div>
              )}

              {/* Toggle Login / Signup */}
              {selectedRole === "MEMBER" && (
                <div className="mt-4 text-center">
                  {authMode === "LOGIN" ? (
                    <p className="text-xs text-zinc-400">
                      {t("signUpPrompt")}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("SIGNUP");
                          setErrorMsg("");
                        }}
                        className="text-neon-orange font-bold hover:underline"
                      >
                        {t("signUpLink")}
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-400">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("LOGIN");
                          setErrorMsg("");
                        }}
                        className="text-neon-orange font-bold hover:underline"
                      >
                        Sign In
                      </button>
                    </p>
                  )}
                </div>
              )}

              {authMode === "FORGOT_PW" && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode("LOGIN")}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
        <div className="flex items-center gap-2">
          <span>© 2026 IronPulse Technologies Inc. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-zinc-400 cursor-pointer">Security & RBAC</span>
          <span className="hover:text-zinc-400 cursor-pointer">PWA Ready</span>
          <span className="hover:text-zinc-400 cursor-pointer">API Status: Operational</span>
        </div>
      </footer>
    </div>
  );
}
