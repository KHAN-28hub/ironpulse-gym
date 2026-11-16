"use client";

import React from "react";
import { useLanguage, Language } from "@/lib/i18n";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Globe } from "lucide-react";

export const NavbarControls: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      {/* Language Switcher */}
      <div className="relative flex items-center bg-zinc-900/80 border border-zinc-800 rounded-full px-2.5 py-1 text-xs">
        <Globe className="w-3.5 h-3.5 text-zinc-400 mr-1.5" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-transparent text-zinc-300 font-medium focus:outline-none cursor-pointer pr-1"
        >
          <option value="en" className="bg-zinc-900 text-white">EN - English</option>
          <option value="hi" className="bg-zinc-900 text-white">HI - हिंदी</option>
          <option value="te" className="bg-zinc-900 text-white">TE - తెలుగు</option>
        </select>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
        title="Toggle Light/Dark Theme"
      >
        {theme === "dark" ? <Sun className="w-4 h-4 text-neon-lime" /> : <Moon className="w-4 h-4 text-zinc-800" />}
      </button>
    </div>
  );
};
