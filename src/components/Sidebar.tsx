"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Hexagon, Fingerprint, ShieldAlert, Cpu } from "lucide-react";
import { getEnergyRemaining } from "@/lib/energy";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [energy, setEnergy] = useState<number>(100000);

  useEffect(() => {
    setEnergy(getEnergyRemaining());
  }, []);

  return (
    <aside className="w-64 h-screen border-r border-[#D4AF37]/20 bg-[#0A0F15] hidden md:flex flex-col sticky top-0 shrink-0">
      <div className="h-16 border-b border-[#D4AF37]/20 flex items-center px-6">
        <span className="font-orbitron font-bold text-lg tracking-wider text-[#D4AF37] glow-text-gold">
          ORBIT OF KHEMET
        </span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <Link
          href="/hub"
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
            pathname === "/hub" || pathname.startsWith("/heroes")
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
              : "text-zinc-400 hover:text-[#D4AF37] hover:bg-[#1A222C]"
          }`}
        >
          <Hexagon className="w-5 h-5" />
          <span className="font-rajdhani font-medium text-lg">Hero Hub</span>
        </Link>
        <Link
          href="/chat"
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
            pathname === "/chat"
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
              : "text-zinc-400 hover:text-[#D4AF37] hover:bg-[#1A222C]"
          }`}
        >
          <Cpu className="w-5 h-5" />
          <span className="font-rajdhani font-medium text-lg">Master Orbit</span>
        </Link>
        <Link
          href="/forge"
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
            pathname === "/forge"
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
              : "text-zinc-400 hover:text-[#D4AF37] hover:bg-[#1A222C]"
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="font-rajdhani font-medium text-lg">Agent Forge</span>
        </Link>
        <Link
          href="/pricing"
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
            pathname === "/pricing"
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
              : "text-zinc-400 hover:text-[#D4AF37] hover:bg-[#1A222C]"
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="font-rajdhani font-medium text-lg">Energy Store</span>
        </Link>
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
            pathname === "/profile"
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
              : "text-zinc-400 hover:text-[#D4AF37] hover:bg-[#1A222C]"
          }`}
        >
          <Fingerprint className="w-5 h-5" />
          <span className="font-rajdhani font-medium text-lg">My DNA</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-[#D4AF37]/20">
        <div className="bg-[#1A222C] rounded-md p-3 border border-[#D4AF37]/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-exo">GRID ENERGY</span>
            <Zap className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-xl font-orbitron font-bold text-[#4DEEEA]">
            {energy.toLocaleString()}
          </div>
          <div className="w-full bg-black/50 h-1 mt-2 rounded-full overflow-hidden">
            <div
              className="bg-[#4DEEEA] h-full"
              style={{ width: `${Math.min(100, (energy / 100000) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}