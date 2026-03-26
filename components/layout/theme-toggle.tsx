"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "banana-mall-theme";

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
}

function resolveTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const nextTheme = resolveTheme();
    setTheme(nextTheme);
    applyTheme(nextTheme);
    setMounted(true);
  }, []);

  const toggle = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  const currentTheme = mounted ? theme : "light";
  const isDark = currentTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all duration-200",
        "border-slate-200 bg-white/90 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md",
        "dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10",
      )}
      aria-label={isDark ? "切换到白天风格" : "切换到黑夜风格"}
      title={isDark ? "切换到白天风格" : "切换到黑夜风格"}
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border",
            isDark
              ? "border-sky-400/30 bg-sky-500/10 text-sky-300"
              : "border-amber-200 bg-amber-50 text-amber-600",
          )}
        >
          {isDark ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
        </span>
        <span className="text-left">
          <span className="block font-medium">{isDark ? "黑夜风格" : "白天风格"}</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            点击切换到{isDark ? "白天" : "黑夜"}界面
          </span>
        </span>
      </span>
      <span
        className={cn(
          "inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium",
          isDark ? "bg-sky-500/10 text-sky-300" : "bg-slate-100 text-slate-600",
        )}
      >
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}

export function FloatingThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const nextTheme = resolveTheme();
    setTheme(nextTheme);
    applyTheme(nextTheme);
    setMounted(true);
  }, []);

  const toggle = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  const currentTheme = mounted ? theme : "light";
  const isDark = currentTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "group inline-flex min-w-[150px] items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm shadow-lg backdrop-blur-xl transition-all duration-200",
        "border-slate-200/90 bg-white/92 text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white",
        "dark:border-white/10 dark:bg-[#0f0f10]/88 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-[#161618]",
      )}
      aria-label={isDark ? "切换到白天风格" : "切换到黑夜风格"}
      title={isDark ? "切换到白天风格" : "切换到黑夜风格"}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
          isDark
            ? "border-sky-400/30 bg-sky-500/10 text-sky-300"
            : "border-amber-200 bg-amber-50 text-amber-600",
        )}
      >
        {isDark ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      </span>
      <span className="text-left leading-none">
        <span className="block font-medium">{isDark ? "黑夜风格" : "白天风格"}</span>
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
          点击切换
        </span>
      </span>
    </button>
  );
}
