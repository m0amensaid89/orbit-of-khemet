"use client";

import Link from "next/link";


import { usePathname } from "next/navigation";
import { Code, Shield, Cpu, LogIn, LogOut, User, Wand2, Compass, Hammer, Gem, Globe, Brain , Sparkles, Film } from "lucide-react";
import { useEffect, useState } from "react";
import { CreditMeter } from "./CreditMeter";
import { CreditMeterSkeleton } from "./CreditMeterSkeleton";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";


export function Sidebar() {
  const pathname = usePathname();
  const [energy, setEnergy] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [recentThreads, setRecentThreads] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [superSkillsOpen, setSuperSkillsOpen] = useState(true);
  const [missionLogOpen, setMissionLogOpen] = useState(true);
  const [threadSearch, setThreadSearch] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [projects, setProjects] = useState<Array<{id: string, name: string, color: string}>>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [pinnedThreads, setPinnedThreads] = useState<string[]>([]);
  const [tabSessions, setTabSessions] = useState<Array<{id: string; heroSlug: string; agentName: string; label: string}>>([]);
  const [lang, setLang] = useLanguage();
  const t = useTranslations(lang);


  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (data.projects) setProjects(data.projects)
    }
    fetchProjects()
  }, [])

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProjectName, color: '#D4AF37' }),
    })
    const data = await res.json()
    if (data.project) {
      setProjects(prev => [data.project, ...prev])
      setNewProjectName('')
      setShowNewProject(false)
    }
  }

  const supabase = createClient();

  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/threads')
      const data = await res.json()
      if (data.threads) setRecentThreads(data.threads)
    } catch (err) {
      console.error('Failed to fetch threads:', err)
    }
  }

  const handleStarThread = async (threadId: string, starred: boolean) => {
    await fetch('/api/chat-history/star', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, starred }),
    })
    await fetchThreads()
  }


  const filteredThreads = recentThreads.filter(t =>
    !threadSearch || (t.title || 'New Mission').toLowerCase().includes(threadSearch.toLowerCase())
  );

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

        await fetchThreads();
      }

      // Initial credits fetch
      try {
        const res = await fetch('/api/user/credits');
        const data = await res.json();
        if (data && typeof data.credits === 'number') {
          setEnergy(data.credits);
        }
      } catch (err) {
        console.error("Failed to fetch updated credits:", err);
      }
    }

    fetchSessionAndEnergy();
    // Load pinned threads and tab sessions from localStorage
    try {
      const pinned = JSON.parse(localStorage.getItem('orbit_pinned_threads') || '[]');
      setPinnedThreads(pinned);
      const tabs = JSON.parse(localStorage.getItem('orbit_tabs') || '[]');
      setTabSessions(tabs);
    } catch {}


    const handleCreditsUpdate = async () => {
      try {
        const res = await fetch('/api/user/credits');
        const data = await res.json();
        if (data && typeof data.credits === 'number') {
          setEnergy(data.credits);
        }
      } catch (err) {
        console.error("Failed to fetch updated credits:", err);
      }
    };

    window.addEventListener('credits-updated', handleCreditsUpdate);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setProfile(null);
          setEnergy(null);
          setRecentThreads([]);
          setProjects([]);
          setSelectedProject(null);
          return;
        }

        setUser(session?.user || null);
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(profileData);

          await fetchThreads();
        } else {
          setProfile(null);
          setRecentThreads([]);
        }
        try {
          const res = await fetch('/api/user/credits');
          const data = await res.json();
          if (data && typeof data.credits === 'number') {
            setEnergy(data.credits);
          }
        } catch (err) {
          console.error("Failed to fetch updated credits:", err);
        }
      }
    );

    return () => {
      window.removeEventListener('credits-updated', handleCreditsUpdate);
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


  const togglePin = (threadId: string) => {
    setPinnedThreads(prev => {
      const next = prev.includes(threadId)
        ? prev.filter(id => id !== threadId)
        : prev.length >= 5 ? prev : [...prev, threadId];
      localStorage.setItem('orbit_pinned_threads', JSON.stringify(next));
      return next;
    });
  };

  const closeTab = (tabId: string) => {
    setTabSessions(prev => {
      const next = prev.filter(t => t.id !== tabId);
      localStorage.setItem('orbit_tabs', JSON.stringify(next));
      return next;
    });
  };

  const pinnedList = filteredThreads.filter(t => pinnedThreads.includes(t.id));
  const unpinnedList = filteredThreads.filter(t => !pinnedThreads.includes(t.id));

  return (
    <aside className="w-[260px] h-screen bg-[#0A0A0A] hidden md:flex flex-col sticky top-0 shrink-0 text-[#d0c5af] font-rajdhani" style={lang === 'ar' ? { right: 0, left: 'auto', borderRight: 'none', borderLeft: '1px solid rgba(212,175,55,0.2)' } : { left: 0, right: 'auto' }}>
      {/* Top Logo Area */}
      <Link href="/hub" className="h-16 border-b border-[#D4AF37]/20 flex items-center px-6 gap-3 shrink-0">
        <img
          src="/khemet-logo.png"
          alt="Khemet AI"
          style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }}
        />
        <span className="font-[family-name:var(--font-cinzel-decorative)] text-[#D4AF37] font-bold text-base tracking-wider">
          KHEMET AI
        </span>
      </Link>

      <nav className="flex-1 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {/* WORKSPACE Section */}
        <div>
          <div className="px-6 mb-2">
            <span className="font-orbitron text-empire-xs text-[rgba(212,175,55,0.4)] uppercase">{t.sidebar?.workspace || 'WORKSPACE'}</span>
          </div>
          <div className="px-3 space-y-1">
            <Link href="/hub" className={navItemClass("/hub", true)}>
              <Compass className="w-4 h-4 z-10" />
              <span className="font-medium text-empire-sm z-10">{t.nav.newMission}</span>
            </Link>
            <Link href="/brain" className={navItemClass("/brain")}>
              <Brain className="w-4 h-4 z-10" />
              <span className="font-medium text-empire-sm z-10">{t.nav.brain}</span>
            </Link>
            {/*
            <Link href="/master-orbit" className={navItemClass("/master-orbit")}>
              <Hexagon className="w-4 h-4 z-10" />
              <span className="font-medium text-empire-sm z-10">Master Orbit</span>
            </Link>
            */}
            {/* Codices (future feature — project management) removed until implemented */}
          </div>
        </div>

        <div className="h-[1px] bg-[rgba(212,175,55,0.08)] mx-3" />

        {/* SUPER SKILLS Section */}
        <div style={{ borderTop: '1px solid rgba(212,175,55,0.08)' }}>
          <button
            onClick={() => setSuperSkillsOpen(prev => !prev)}
            className="w-full flex items-center justify-between px-6 py-3 transition-all hover:bg-[rgba(212,175,55,0.03)]">
            <span className="font-orbitron text-empire-xs uppercase"
              style={{ color: 'rgba(212,175,55,0.4)' }}>{t.nav.superSkills}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke="rgba(212,175,55,0.4)" strokeWidth="2" strokeLinecap="round"
              style={{ transform: superSkillsOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {superSkillsOpen && (
            <div className="flex flex-col px-3 space-y-1">
              <Link href="/forge" className={navItemClass("/forge")}>
                <Hammer className="w-4 h-4 z-10" />
                <span className="font-medium text-empire-sm z-10">{t.nav.forge}</span>
              </Link>
              <Link href="/autopilot" className={navItemClass("/autopilot")}>
                <Cpu className="w-4 h-4 z-10" />
                <span className="font-medium text-empire-sm z-10">{t.nav.autopilot}</span>
              </Link>
              <Link href="/code-studio" className={navItemClass("/code-studio")}>
                <Code className="w-4 h-4 z-10" />
                <span className="font-medium text-empire-sm z-10">{lang === 'ar' ? t.sidebar.codeStudio : 'Code Studio'}</span>
              </Link>
              <Link href="/creative-studio" className={navItemClass("/creative-studio")}>
                <Sparkles className="w-4 h-4 z-10" />
                <span className="font-medium text-empire-sm z-10">{lang === 'ar' ? t.sidebar.creativeStudio : 'Creative Studio'}</span>
              </Link>
              <Link href="/cinema" className={navItemClass("/cinema")}>
                <Film className="w-4 h-4 z-10" />
                <span className="font-medium text-empire-sm z-10">{lang === 'ar' ? t.sidebar.cinemaEngine : 'Cinema Engine'}</span>
              </Link>
              <Link href="/browser" className={navItemClass("/browser")}>
                <Globe className="w-4 h-4 z-10" />
                <span className="font-medium text-empire-sm z-10">{lang === 'ar' ? t.sidebar.browserControl : 'Browser Control'}</span>
              </Link>
              <Link href="/artifacts" className={navItemClass("/artifacts")}>
                <Gem className="w-4 h-4 z-10" />
                <span className="font-medium text-empire-sm z-10">{t.nav.empireRelics}</span>
              </Link>
            </div>
          )}
        </div>


        {/* PROJECTS SECTION */}
        <div style={{ padding: '0 12px', marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <span style={{
              fontSize: '9px',
              letterSpacing: '0.14em',
              color: 'rgba(212,175,55,0.5)',
              fontFamily: 'monospace',
            }}>{t.nav.projects}</span>
            <button
              onClick={() => setShowNewProject(true)}
              style={{
                fontSize: '14px',
                color: '#D4AF37',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >+</button>
          </div>

          {/* Project list */}
          {projects.map(p => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              onClick={() => setSelectedProject(p.id)}
              style={{
                display: 'block',
                padding: '6px 8px',
                marginBottom: '2px',
                cursor: 'pointer',
                borderLeft: selectedProject === p.id
                  ? `2px solid ${p.color || '#D4AF37'}`
                  : '2px solid transparent',
                fontSize: '11px',
                color: selectedProject === p.id ? '#fff' : 'rgba(255,255,255,0.5)',
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                background: selectedProject === p.id ? 'rgba(212,175,55,0.08)' : 'transparent',
                borderRadius: '4px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = selectedProject === p.id ? 'rgba(212,175,55,0.08)' : 'transparent'; e.currentTarget.style.color = selectedProject === p.id ? '#fff' : 'rgba(255,255,255,0.5)'; }}
            >
              ✦ {p.name}
            </Link>
          ))}

          {/* New project modal */}
          {showNewProject && (
            <div style={{
              background: '#111',
              border: '1px solid rgba(212,175,55,0.3)',
              padding: '12px',
              marginTop: '8px',
            }}>
              <input
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                placeholder="Project name..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(212,175,55,0.3)',
                  color: '#fff',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  padding: '4px 0',
                  marginBottom: '8px',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleCreateProject}
                  style={{
                    flex: 1,
                    padding: '4px',
                    background: 'transparent',
                    border: '1px solid #D4AF37',
                    color: '#D4AF37',
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                  }}
                >CREATE</button>
                <button
                  onClick={() => setShowNewProject(false)}
                  style={{
                    flex: 1,
                    padding: '4px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                  }}
                >CANCEL</button>
              </div>
            </div>
          )}
        </div>

        {/* ACTIVE SESSIONS — multi-session tabs */}
        {tabSessions.length > 0 && user && (
          <>
            <div className="h-[1px] bg-[rgba(212,175,55,0.08)] mx-3" />
            <div className="px-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-orbitron text-empire-xs uppercase text-[rgba(212,175,55,0.4)]">ACTIVE SESSIONS</span>
                <a href="/hub" style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.1em', color: 'rgba(212,175,55,0.4)', textDecoration: 'none' }}>+ NEW</a>
              </div>
              {tabSessions.slice(0, 5).map(tab => (
                <div key={tab.id} className="group flex items-center gap-2 mb-1 px-2 py-1 rounded-sm transition-all hover:bg-[rgba(212,175,55,0.04)]"
                  style={{ border: '1px solid rgba(212,175,55,0.08)' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontFamily: 'monospace', color: '#D4AF37', flexShrink: 0 }}>
                    {tab.heroSlug.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ flex: 1, fontSize: '11px', color: 'rgba(208,197,175,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{tab.label}</span>
                  <button onClick={() => closeTab(tab.id)} style={{ opacity: 0, background: 'none', border: 'none', color: 'rgba(208,197,175,0.4)', cursor: 'pointer', fontSize: '12px', padding: '0 2px', flexShrink: 0 }}
                    className="group-hover:!opacity-100 transition-opacity">×</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* MISSION LOG Section */}
        {user && recentThreads.length > 0 && (
          <>
            <div className="h-[1px] bg-[rgba(212,175,55,0.08)] mx-3" />
            <div>
              <button
                onClick={() => setMissionLogOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-6 py-3 transition-all hover:bg-[rgba(212,175,55,0.03)] mb-1"
              >
                <span className="font-orbitron text-empire-xs uppercase text-[rgba(212,175,55,0.4)]">{t.nav.missionLog}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(212,175,55,0.4)" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transform: missionLogOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {missionLogOpen && (
                <>
                  <div className="px-4 pb-2">
                    <input
                      type="text"
                      value={threadSearch}
                      onChange={e => setThreadSearch(e.target.value)}
                      placeholder="Search missions..."
                      className="w-full px-3 py-1.5 text-xs font-[Rajdhani]"
                      style={{
                        background: 'rgba(212,175,55,0.04)',
                        border: '1px solid rgba(212,175,55,0.1)',
                        color: '#d0c5af',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div className="px-3 space-y-1">
                {recentThreads.filter(t => t.starred).length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(212,175,55,0.4)', padding: '0 0 4px 0', fontFamily: 'monospace' }}>
                      ★ STARRED
                    </div>
                    {recentThreads.filter(t => t.starred).map(thread => (
                      <div key={thread.id} className="group relative flex items-center">
                        {renamingId === thread.id ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onBlur={async () => {
                              if (isRenaming) return;
                              setIsRenaming(true);
                              if (renameValue.trim() && renameValue.trim() !== thread.title) {
                                await fetch(`/api/chat-threads/${thread.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ title: renameValue.trim() }),
                                });
                                setRecentThreads(prev =>
                                  prev.map(t => t.id === thread.id ? { ...t, title: renameValue.trim() } : t)
                                );
                              }
                              setRenamingId(null);
                              setIsRenaming(false);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                              if (e.key === 'Escape') {
                                setRenamingId(null);
                                setIsRenaming(false);
                              }
                            }}
                            className="flex-1 px-4 py-2 text-xs font-[Rajdhani] bg-transparent outline-none"
                            style={{
                              border: '1px solid rgba(212,175,55,0.3)',
                              color: '#D4AF37',
                            }}
                          />
                        ) : (
                          <Link
                            href={`/chat/${thread.hero_slug?.toLowerCase()}?thread=${thread.id}`}
                            className="flex-1 flex items-center gap-2 px-4 py-2 transition-all text-sm truncate"
                            style={{ color: 'rgba(208,197,175,0.6)' }}
                            onDoubleClick={(e) => {
                              e.preventDefault();
                              setRenamingId(thread.id);
                              setRenameValue(thread.title || 'New Mission');
                              setIsRenaming(false);
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation()
                                  handleStarThread(thread.id, !thread.starred)
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: thread.starred ? '#D4AF37' : 'rgba(255,255,255,0.2)',
                                  fontSize: '12px',
                                  padding: '0 2px',
                                  flexShrink: 0,
                                }}
                              >★</button>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {thread.title || 'Untitled Mission'}
                              </span>
                            </div>
                          </Link>
                        )}
                        {renamingId !== thread.id && (
                          <div className="absolute right-2 hidden group-hover:flex items-center gap-1"
                            style={{ background: '#0A0A0A' }}>
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              await fetch(`/api/chat-threads/${thread.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ archived: true }),
                              });
                              setRecentThreads(prev => prev.filter(t => t.id !== thread.id));
                            }}
                            className="p-1 rounded transition-all hover:opacity-80"
                            title="Archive mission"
                            style={{ color: 'rgba(212,175,55,0.4)' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <rect x="3" y="8" width="18" height="10" rx="5"/>
                              <line x1="8" y1="8" x2="8" y2="6"/>
                              <line x1="12" y1="8" x2="12" y2="4"/>
                              <line x1="16" y1="8" x2="16" y2="6"/>
                            </svg>
                          </button>
                            <button
                              onClick={async (e) => {
                                e.preventDefault();
                                if (!confirm('Delete this mission permanently?')) return;
                                await fetch(`/api/chat-threads/${thread.id}`, { method: 'DELETE' });
                                setRecentThreads(prev => prev.filter(t => t.id !== thread.id));
                              }}
                              className="p-1 rounded transition-all hover:opacity-80"
                              title="Delete mission"
                              style={{ color: 'rgba(255,68,68,0.5)' }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Pinned threads first */}
                {pinnedList.length > 0 && (
                  <>
                    {pinnedList.map((thread) => (
                      <div key={`pin-${thread.id}`} className="group relative flex items-center" style={{ borderLeft: '2px solid rgba(212,175,55,0.35)' }}>
                        <button
                          onClick={() => togglePin(thread.id)}
                          title="Unpin"
                          style={{ position: 'absolute', left: '-2px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#D4AF37', fontSize: '8px', paddingLeft: '4px', zIndex: 1 }}>
                          ●
                        </button>
                        <a href={`/chat/${thread.hero_slug?.toLowerCase()}?thread=${thread.id}`}
                          style={{ flex: 1, padding: '6px 8px 6px 20px', fontSize: '12px', color: 'rgba(208,197,175,0.7)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {thread.title || 'Untitled Mission'}
                        </a>
                      </div>
                    ))}
                    <div style={{ height: '1px', background: 'rgba(212,175,55,0.1)', margin: '4px 8px' }} />
                  </>
                )}
                {unpinnedList.map((thread) => (
                  <div key={thread.id} className="group relative flex items-center">
                    {renamingId === thread.id ? (
                      // Rename input mode
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={async () => {
                          if (isRenaming) return;
                          setIsRenaming(true);
                          if (renameValue.trim() && renameValue.trim() !== thread.title) {
                            await fetch(`/api/chat-threads/${thread.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ title: renameValue.trim() }),
                            });
                            setRecentThreads(prev =>
                              prev.map(t => t.id === thread.id ? { ...t, title: renameValue.trim() } : t)
                            );
                          }
                          setRenamingId(null);
                          setIsRenaming(false);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur();
                          }
                          if (e.key === 'Escape') {
                            setRenamingId(null);
                            setIsRenaming(false);
                          }
                        }}
                        className="flex-1 px-4 py-2 text-xs font-[Rajdhani] bg-transparent outline-none"
                        style={{
                          border: '1px solid rgba(212,175,55,0.3)',
                          color: '#D4AF37',
                        }}
                      />
                    ) : (
                      <Link
                        href={`/chat/${thread.hero_slug?.toLowerCase()}?thread=${thread.id}`}
                        className="flex-1 flex items-center gap-2 px-4 py-2 transition-all text-sm truncate"
                        style={{ color: 'rgba(208,197,175,0.6)' }}
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          setRenamingId(thread.id);
                          setRenameValue(thread.title || 'New Mission');
                          setIsRenaming(false);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation()
                              handleStarThread(thread.id, !thread.starred)
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: thread.starred ? '#D4AF37' : 'rgba(255,255,255,0.2)',
                              fontSize: '12px',
                              padding: '0 2px',
                              flexShrink: 0,
                            }}
                          >★</button>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {thread.title || 'Untitled Mission'}
                          </span>
                        </div>
                      </Link>
                    )}

                    {/* Action buttons — show on hover */}
                    {renamingId !== thread.id && (
                      <div className="absolute right-2 hidden group-hover:flex items-center gap-1"
                        style={{ background: '#0A0A0A' }}>

                        {/* Pin button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(thread.id);
                        }}
                        className="p-1 rounded transition-all hover:opacity-80"
                        title={pinnedThreads.includes(thread.id) ? 'Unpin' : 'Pin thread'}
                        style={{ color: pinnedThreads.includes(thread.id) ? '#D4AF37' : 'rgba(212,175,55,0.35)' }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill={pinnedThreads.includes(thread.id) ? 'currentColor' : 'none'}
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M12 2L12 12M12 12L8 16M12 12L16 16M8 4L16 4"/>
                          <circle cx="12" cy="20" r="2" fill="currentColor"/>
                        </svg>
                      </button>
                        {/* Archive button */}
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          await fetch(`/api/chat-threads/${thread.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ archived: true }),
                          });
                          setRecentThreads(prev => prev.filter(t => t.id !== thread.id));
                        }}
                        className="p-1 rounded transition-all hover:opacity-80"
                        title="Archive mission"
                        style={{ color: 'rgba(212,175,55,0.4)' }}
                      >
                        {/* Cartouche archive icon */}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <rect x="3" y="8" width="18" height="10" rx="5"/>
                          <line x1="8" y1="8" x2="8" y2="6"/>
                          <line x1="12" y1="8" x2="12" y2="4"/>
                          <line x1="16" y1="8" x2="16" y2="6"/>
                        </svg>
                      </button>

                      {/* Delete button */}
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            if (!confirm('Delete this mission permanently?')) return;
                            await fetch(`/api/chat-threads/${thread.id}`, { method: 'DELETE' });
                            setRecentThreads(prev => prev.filter(t => t.id !== thread.id));
                          }}
                          className="p-1 rounded transition-all hover:opacity-80"
                          title="Delete mission"
                          style={{ color: 'rgba(255,68,68,0.5)' }}
                        >
                          {/* Ankh delete icon */}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
                </>
              )}
            </div>
          </>
        )}
      </nav>

      {/* ACCOUNT Section */}
      <div className="p-4 border-t border-[rgba(212,175,55,0.08)] bg-[#0A0A0A] flex flex-col gap-4 shrink-0">
        <div className="px-2 mb-[-8px]">
          <span className="font-orbitron text-empire-xs text-[rgba(212,175,55,0.4)] uppercase">{lang === 'ar' ? t.sidebar.account : 'ACCOUNT'}</span>
        </div>

        <Link
          href="/pricing"
          style={{
            display: 'block',
            fontSize: '9px',
            fontFamily: 'monospace',
            letterSpacing: '0.12em',
            color: '#D4AF37',
            textDecoration: 'none',
            padding: '6px 12px',
            border: '1px solid rgba(212,175,55,0.3)',
            textAlign: 'center',
            marginBottom: '8px',
          }}
        >
          {lang === 'ar' ? t.sidebar.upgradeTier : 'UPGRADE TIER'}
        </Link>

        {energy !== null ? (
          <CreditMeter
            credits={{
              balance: 350,
              totalAllocation: 500, // mock as instructed
              tier: lang === 'ar' ? t.sidebar.tierScout : 'SCOUT', // mock as instructed
              resetDate: new Date().toISOString(),
              usageHistory: []
            }}
          />
        ) : (
          <CreditMeterSkeleton />
        )}

        {user ? (
          <div className="flex items-center justify-between px-2 py-1">
            <Link href="/profile" className="flex items-center gap-2 truncate hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 rounded-sm bg-[#131313] flex items-center justify-center shrink-0 border border-[rgba(212,175,55,0.2)]">
                <User className="w-3 h-3 text-[#D4AF37]" />
              </div>
              <div className="truncate">
                <div className="font-rajdhani text-empire-sm text-[#d0c5af] font-medium truncate">
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

      {/* Language Toggle */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(212,175,55,0.06)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '8px', fontFamily: 'Orbitron, monospace', letterSpacing: '2px', color: 'rgba(212,175,55,0.3)', marginRight: '4px' }}>LANG</span>
        {(['en', 'ar'] as const).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              fontSize: '8px', fontFamily: 'Orbitron, monospace', letterSpacing: '2px',
              padding: '3px 10px', borderRadius: '4px', cursor: 'pointer',
              border: lang === l ? '1px solid #D4AF37' : '1px solid rgba(212,175,55,0.15)',
              background: lang === l ? 'rgba(212,175,55,0.12)' : 'transparent',
              color: lang === l ? '#D4AF37' : 'rgba(212,175,55,0.35)',
              textTransform: 'uppercase',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Legal Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(212,175,55,0.08)', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { href: '/terms', label: 'Terms' },
          { href: '/privacy', label: 'Privacy' },
          { href: '/refund-policy', label: 'Refunds' },
        ].map(link => (
          <a key={link.href} href={link.href} style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.1em', color: 'rgba(208,197,175,0.3)', textDecoration: 'none' }}>
            {link.label}
          </a>
        ))}
      </div>
    </aside>
  );
}