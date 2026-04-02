// Grid Energy: Daily credit system for Orbit of Khemet
// Resets at midnight UTC every day. Fixed cost per model = predictable usage.
import { createClient } from "@/lib/supabase/client";

export const ENERGY_COSTS: Record<string, number> = {
  "deepseek/deepseek-r1:free": 1,
  "meta-llama/llama-3.3-70b-instruct:free": 1,
  "openrouter/auto": 3,
  "google/gemini-2.5-flash": 2,
  "google/gemini-2.5-flash-exp-image-generation": 4,
  "anthropic/claude-sonnet-4-5": 5,
  "openai/gpt-4o:online": 4,
  "anthropic/claude-sonnet-4-5:online": 6,
  "openai/o3-mini:online": 7,
  "google/gemini-2.5-flash:online": 3,
  "default": 2,
};

export const PLAN_DAILY_ENERGY: Record<string, number> = {
  free: 50,
  scout: 50,
  explorer: 200,
  commander: 9999,
};

const ENERGY_KEY = "orbit_energy_v2";
const ENERGY_DATE_KEY = "orbit_energy_date_v2";

// XP constants
export const XP_PER_MESSAGE = 10;
export const XP_PER_HERO_VISIT = 25;
export const XP_PER_AGENT_LAUNCH = 50;

export const LEVEL_THRESHOLDS = [
  { level: 1, title: "Initiate",   minXP: 0 },
  { level: 2, title: "Scout",      minXP: 200 },
  { level: 3, title: "Agent",      minXP: 600 },
  { level: 4, title: "Operative",  minXP: 1200 },
  { level: 5, title: "Commander",  minXP: 2400 },
  { level: 6, title: "Architect",  minXP: 4000 },
  { level: 7, title: "Grid Master",minXP: 7000 },
];

function getTodayUTC(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD UTC
}

function getPlan(): string {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem("orbit_plan") || "commander"; // default commander for demo
}

/**
 * Sync energy fetch
 * Fallback for guest users or initial render before async completes.
 */
export function getEnergyRemaining(): number {
  if (typeof window === "undefined") return 50;
  const plan = getPlan();
  if (plan === "commander") return 9999;

  const today = getTodayUTC();
  const storedDate = localStorage.getItem(ENERGY_DATE_KEY);

  if (storedDate !== today) {
    // New day: reset energy
    const max = PLAN_DAILY_ENERGY[plan] || 50;
    localStorage.setItem(ENERGY_KEY, String(max));
    localStorage.setItem(ENERGY_DATE_KEY, today);
    return max;
  }

  return parseInt(localStorage.getItem(ENERGY_KEY) || "50", 10);
}

/**
 * Async energy fetch checking Supabase first, then falling back to localStorage
 */
export async function getEnergyRemainingAsync(): Promise<number> {
  if (typeof window === "undefined") return 50;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('energy_balance')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      return profile.energy_balance;
    }
  }

  return getEnergyRemaining(); // Guest fallback
}

export function getMaxEnergy(): number {
  const plan = getPlan();
  return PLAN_DAILY_ENERGY[plan] || 50;
}

/**
 * Async energy consumption that deducts from Supabase for logged in users
 * and falls back to localStorage for guests.
 */
export async function consumeEnergyAsync(model: string): Promise<{ success: boolean; remaining: number; cost: number }> {
  const cost = ENERGY_COSTS[model] || ENERGY_COSTS["default"];

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('energy_balance')
      .eq('id', session.user.id)
      .single();

    const currentBalance = profile?.energy_balance ?? 0;

    if (currentBalance < cost) {
      return { success: false, remaining: currentBalance, cost };
    }

    const newBalance = Math.max(0, currentBalance - cost);

    await supabase
      .from('profiles')
      .update({ energy_balance: newBalance })
      .eq('id', session.user.id);

    return { success: true, remaining: newBalance, cost };
  }

  // Guest fallback
  const plan = getPlan();
  if (plan === "commander") return { success: true, remaining: 9999, cost: 0 };
  const current = getEnergyRemaining();

  if (current < cost) {
    return { success: false, remaining: current, cost };
  }

  const next = Math.max(0, current - cost);
  localStorage.setItem(ENERGY_KEY, String(next));
  return { success: true, remaining: next, cost };
}

/**
 * Legacy sync method maintained for existing synchronous calls where refactoring to async isn't viable right now.
 */
export function consumeEnergy(model: string): { success: boolean; remaining: number; cost: number } {
  const plan = getPlan();
  if (plan === "commander") return { success: true, remaining: 9999, cost: 0 };

  const cost = ENERGY_COSTS[model] || ENERGY_COSTS["default"];
  const current = getEnergyRemaining();

  if (current < cost) {
    return { success: false, remaining: current, cost };
  }

  const next = Math.max(0, current - cost);
  localStorage.setItem(ENERGY_KEY, String(next));
  return { success: true, remaining: next, cost };
}

export function getEnergyCost(model: string): number {
  return ENERGY_COSTS[model] || ENERGY_COSTS["default"];
}

// XP + stats
export function getStats(): {
  messages: number; heroVisits: number; agentsLaunched: number;
  xp: number; level: number; levelTitle: string;
  nextLevelXP: number; levelProgress: number;
} {
  if (typeof window === "undefined") {
    return { messages: 0, heroVisits: 0, agentsLaunched: 0, xp: 0, level: 1, levelTitle: "Initiate", nextLevelXP: 200, levelProgress: 0 };
  }
  const raw = JSON.parse(localStorage.getItem("orbit_stats") || "{}");
  const messages = raw.messages || 0;
  const heroVisits = raw.heroVisits || 0;
  const agentsLaunched = raw.agentsLaunched || 0;
  const xp = messages * XP_PER_MESSAGE + heroVisits * XP_PER_HERO_VISIT + agentsLaunched * XP_PER_AGENT_LAUNCH;

  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextLevel = LEVEL_THRESHOLDS[1];
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].minXP) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i];
      break;
    }
  }

  const range = nextLevel.minXP - currentLevel.minXP;
  const progress = range > 0 ? Math.round(((xp - currentLevel.minXP) / range) * 100) : 100;

  return {
    messages, heroVisits, agentsLaunched, xp,
    level: currentLevel.level,
    levelTitle: currentLevel.title,
    nextLevelXP: nextLevel.minXP,
    levelProgress: progress,
  };
}

export function trackMessage(): void {
  if (typeof window === "undefined") return;
  const raw = JSON.parse(localStorage.getItem("orbit_stats") || "{}");
  raw.messages = (raw.messages || 0) + 1;
  localStorage.setItem("orbit_stats", JSON.stringify(raw));
}

export function trackHeroVisit(slug: string): void {
  if (typeof window === "undefined") return;
  const raw = JSON.parse(localStorage.getItem("orbit_stats") || "{}");
  const visited: string[] = raw.heroVisited || [];
  if (!visited.includes(slug)) {
    visited.push(slug);
    raw.heroVisited = visited;
    raw.heroVisits = visited.length;
    localStorage.setItem("orbit_stats", JSON.stringify(raw));
  }
}

export function trackAgentLaunch(): void {
  if (typeof window === "undefined") return;
  const raw = JSON.parse(localStorage.getItem("orbit_stats") || "{}");
  raw.agentsLaunched = (raw.agentsLaunched || 0) + 1;
  localStorage.setItem("orbit_stats", JSON.stringify(raw));
}

// Legacy compat: profile page may call this
export function getEnergyStats() {
  const stats = getStats();
  return {
    totalEnergyUsed: stats.messages * 2,
    level: stats.level,
    currentXp: stats.xp,
    nextLevelXp: stats.nextLevelXP,
  };
}
