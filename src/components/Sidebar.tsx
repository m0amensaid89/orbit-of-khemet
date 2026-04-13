"use client";

import Link from "next/link";


import { usePathname } from "next/navigation";
import { Zap, Shield, Cpu, LogIn, LogOut, User, Wand2, Compass, Hammer, Gem, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";


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

  const handleStarThread = async (threadId: string, starred: boolean) => {
    await fetch('/api/chat-history/star', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, starred }),
    })
    setRecentThreads(prev =>
      prev.map(t => t.id === threadId ? { ...t, starred } : t)
    )
  }

  const supabase = createClient();


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

        const { data: threads } = await supabase
          .from('chat_threads')
          .select('id, title, hero_slug, updated_at, starred')
          .eq('user_id', session.user.id)
          .or('archived.is.null,archived.eq.false')
          .order('updated_at', { ascending: false })
          .limit(10);

        if (threads) {
          setRecentThreads(threads);
        }
      }

      // Initial credits fetch
      try {
        const res = await fetch('/api/credits');
        const data = await res.json();
        if (data && typeof data.credits === 'number') {
          setEnergy(data.credits);
        }
      } catch (err) {
        console.error("Failed to fetch updated credits:", err);
      }
    }

    fetchSessionAndEnergy();

    const handleCreditsUpdate = async () => {
      try {
        const res = await fetch('/api/credits');
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
            .select('id, title, hero_slug, updated_at, starred')
            .eq('user_id', session.user.id)
            .or('archived.is.null,archived.eq.false')
            .order('updated_at', { ascending: false })
            .limit(10);
          if (threads) {
            setRecentThreads(threads);
          }
        } else {
          setProfile(null);
          setRecentThreads([]);
        }
        try {
          const res = await fetch('/api/credits');
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

  return (
    <aside className="w-[260px] h-screen bg-[#0A0A0A] hidden md:flex flex-col sticky top-0 shrink-0 text-[#d0c5af] font-rajdhani">
      {/* Top Logo Area */}
      <Link href="/" className="h-16 border-b border-[#D4AF37]/20 flex items-center px-6 gap-3 shrink-0">
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
            <span className="font-orbitron text-empire-xs text-[rgba(212,175,55,0.4)] uppercase">WORKSPACE</span>
          </div>
          <div className="px-3 space-y-1">
            <Link href="/hub" className={navItemClass("/hub", true)}>
              <Compass className="w-4 h-4 z-10" />
              <span className="font-medium text-empire-sm z-10">New Mission</span>
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
              style={{ color: 'rgba(212,175,55,0.4)' }}>SUPER SKILLS</span>
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
                <span className="font-medium text-empire-sm z-10">Agent Forge</span>
              </Link>
              <Link href="/autopilot" className={navItemClass("/autopilot")}>
                <Cpu className="w-4 h-4 z-10" />
                <span className="font-medium text-empire-sm z-10">Auto-Pilot</span>
              </Link>
              <Link href="/ui-builder" className={navItemClass("/ui-builder")}>
                <Wand2 className="w-4 h-4 z-10" />
                <span className="font-medium text-empire-sm z-10">UI Builder</span>
              </Link>
              <Link href="/sentinel" className={navItemClass("/sentinel")}>
                <Shield className="w-4 h-4 z-10" />
                <span className="font-medium text-empire-sm z-10">Code Sentinel</span>
              </Link>
              <Link href="/browser" className={navItemClass("/browser")}>
                <Globe className="w-4 h-4 z-10" />
                <span className="font-medium text-empire-sm z-10">Browser Control</span>
              </Link>
              <Link href="/artifacts" className={navItemClass("/artifacts")}>
                <Gem className="w-4 h-4 z-10" />
                <span className="font-medium text-empire-sm z-10">Empire Relics</span>
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
            }}>PROJECTS</span>
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
            <div key={p.id}
              onClick={() => setSelectedProject(p.id)}
              style={{
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
              }}
            >
              ✦ {p.name}
            </div>
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

        {/* MISSION LOG Section */}
        {user && recentThreads.length > 0 && (
          <>
            <div className="h-[1px] bg-[rgba(212,175,55,0.08)] mx-3" />
            <div>
              <button
                onClick={() => setMissionLogOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-6 py-3 transition-all hover:bg-[rgba(212,175,55,0.03)] mb-1"
              >
                <span className="font-orbitron text-empire-xs uppercase text-[rgba(212,175,55,0.4)]">MISSION LOG</span>
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
                            href={`/chat/${thread.hero_slug}?thread=${thread.id}`}
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
                {filteredThreads.map((thread) => (
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
                        href={`/chat/${thread.hero_slug}?thread=${thread.id}`}
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
          <span className="font-orbitron text-empire-xs text-[rgba(212,175,55,0.4)] uppercase">ACCOUNT</span>
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
          UPGRADE TIER
        </Link>

        <div className="bg-[#131313] rounded-md p-3 border border-[rgba(212,175,55,0.08)] relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <Zap className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-empire-xs text-[#d0c5af] font-orbitron uppercase">GRID ENERGY</span>
          </div>
          <div className="text-empire-lg font-orbitron font-bold text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.2)] relative z-10">
            {energy === null ? '...' : energy.toLocaleString()}
          </div>
          <div className="w-full bg-[#0A0A0A] h-1 mt-2 rounded-full overflow-hidden relative z-10 border border-[rgba(212,175,55,0.08)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ((energy || 0) / 100000) * 100)}%` }}
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
    </aside>
  );
}