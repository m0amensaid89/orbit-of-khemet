"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Hexagon, Shield, Cpu, LogIn, LogOut, User, Wand2, Compass, Search, BookOpen, Hammer, Gem } from "lucide-react";
import { getEnergyRemainingAsync } from "@/lib/energy";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const heroColors: Record<string, string> = {
  thoren:  '#C0C0C0',
  ramet:   '#4ECDC4',
  nexar:   '#FF4444',
  lyra:    '#2D6A4F',
  kairo:   '#6C63FF',
  nefra:   '#9B59B6',
  horusen: '#3A6DD4',
};

export function Sidebar() {
  const pathname = usePathname();
  const [energy, setEnergy] = useState<number>(100000);
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [recentThreads, setRecentThreads] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const supabase = createClient();

  useEffect(() => {
    async function fetchSessionAndEnergy() {
      const { data: { session } } = await supabase.auth.getSession();
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
      }

      const currentEnergy = await getEnergyRemainingAsync();
      setEnergy(currentEnergy);
    }

    fetchSessionAndEnergy();

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

  const navItemClass = (href: string, exact: boolean = false) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href);
    return `group flex items-center gap-3 px-3 py-2 rounded-md transition-all relative overflow-hidden ${
      isActive
        ? "bg-[rgba(212,175,55,0.08)] text-[#D4AF37] border-l-[2px] border-[#D4AF37]"
        : "text-[#d0c5af] hover:text-[#d0c5af] hover:bg-[rgba(212,175,55,0.06)] border-l-[2px] border-transparent hover:border-[#D4AF37]"
    }`;
  };

  return (
    <aside className="w-[260px] h-screen bg-[#0A0A0A] hidden md:flex flex-col sticky top-0 shrink-0 text-[#d0c5af] font-rajdhani">
      {/* Top Logo Area */}
      <Link href="/" className="h-16 border-b border-[rgba(212,175,55,0.08)] flex items-center px-6">
        <span className="font-orbitron font-bold text-lg text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.3)] hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.5)] transition-all cursor-pointer">
          ORBIT OF KHEMET
        </span>
      </Link>

      <nav className="flex-1 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {/* WORKSPACE Section */}
        <div>
          <div className="px-6 mb-2">
            <span className="font-orbitron text-[10px] tracking-[8px] text-[rgba(212,175,55,0.4)] uppercase">WORKSPACE</span>
          </div>
          <div className="px-3 space-y-1">
            <Link href="/hub" className={navItemClass("/hub", true)}>
              <Compass className="w-4 h-4 z-10" />
              <span className="font-medium text-[16px] z-10">New Mission</span>
            </Link>
            <Link href="#" className={navItemClass("#", true)}>
              <Search className="w-4 h-4 z-10" />
              <span className="font-medium text-[16px] z-10">Search</span>
            </Link>
            <Link href="/hub" className={navItemClass("/codices", true)}>
              <BookOpen className="w-4 h-4 z-10" />
              <span className="font-medium text-[16px] z-10">Codices</span>
            </Link>
          </div>
        </div>

        <div className="h-[1px] bg-[rgba(212,175,55,0.08)] mx-3" />

        {/* HEROES Section */}
        <div>
          <div className="px-6 mb-2">
            <span className="font-orbitron text-[10px] tracking-[8px] text-[rgba(212,175,55,0.4)] uppercase">HEROES</span>
          </div>
          <div className="px-3 space-y-1">
            {Object.entries({
              thoren: 'THOREN',
              ramet: 'RAMET',
              nexar: 'NEXAR',
              lyra: 'LYRA',
              kairo: 'KAIRO',
              nefra: 'NEFRA',
              horusen: 'HORUSEN'
            }).map(([slug, name]) => (
              <Link key={slug} href={`/heroes/${slug}`} className={navItemClass(`/heroes/${slug}`)}>
                <span style={{ background: heroColors[slug] }} className="w-2 h-2 rounded-full inline-block shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                <span className="font-medium text-[16px] z-10">{name}</span>
              </Link>
            ))}
            <Link href="/master-orbit" className={navItemClass("/master-orbit")}>
              <Hexagon className="w-4 h-4 z-10" />
              <span className="font-medium text-[16px] z-10">Master Orbit</span>
            </Link>
          </div>
        </div>

        <div className="h-[1px] bg-[rgba(212,175,55,0.08)] mx-3" />

        {/* BUILD TOOLS Section */}
        <div>
          <div className="px-6 mb-2">
            <span className="font-orbitron text-[10px] tracking-[8px] text-[rgba(212,175,55,0.4)] uppercase">BUILD TOOLS</span>
          </div>
          <div className="px-3 space-y-1">
            <Link href="/forge" className={navItemClass("/forge")}>
              <Hammer className="w-4 h-4 z-10" />
              <span className="font-medium text-[16px] z-10">Agent Forge</span>
            </Link>
            <Link href="/autopilot" className={navItemClass("/autopilot")}>
              <Cpu className="w-4 h-4 z-10" />
              <span className="font-medium text-[16px] z-10">Auto-Pilot</span>
            </Link>
            <Link href="/ui-builder" className={navItemClass("/ui-builder")}>
              <Wand2 className="w-4 h-4 z-10" />
              <span className="font-medium text-[16px] z-10">UI Builder</span>
            </Link>
            <Link href="/sentinel" className={navItemClass("/sentinel")}>
              <Shield className="w-4 h-4 z-10" />
              <span className="font-medium text-[16px] z-10">Code Sentinel</span>
            </Link>
            <Link href="/artifacts" className={navItemClass("/artifacts")}>
              <Gem className="w-4 h-4 z-10" />
              <span className="font-medium text-[16px] z-10">Empire Relics</span>
            </Link>
          </div>
        </div>

        {/* MISSION LOG Section */}
        {user && recentThreads.length > 0 && (
          <>
            <div className="h-[1px] bg-[rgba(212,175,55,0.08)] mx-3" />
            <div>
              <div className="px-6 mb-2">
                <span className="font-orbitron text-[10px] tracking-[8px] text-[rgba(212,175,55,0.4)] uppercase">MISSION LOG</span>
              </div>
              <div className="px-3 space-y-1">
                {recentThreads.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/chat/${thread.hero_slug}?thread=${thread.id}`}
                    className="block px-3 py-2 rounded-md hover:bg-[rgba(212,175,55,0.06)] border-l-[2px] border-transparent hover:border-[#D4AF37] transition-all group"
                  >
                    <p className="font-mono text-[11px] text-[#d0c5af]/60 truncate group-hover:text-[#D4AF37]">
                      → {thread.title || 'New Chat'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* ACCOUNT Section */}
      <div className="p-4 border-t border-[rgba(212,175,55,0.08)] bg-[#0A0A0A] flex flex-col gap-4 shrink-0">
        <div className="px-2 mb-[-8px]">
          <span className="font-orbitron text-[10px] tracking-[8px] text-[rgba(212,175,55,0.4)] uppercase">ACCOUNT</span>
        </div>

        <div className="bg-[#131313] rounded-md p-3 border border-[rgba(212,175,55,0.08)] relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <Zap className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-[10px] tracking-widest text-[#d0c5af] font-orbitron uppercase">GRID ENERGY</span>
          </div>
          <div className="text-xl font-orbitron font-bold text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.2)] relative z-10">
            {energy.toLocaleString()}
          </div>
          <div className="w-full bg-[#0A0A0A] h-1 mt-2 rounded-full overflow-hidden relative z-10 border border-[rgba(212,175,55,0.08)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (energy / 100000) * 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-[#D4AF37] to-[#F5D38C] h-full"
            />
          </div>
        </div>

        {user ? (
          <div className="flex items-center justify-between px-2 py-1">
            <Link href="/profile" className="flex items-center gap-2 truncate hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 rounded-sm bg-[#131313] flex items-center justify-center shrink-0 border border-[rgba(212,175,55,0.2)]">
                <User className="w-3 h-3 text-[#D4AF37]" />
              </div>
              <div className="truncate">
                <div className="font-rajdhani text-[14px] text-[#d0c5af] font-medium truncate">
                  {profile?.display_name || user.email?.split('@')[0]}
                </div>
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              className="p-2 text-[#d0c5af]/40 hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.06)] rounded transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link href="/auth" className="block mt-1">
            <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-[#131313] border border-[rgba(212,175,55,0.2)] text-[#D4AF37] hover:bg-[rgba(212,175,55,0.06)] hover:border-[#D4AF37] transition-all group">
              <LogIn className="w-3 h-3 group-hover:scale-110 transition-transform" />
              <span className="font-orbitron text-[10px] tracking-widest uppercase font-bold">Sign In</span>
            </button>
          </Link>
        )}
      </div>
    </aside>
  );
}