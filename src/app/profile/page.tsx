"use client";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getStats, getEnergyRemaining, getMaxEnergy } from "@/lib/energy";
import { PLANS } from "@/lib/plans";
import { getCustomAgents, deleteCustomAgent, type CustomAgent } from "@/lib/custom-agents";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Star, Shield, Zap, History, TrendingUp } from "lucide-react";

export default function ProfilePage() {
  const [lang] = useLanguage()
  const t = useTranslations(lang)
  const [stats, setStats] = useState({ totalEnergyUsed: 0, level: 1, currentXp: 0, nextLevelXp: 100 });
  const [userPlan, setUserPlan] = useState("explorer");
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [userData, setUserData] = useState<{ email?: string; name: string; initials: string; energyBalance: number; messagesSent: number; threadsCount: number }>({ initials: "GO", energyBalance: 50, messagesSent: 0, threadsCount: 0 });
  const [frequentOrbits, setFrequentOrbits] = useState<Array<{ slug: string; name: string; roleAr?: string; role: string; interactions: number }>>([]);
  const [activityLog, setActivityLog] = useState<Array<{ id: string; title: string; hero_slug: string; updated_at: string }>>([]);

  useEffect(() => {
    const liveStats = getStats();
    setCustomAgents(getCustomAgents());

    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('energy_balance, display_name, full_name, plan, xp, level').eq('id', session.user.id).single();

        // Fetch message count and thread count from database
        const { count: messageCount } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
        const { count: threadCount } = await supabase.from('chat_threads').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);

        const email = session.user.email;
        const emailPrefix = email?.split('@')[0] || ''
        const rawName = profile?.full_name || profile?.display_name || ''
        const isDefaultName = !rawName || rawName.startsWith('Google') || rawName.startsWith('google') || rawName === 'Grid Operative'
        const name = isDefaultName ? (emailPrefix || "Grid Operative") : rawName
        const cleanName = isDefaultName ? emailPrefix : rawName
        // Initials: prefer first 2 chars of email username (most reliable)
        const initials = emailPrefix.substring(0, 2).toUpperCase() || cleanName.substring(0, 2).toUpperCase() || 'MO'

        setUserData({
          email,
          name,
          initials,
          energyBalance: getEnergyRemaining(), // Use localStorage daily balance (same as sidebar)
          messagesSent: messageCount || 0,
          threadsCount: threadCount || 0
        });

        setUserPlan(profile?.plan || "scout");

        const level = profile?.level || 1;
        const currentXp = profile?.xp || 0;
        const nextLevelXp = level * 100;

        setStats({
          totalEnergyUsed: (messageCount || 0) * 2, // approximation
          level,
          currentXp,
          nextLevelXp,
        });

        // Frequent Orbits: count threads per hero_slug, top 3
        const { data: threadsByHero } = await supabase
          .from("chat_threads")
          .select("hero_slug")
          .eq("user_id", session.user.id)
          .eq("archived", false);

        if (threadsByHero) {
          const countMap: Record<string, number> = {};
          for (const th of threadsByHero) {
            countMap[th.hero_slug] = (countMap[th.hero_slug] || 0) + 1;
          }
          const sorted = Object.entries(countMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

          const HERO_META: Record<string, { name: string; role: string }> = {
            thoren:  { name: "THOREN",  role: "Governance & Finance",    roleAr: "حوكمة ومالية" },
            ramet:   { name: "RAMET",   role: "Operations & Execution",  roleAr: "عمليات وتنفيذ" },
            nexar:   { name: "NEXAR",   role: "Transformation Architect", roleAr: "هندسة التحول" },
            lyra:    { name: "LYRA",    role: "Growth Content & Virality",roleAr: "نمو ومحتوى" },
            kairo:   { name: "KAIRO",   role: "Social & Creator Systems", roleAr: "أنظمة المحتوى" },
            nefra:   { name: "NEFRA",   role: "Experience & Relationships",roleAr: "تجربة وعلاقات" },
            horusen: { name: "HORUSEN", role: "Revenue, Offers & Deals",  roleAr: "إيرادات وصفقات" },
          };

          setFrequentOrbits(sorted.map(([slug, count]) => ({
            slug,
            name: HERO_META[slug]?.name || slug.toUpperCase(),
            role: HERO_META[slug]?.role || "",
            interactions: count,
          })));
        }

        // Activity Log: 5 most recently updated threads
        const { data: recentThreads } = await supabase
          .from("chat_threads")
          .select("id, title, hero_slug, updated_at")
          .eq("user_id", session.user.id)
          .eq("archived", false)
          .order("updated_at", { ascending: false })
          .limit(5);

        if (recentThreads) {
          setActivityLog(recentThreads);
        }

      } else {
        setUserData(prev => ({ ...prev, energyBalance: getEnergyRemaining(), messagesSent: liveStats.messages, threadsCount: 0 }));
        setStats({
          totalEnergyUsed: liveStats.messages * 2,
          level: liveStats.level,
          currentXp: liveStats.xp,
          nextLevelXp: liveStats.nextLevelXP,
        });
        // Plan already set from DB in fetchUserData — localStorage override removed (BUG-02 fix)
      }
    };
    fetchUserData();
  }, []);


  const planInfo = PLANS.find((p) => p.id === userPlan) || PLANS[0];

  const xpPercentage = Math.min(100, (stats.currentXp / stats.nextLevelXp) * 100);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <main className="container mx-auto px-4 py-16 flex flex-col items-center bg-[#0A0A0A] min-h-screen text-white overflow-hidden">
      <div className="w-full max-w-5xl flex flex-col gap-8">

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative p-8 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.1)] border border-[#D4AF37]/20 bg-[#131313]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-[#1A1A1A] flex items-center justify-center font-[Orbitron] text-4xl font-black bg-[#131313] text-[#D4AF37] relative z-10 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                {userData.initials}
              </div>
              <motion.div
                className="absolute -inset-2 rounded-full border-2 border-[#D4AF37] opacity-50 border-dashed"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute -inset-4 rounded-full border border-[#D4AF37]/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-[Orbitron] font-black tracking-wider mb-3 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] truncate max-w-md">
                {userData.name}
              </h1>
              {userData.email && (
                <p className="font-[Rajdhani] text-sm text-white/50 mb-3 -mt-2 truncate max-w-md">{userData.email}</p>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                <span className="font-[Orbitron] text-[10px] tracking-[3px] uppercase border border-[#D4AF37]/50 text-[#D4AF37] px-4 py-1.5 rounded bg-[#D4AF37]/10 shadow-[0_0_10px_rgba(212,175,55,0.2)] flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> {planInfo.name} Tier
                </span>
                <span className="font-[Orbitron] text-[10px] tracking-[3px] uppercase border border-white/20 text-white/60 px-4 py-1.5 rounded bg-white/5 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> Level {stats.level}: {stats.level === 1 ? "Initiate" : stats.level === 2 ? "Scout" : stats.level === 3 ? "Agent" : stats.level === 4 ? "Operative" : stats.level === 5 ? "Commander" : stats.level === 6 ? "Architect" : "Grid Master"}
                </span>
              </div>

              {/* Energy meter */}
              <div className="w-full max-w-md bg-[#1A1A1A] rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-[Orbitron] text-[9px] tracking-[3px] uppercase text-[#D4AF37]/80 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#D4AF37]" />{lang === 'ar' ? 'طاقة الشبكة' : 'GRID ENERGY'}
                  </span>
                  <span className="font-[Orbitron] font-bold text-xs text-[#D4AF37]">
                    {userData.energyBalance.toLocaleString()} <span className="text-white/30">/ {getMaxEnergy().toLocaleString()}</span>
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-black border border-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((userData.energyBalance / getMaxEnergy()) * 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{
                      background: userData.energyBalance / getMaxEnergy() <= 0.2 ? "linear-gradient(90deg, #991b1b, #ef4444)" :
                                  userData.energyBalance / getMaxEnergy() <= 0.5 ? "linear-gradient(90deg, #92400e, #f59e0b)" :
                                  "linear-gradient(90deg, #D4AF37, #FFD700)",
                      boxShadow: userData.energyBalance / getMaxEnergy() > 0.5 ? "0 0 10px rgba(212,175,55,0.8)" : "none"
                    }}
                  />
                </div>
                <p className="font-[Rajdhani] text-[10px] text-white/40 mt-2 text-right">Resets daily at midnight UTC</p>
                <Link href="/pricing" className="block w-full mt-4">
                  <button className="w-full font-[Orbitron] text-[10px] tracking-[3px] uppercase px-4 py-3 font-bold rounded-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #f2ca50, #D4AF37)", color: "#0a0a0a", boxShadow: "0 0 15px rgba(212,175,55,0.3)" }}>
                    {lang === 'ar' ? 'شحن الطاقة ←' : 'TOP UP ENERGY →'}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* Main Left Column (XP + Forge) */}
          <div className="md:col-span-2 flex flex-col gap-8">

            {/* Energy / XP Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 rounded-2xl flex flex-col gap-6 bg-[#131313] border border-white/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#D4AF37]/10 transition-colors" />

              <h2 className="font-[Orbitron] text-sm font-bold tracking-[4px] uppercase text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" /> {lang === 'ar' ? t.profile.evolutionProgress : 'EVOLUTION PROGRESS'}
              </h2>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <div className="flex flex-col">
                    <span className="text-5xl font-[Orbitron] font-black text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">{stats.currentXp}</span>
                    <span className="font-[Rajdhani] text-sm text-white/50 uppercase tracking-widest mt-1">{lang === 'ar' ? 'إجمالي نقاط الخبرة' : 'Total XP</span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-[Orbitron] text-[10px] tracking-[3px] uppercase text-white/40 mb-1">Next Rank: <span className="text-white">{stats.level === 1 ? "Scout" : stats.level === 2 ? "Agent" : stats.level === 3 ? "Operative" : stats.level === 4 ? "Commander" : stats.level === 5 ? "Architect" : "Grid Master"}</span></span>
                    <span className="font-[Orbitron] text-lg font-bold text-white">{stats.nextLevelXp}</span>
                  </div>
                </div>

                <div className="relative w-full h-3 bg-[#0A0A0A] border border-white/10 rounded-full overflow-hidden mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#D4AF37]/50 to-[#FFD700] rounded-full"
                  />
                  {/* Milestone markers */}
                  {[25, 50, 75].map((marker) => (
                    <div key={marker} className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: `${marker}%` }} />
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <p className="font-[Rajdhani] text-xs text-white/40">{Math.round(xpPercentage)}{lang === 'ar' ? '% مكتمل' : '% complete'}</p>
                  <p className="font-[Rajdhani] text-xs text-[#D4AF37]">{lang === 'ar' ? 'المحادثات: ' : 'Total Threads: '}{userData.threadsCount} | {lang === 'ar' ? 'الرسائل: ' : 'Total Messages: {userData.messagesSent} | {stats.nextLevelXp - stats.currentXp} XP to go</p>
                </div>
              </div>
            </motion.div>

        {/* Energy Stats */}
        <div className="p-8 rounded-sm flex flex-col gap-6" style={{ background: "#131313", outline: "1px solid rgba(212,175,55,0.08)" }}>
          <h2 className="font-[Orbitron] text-xs tracking-[4px] uppercase" style={{ color: "rgba(212,175,55,0.5)" }}>{lang === 'ar' ? (t.profile?.gridXp || 'نقاط الشبكة') : lang === 'ar' ? 'نقاط الشبكة' : 'GRID XP'}</h2>
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-4xl font-[Orbitron] font-black">{stats.currentXp}</span>
              <div className="text-right">
                <span className="font-[Orbitron] text-[10px] tracking-widest uppercase text-muted-foreground block mb-1">{lang === 'ar' ? 'الرتبة التالية' : 'Next Rank'}</span>
                <span className="font-[Rajdhani] text-primary">{lang === 'ar' ? 'كشّاف' : 'Scout'}</span>
                <p className="font-mono text-[9px] text-muted-foreground mt-1">{stats.nextLevelXp - stats.currentXp} {lang === 'ar' ? 'نقطة للرتبة التالية' : 'XP away'}</p>
              </div>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-1000"
                style={{ width: `${(stats.currentXp / stats.nextLevelXp) * 100}%`, background: "linear-gradient(90deg, #D4AF37, #f2ca50)" }}
              />
            </div>
          </div>
        </div>

            {/* {lang === 'ar' ? t.profile.myForge : 'MY FORGE'} Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="p-8 rounded-2xl flex flex-col gap-6 bg-[#131313] border border-white/5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-[Orbitron] text-sm font-bold tracking-[4px] uppercase text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#D4AF37]" /> {lang === 'ar' ? t.profile.myForge : 'MY FORGE'}
                </h2>
                {customAgents.length < 3 && (
                  <Link href="/forge">
                    <button className="font-[Orbitron] text-[9px] tracking-widest uppercase px-4 py-2 border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all rounded-md">
                      {lang === 'ar' ? 'إنشاء وكيل' : 'FORGE NEW'}
                    </button>
                  </Link>
                )}
              </div>

              {customAgents.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl bg-[#0A0A0A]">
                  <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="font-[Orbitron] text-sm tracking-widest text-white/60 mb-2">{lang === 'ar' ? 'لا يوجد وكلاء مخصصوн بعد' : 'NO CUSTOM AGENTS YET'}</p>
                  <p className="font-[Rajdhani] text-base text-white/40 mb-6 max-w-sm mx-auto">
                    {lang === 'ar' ? 'أنشئ وкيلك المخصص الأول.' : 'Forge your first custom agent. Define its intelligence. Assign it to any hero orbit.'}
                  </p>
                  <Link href="/forge">
                    <button className="font-[Orbitron] text-[10px] tracking-[3px] uppercase px-8 py-3 font-bold rounded-md hover:scale-105 transition-transform"
                      style={{ background: "linear-gradient(135deg, #f2ca50, #D4AF37)", color: "#0a0a0a", boxShadow: "0 0 20px rgba(212,175,55,0.3)" }}>
                      INITIALIZE FORGE ✦
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {customAgents.map(agent => (
                    <div key={agent.id} className="flex items-center gap-5 p-5 rounded-xl transition-all border border-white/5 bg-[#1A1A1A] hover:border-[#D4AF37]/30 group">

                      <div className="relative w-14 h-14 rounded-xl flex items-center justify-center font-[Orbitron] text-xl font-bold shrink-0 border-2 border-[#D4AF37]/30 bg-[#131313] text-[#D4AF37] group-hover:border-[#D4AF37] transition-colors overflow-hidden">
                        <span className="relative z-10">{agent.name.substring(0, 2).toUpperCase()}</span>
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-[Orbitron] text-base font-bold text-white truncate">{agent.name}</h3>
                          <span className="font-[Orbitron] text-[9px] tracking-widest uppercase px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">
                            ✦ CUSTOM
                          </span>
                        </div>
                        <p className="font-mono text-[10px] tracking-widest uppercase text-white/60 truncate mb-1.5">
                          {agent.role_summary}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="font-[Rajdhani] text-xs text-[#D4AF37] uppercase">{agent.heroSlug} Orbit</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="font-[Rajdhani] text-xs text-white/40">{agent.category}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <Link href={`/heroes/${agent.heroSlug}`}>
                          <button className="w-24 font-[Orbitron] text-[9px] tracking-widest uppercase px-3 py-2 border border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all rounded-md text-white/60">
                            VIEW
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            deleteCustomAgent(agent.id);
                            setCustomAgents(getCustomAgents());
                          }}
                          className="w-24 font-[Orbitron] text-[9px] tracking-widest uppercase px-3 py-2 border border-white/10 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5 transition-all rounded-md text-white/60">
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                  {customAgents.length >= 3 && (
                    <p className="font-[Rajdhani] text-sm text-[#D4AF37]/60 text-center mt-4 border border-[#D4AF37]/20 bg-[#D4AF37]/5 py-2 rounded-lg">
                      Maximum capacity of 3 custom agents reached.
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column (Favorites & Timeline) */}
          <div className="flex flex-col gap-8">

            {/* Favorite Heroes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
              className="p-6 rounded-2xl bg-[#131313] border border-white/5 flex flex-col gap-5"
            >
              <h2 className="font-[Orbitron] text-sm font-bold tracking-[3px] uppercase text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-[#D4AF37]" /> {lang === 'ar' ? 'الوكلاء الأكثر استخداماً' : 'FREQUENT ORBITS'}
              </h2>

              <div className="flex flex-col gap-3">
                {frequentOrbits.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="font-[Orbitron] text-xs tracking-widest" style={{ color: "rgba(212,175,55,0.4)" }}>{lang === 'ar' ? 'لا توجد مسارات بعد' : 'NO ORBITS YET'}</p>
                    <p className="font-[Rajdhani] text-sm mt-1" style={{ color: "rgba(208,197,175,0.4)" }}>{lang === 'ar' ? 'ابدأ المحادثة مع أي بطل.' : 'Start chatting with any hero.'}</p>
                  </div>
                ) : (
                  frequentOrbits.map((hero) => (
                    <Link key={hero.slug} href={`/heroes/${hero.slug}`}>
                      <div className="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-[#1A1A1A] hover:bg-white/5 transition-colors group cursor-pointer">
                        <div className="relative w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-black group-hover:border-[#D4AF37]/50 transition-colors">
                          <Image src={`/${hero.slug}.png`} alt={hero.name} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-[Orbitron] text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">{hero.name}</h3>
                          <p className="font-[Rajdhani] text-xs text-white/50">{lang === 'ar' ? (hero.roleAr || hero.role) : hero.role}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-[Orbitron] text-lg font-bold text-white/80">{hero.interactions}</span>
                          <p className="font-mono text-[8px] uppercase tracking-widest text-white/30">Threads</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>

            {/* Activity Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
              className="p-6 rounded-2xl bg-[#131313] border border-white/5 flex flex-col gap-6 flex-1"
            >
              <h2 className="font-[Orbitron] text-sm font-bold tracking-[3px] uppercase text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#D4AF37]" /> {lang === 'ar' ? 'سجل النشاط' : 'ACTIVITY LOG'}
              </h2>

              {activityLog.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-[Orbitron] text-xs tracking-widest" style={{ color: "rgba(212,175,55,0.4)" }}>NO ACTIVITY YET</p>
                  <p className="font-[Rajdhani] text-sm mt-1" style={{ color: "rgba(208,197,175,0.4)" }}>Your mission log will appear here.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-white/10 ml-3 flex flex-col gap-8 pb-4">
                  {activityLog.map((thread) => (
                    <Link key={thread.id} href={`/chat/${thread.hero_slug}?thread=${thread.id}`}>
                      <div className="relative pl-6 cursor-pointer group">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#131313] border-2 border-[#D4AF37] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-[9px] tracking-widest text-[#D4AF37]/80">{timeAgo(thread.updated_at)}</span>
                          <span className="font-[Orbitron] text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate max-w-[180px]">{thread.title || "Untitled Mission"}</span>
                          <span className="font-[Rajdhani] text-sm text-white/60 uppercase tracking-wide">{thread.hero_slug?.toUpperCase()}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

          </div>
        </div>

      </div>
    </main>
  );
}