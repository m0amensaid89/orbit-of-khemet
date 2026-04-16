"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut } from "lucide-react";

export default function AdminNav({ username, role }: { username: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const getRoleBadgeColor = (r: string) => {
    switch (r) {
      case "super_admin": return "text-[#D4AF37] border-[#D4AF37]/50 bg-[#D4AF37]/10";
      case "leader": return "text-purple-400 border-purple-400/50 bg-purple-400/10";
      case "cx": return "text-cyan-400 border-cyan-400/50 bg-cyan-400/10";
      default: return "text-white/50 border-white/20 bg-white/5";
    }
  };

  return (
    <div className="w-64 min-h-screen bg-[#0D0D0D] border-r border-white/5 flex flex-col">
      <div className="p-6 border-b border-white/5 flex flex-col items-center">
        <Image src="/logo.png" alt="Logo" width={40} height={40} className="mb-3 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]" />
        <h2 className="font-[Orbitron] text-xs font-bold tracking-[3px] text-white uppercase text-center">
          COMMAND<br />CENTER
        </h2>
      </div>

      <nav className="flex-1 py-6 space-y-2 px-4">
        <Link href="/admin/dashboard" className={`block px-4 py-3 rounded text-[11px] font-[Orbitron] tracking-[2px] transition-colors ${pathname === '/admin/dashboard' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' : 'text-white/60 hover:text-[#D4AF37] hover:bg-white/5'}`}>
          ✦ INTELLIGENCE
        </Link>

        <Link href="/admin/users" className={`block px-4 py-3 rounded text-[11px] font-[Orbitron] tracking-[2px] transition-colors ${pathname === '/admin/users' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' : 'text-white/60 hover:text-[#D4AF37] hover:bg-white/5'}`}>
          ✦ AGENT REGISTRY
        </Link>

        {role === 'super_admin' && (
          <Link href="/admin/admins" className={`block px-4 py-3 rounded text-[11px] font-[Orbitron] tracking-[2px] transition-colors ${pathname === '/admin/admins' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' : 'text-white/60 hover:text-[#D4AF37] hover:bg-white/5'}`}>
            ✦ COMMAND ACCESS
          </Link>
        )}

        {(role === 'leader' || role === 'super_admin') && (
          <div className="block px-4 py-3 rounded text-[11px] font-[Orbitron] tracking-[2px] text-white/30 cursor-not-allowed">
            ✦ AUDIT LOG <span className="text-[8px]">(SOON)</span>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded bg-black border border-white/10 flex items-center justify-center">
            <span className="font-[Orbitron] text-xs text-[#D4AF37]">{username.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <div className="font-[Rajdhani] text-sm text-white">{username}</div>
            <div className={`text-[9px] font-[Orbitron] tracking-[1px] uppercase border px-1.5 py-0.5 rounded mt-0.5 inline-block ${getRoleBadgeColor(role)}`}>
              {role.replace('_', ' ')}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 border border-white/10 rounded text-[10px] font-[Orbitron] tracking-[2px] text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          LOGOUT
        </button>
      </div>
    </div>
  );
}
