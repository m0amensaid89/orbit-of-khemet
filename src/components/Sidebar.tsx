"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Zap, Hexagon, Fingerprint, ShieldAlert, Shield, Cpu, LogIn, LogOut, User, Wand2 } from "lucide-react";
import { getEnergyRemainingAsync } from "@/lib/energy";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export function Sidebar() {
  const pathname = usePathname();
  const [energy, setEnergy] = useState<number>(100000);
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [recentThreads, setRecentThreads] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const supabase = createClient();

  useEffect(() => {
    async function fetchSessionAndEnergy() {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);

        // Fetch recent threads
        const { data: threads } = await supabase
          .from('chat_threads')
          .select('id, title, hero_slug, updated_at')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false })
          .limit(10);

        if (threads) {
          setRecentThreads(threads);
        }
      }

      // Fetch energy (async handles both logged in and guest)
      const currentEnergy = await getEnergyRemainingAsync();
      setEnergy(currentEnergy);
    }

    fetchSessionAndEnergy();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(profileData);

          const { data: threads } = await supabase
            .from('chat_threads')
            .select('id, title, hero_slug, updated_at')
            .eq('user_id', session.user.id)
            .order('updated_at', { ascending: false })
            .limit(10);
          if (threads) {
            setRecentThreads(threads);
          }
        } else {
          setProfile(null);
          setRecentThreads([]);
        }
        // Refresh energy on auth change
        const currentEnergy = await getEnergyRemainingAsync();
        setEnergy(currentEnergy);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

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
          href="/sentinel"
          className={`group flex items-center gap-3 px-3 py-3 rounded-md transition-all relative overflow-hidden ${
            pathname === "/sentinel"
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]"
              : "text-muted-foreground hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 border-l-2 border-transparent hover:border-[#D4AF37]/50"
          }`}
        >
          <Shield className="w-5 h-5 z-10" />
          <span className="font-rajdhani font-medium text-lg z-10">Code Sentinel</span>
          {pathname === "/sentinel" && (
             <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent opacity-50 z-0" />
          )}
        </Link>
        <Link
          href="/ui-builder"
          className={`group flex items-center gap-3 px-3 py-3 rounded-md transition-all relative overflow-hidden ${
            pathname === "/ui-builder"
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]"
              : "text-muted-foreground hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 border-l-2 border-transparent hover:border-[#D4AF37]/50"
          }`}
        >
          <Wand2 className="w-5 h-5 z-10" />
          <span className="font-rajdhani font-medium text-lg z-10">UI Builder</span>
          {pathname === "/ui-builder" && (
             <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent opacity-50 z-0" />
          )}
        </Link>
        <Link
          href="/master-orbit"
          className={`group flex items-center gap-3 px-3 py-3 rounded-md transition-all relative overflow-hidden ${
            pathname === "/master-orbit"
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]"
              : "text-muted-foreground hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 border-l-2 border-transparent hover:border-[#D4AF37]/50"
          }`}
        >
          <Cpu className="w-5 h-5 z-10" />
          <span className="font-rajdhani font-medium text-lg z-10">Master Orbit</span>
          {pathname === "/master-orbit" && (
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
          href="/autopilot"
          className={`group flex items-center gap-3 px-3 py-3 rounded-md transition-all relative overflow-hidden ${
            pathname === "/autopilot"
              ? "bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]"
              : "text-muted-foreground hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 border-l-2 border-transparent hover:border-[#D4AF37]/50"
          }`}
        >
          <Cpu className="w-5 h-5 z-10" />
          <span className="font-rajdhani font-medium text-lg z-10">Auto-Pilot</span>
          {pathname === "/autopilot" && (
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

        {user && recentThreads.length > 0 && (
          <div className="pt-6 pb-2">
            <h3 className="px-3 text-[10px] font-orbitron tracking-widest text-[#D4AF37]/70 uppercase mb-2">
              Recent Chats
            </h3>
            <div className="space-y-1">
              {recentThreads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/chat/${thread.hero_slug}?thread=${thread.id}`}
                  className="block px-3 py-2 rounded-md hover:bg-[#D4AF37]/10 transition-colors"
                >
                  <p className="font-mono text-[9px] text-[#d0c5af]/60 truncate group-hover:text-[#D4AF37]">
                    → {thread.title || 'New Chat'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-[#D4AF37]/20 bg-background/50 flex flex-col gap-4">

        {/* User Auth Section */}
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
            <div className="flex items-center gap-3 truncate">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center shrink-0 border border-[#D4AF37]/40">
                <User className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="truncate">
                <div className="font-[Rajdhani] text-sm text-white font-medium truncate">
                  {profile?.display_name || user.email?.split('@')[0]}
                </div>
                <div className="font-[Orbitron] text-[8px] text-[#D4AF37] tracking-widest uppercase truncate">
                  Commander
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-white/40 hover:text-[#D4AF37] hover:bg-white/5 rounded transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link href="/auth" className="block">
            <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all group">
              <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-[Orbitron] text-[10px] tracking-widest uppercase font-bold">Sign In</span>
            </button>
          </Link>
        )}

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