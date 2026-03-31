"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Zap, Hexagon, Fingerprint, ShieldAlert, Cpu } from "lucide-react";
import { getEnergyRemaining } from "@/lib/energy";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Sidebar() {
  const pathname = usePathname();
  const [energy, setEnergy] = useState<number>(100000);

  useEffect(() => {
    setEnergy(getEnergyRemaining());
  }, []);

  return (
    <aside className="w-64 h-screen border-r border-[#D4AF37]/20 bg-background/80 backdrop-blur-xl hidden md:flex flex-col sticky top-0 shrink-0">
      <Link href="/" className="h-16 border-b border-[#D4AF37]/20 flex items-center px-6 gap-3 group">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37]/50 group-hover:border-[#D4AF37] transition-colors group-hover:shadow-[0_0_10px_rgba(212,175,55,0.4)]">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <Image src="/logo.png" alt="Logo" fill className="object-cover" />
          </motion.div>
        </div>
        <span className="font-orbitron font-bold text-sm tracking-widest text-[#D4AF37] group-hover:text-[#F5D38C] transition-colors drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">
          KHEMET
        </span>
      </Link>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <Link
          href="/hub"
          className={`group flex items-center gap-3 px-3 py-3 rounded-md transition-all relative overflow-hidden ${
            pathname === "/hub" || pathname.startsWith("/heroes")
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]"
              : "text-muted-foreground hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 border-l-2 border-transparent hover:border-[#D4AF37]/50"
          }`}
        >
          <Hexagon className="w-5 h-5 z-10" />
          <span className="font-rajdhani font-medium text-lg z-10">Hero Hub</span>
          {(pathname === "/hub" || pathname.startsWith("/heroes")) && (
             <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent opacity-50 z-0" />
          )}
        </Link>
        <Link
          href="/chat"
          className={`group flex items-center gap-3 px-3 py-3 rounded-md transition-all relative overflow-hidden ${
            pathname === "/chat" || pathname.startsWith("/chat/")
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]"
              : "text-muted-foreground hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 border-l-2 border-transparent hover:border-[#D4AF37]/50"
          }`}
        >
          <Cpu className="w-5 h-5 z-10" />
          <span className="font-rajdhani font-medium text-lg z-10">Master Orbit</span>
          {(pathname === "/chat" || pathname.startsWith("/chat/")) && (
             <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent opacity-50 z-0" />
          )}
        </Link>
        <Link
          href="/forge"
          className={`group flex items-center gap-3 px-3 py-3 rounded-md transition-all relative overflow-hidden ${
            pathname === "/forge"
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]"
              : "text-muted-foreground hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 border-l-2 border-transparent hover:border-[#D4AF37]/50"
          }`}
        >
          <Zap className="w-5 h-5 z-10" />
          <span className="font-rajdhani font-medium text-lg z-10">Agent Forge</span>
          {pathname === "/forge" && (
             <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent opacity-50 z-0" />
          )}
        </Link>
        <Link
          href="/pricing"
          className={`group flex items-center gap-3 px-3 py-3 rounded-md transition-all relative overflow-hidden ${
            pathname === "/pricing"
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]"
              : "text-muted-foreground hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 border-l-2 border-transparent hover:border-[#D4AF37]/50"
          }`}
        >
          <ShieldAlert className="w-5 h-5 z-10" />
          <span className="font-rajdhani font-medium text-lg z-10">Energy Store</span>
          {pathname === "/pricing" && (
             <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent opacity-50 z-0" />
          )}
        </Link>
        <Link
          href="/profile"
          className={`group flex items-center gap-3 px-3 py-3 rounded-md transition-all relative overflow-hidden ${
            pathname === "/profile"
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]"
              : "text-muted-foreground hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 border-l-2 border-transparent hover:border-[#D4AF37]/50"
          }`}
        >
          <Fingerprint className="w-5 h-5 z-10" />
          <span className="font-rajdhani font-medium text-lg z-10">My DNA</span>
          {pathname === "/profile" && (
             <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent opacity-50 z-0" />
          )}
        </Link>
      </nav>

      <div className="p-4 border-t border-[#D4AF37]/20 bg-background/50">
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-[10px] tracking-widest text-muted-foreground font-[Orbitron] uppercase">GRID ENERGY</span>
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
              <Zap className="w-4 h-4 text-[#D4AF37] drop-shadow-[0_0_5px_rgba(212,175,55,0.8)]" />
            </motion.div>
          </div>
          <div className="text-2xl font-orbitron font-bold text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.3)] relative z-10">
            {energy.toLocaleString()}
          </div>
          <div className="w-full bg-black/60 h-1.5 mt-3 rounded-full overflow-hidden relative z-10 border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (energy / 100000) * 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] h-full shadow-[0_0_10px_#FFD700]"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}