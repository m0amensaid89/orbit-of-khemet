"use client";
import { useLanguage } from "@/hooks/useLanguage";

import { useState, useMemo, useEffect } from "react";
import { heroAgents, heroMeta, getAgentLinkedTool } from "@/lib/agents";
import { getCustomAgentsForHero, type CustomAgent } from "@/lib/custom-agents";
import Link from "next/link";

type Props = {
  slug: string;
  accentColor: string;
};

export function AgentCommandCenter({ slug, accentColor }: Props) {
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isCommander, setIsCommander] = useState(false);

  const meta = heroMeta[slug as keyof typeof heroMeta];
  const heroColor = meta?.color_signature || accentColor;

  useEffect(() => {
    setIsCommander(localStorage.getItem("orbit_plan") === "commander");
    setCustomAgents(getCustomAgentsForHero(slug));
  }, [slug]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("forged") === "true") {
      setCustomAgents(getCustomAgentsForHero(slug));
    }
  }, [slug]);

  const allAgents = useMemo(() => {
    return [...customAgents, ...(heroAgents[slug as keyof typeof heroAgents] || [])];
  }, [customAgents, slug]);

  const categories = useMemo(() => {
    const [lang] = useLanguage();
  const isAr = lang === 'ar';
  const cats = Array.from(new Set(allAgents.map(a => a.category)));
  const catAr: Record<string, string> = {
    'ALL': 'الكل',
    'Strategy': 'استراتيجية', 'Finance': 'مالية', 'Finance & Capital': 'مالية ورأس المال',
    'Legal': 'قانوني', 'Compliance': 'امتثال', 'Analytics': 'تحليلات',
    'Writing': 'كتابة', 'Content': 'محتوى', 'Marketing': 'تسويق',
    'Growth': 'نمو', 'Social Media': 'وسائل التواصل', 'SEO': 'تحسين محركات البحث',
    'Operations': 'عمليات', 'Project Management': 'إدارة مشاريع', 'HR': 'موارد بشرية',
    'Sales': 'مبيعات', 'CRM': 'علاقات العملاء', 'Outreach': 'تواصل',
    'AI': 'ذكاء اصطناعي', 'Tech': 'تقنية', 'Automation': 'أتمتة',
    'Design': 'تصميم', 'UX': 'تجربة المستخدم', 'Creative': 'إبداع',
    'Research': 'بحث', 'Intelligence': 'استخبارات', 'Learning': 'تعلم',
    'Gamification': 'تلعيب', 'Training': 'تدريب', 'eLearning': 'تعلم إلكتروني',
  };
    return ["All", ...cats];
  }, [allAgents]);

  const filteredAgents = useMemo(() => {
    if (selectedCategory === "All") return allAgents;
    return allAgents.filter(a => a.category === selectedCategory);
  }, [allAgents, selectedCategory]);

  return (
    <section id="agent-grid" className="w-full px-6 py-12" style={{ background: '#0A0A0A' }}>

      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-[Orbitron] text-[9px] tracking-[5px] uppercase mb-1"
            style={{ color: 'rgba(212,175,55,0.5)' }}>{isAr ? 'قائمة الوكلاء' : 'SQUAD ROSTER'}</p>
          <h2 className="font-[Orbitron] text-2xl font-bold" style={{ color: '#D4AF37' }}>
            {isAr ? `وكلاء ${meta?.name || slug.toUpperCase()}` : `${meta?.name || slug.toUpperCase()} AGENTS`}
          </h2>
        </div>
        {isCommander && (
          <Link href={`/forge?hero=${slug}`}>
            <button className="flex items-center gap-2 font-[Orbitron] text-[9px] tracking-[2px] uppercase px-4 py-2 transition-all"
              style={{
                border: `1px solid ${heroColor}40`,
                color: heroColor,
                background: `${heroColor}08`
              }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {/* Scarab / plus with circle center */}
                <circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="2" x2="12" y2="9"/>
                <line x1="12" y1="15" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="9" y2="12"/>
                <line x1="15" y1="12" x2="22" y2="12"/>
              </svg>
              {isAr ? 'إنشاء وكيل' : 'FORGE AGENT'}
            </button>
          </Link>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map(cat => (
          <button
            key={isAr ? (catAr[cat] || cat) : cat}
            onClick={() => setSelectedCategory(cat)}
              className="font-[Orbitron] text-empire-xs uppercase px-3 py-1.5 transition-all"
            style={{
              background: selectedCategory === cat ? heroColor : 'transparent',
              color: selectedCategory === cat ? '#0A0A0A' : heroColor,
              border: `1px solid ${heroColor}40`,
              fontWeight: selectedCategory === cat ? 700 : 400,
            }}>
            {isAr ? (catAr[cat] || cat) : cat}
          </button>
        ))}
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAgents.map((agent) => {
          const linkedTool = getAgentLinkedTool(agent);
          const agentHref = linkedTool
            ? `/${linkedTool}?from=${slug}&agent=${agent.id}`
            : `/chat/${slug}?agent=${agent.id}`;
          return (
          <Link
            key={agent.id}
            href={agentHref}
            className="group block">
            <div
              className="h-full p-5 transition-all duration-200 cursor-pointer"
              style={{
                background: '#111111',
                border: `1px solid rgba(212,175,55,0.08)`,
                borderLeft: `3px solid ${heroColor}`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${heroColor}20`;
                (e.currentTarget as HTMLDivElement).style.borderColor = `${heroColor}40`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,175,55,0.08)';
              }}>

              {/* Category badge */}
              <div className="mb-3">
                <span className="font-[Orbitron] text-empire-xs uppercase px-2 py-0.5"
                  style={{
                    background: `${heroColor}12`,
                    color: heroColor,
                    border: `1px solid ${heroColor}30`
                  }}>
                  {isAr ? (catAr[agent.category] || agent.category) : agent.category}
                </span>
              </div>

              {/* Agent name */}
              <h3 className="font-[Orbitron] text-empire-lg font-bold mb-1 group-hover:text-[#D4AF37] transition-colors"
                style={{ color: '#ffffff' }}>
                {agent.name}
              </h3>

              {/* Role */}
              <p className="font-[Rajdhani] text-empire-xs mb-3" style={{ color: 'rgba(212,175,55,0.7)' }}>
                {agent.role_summary}
              </p>

              {/* Description */}
              <p className="font-[Rajdhani] text-empire-sm leading-relaxed mb-4"
                style={{ color: '#d0c5af', opacity: 0.7 }}>
                {agent.description}
              </p>

              {/* Activate button */}
              <div className="flex items-center gap-2 mt-auto pt-2"
                style={{ borderTop: `1px solid ${heroColor}15` }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: heroColor }}>
                  {/* Ankh symbol */}
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="11" x2="12" y2="22" stroke="currentColor" strokeWidth="2"/>
                  <line x1="7" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span className="font-[Orbitron] text-[8px] tracking-[2px] uppercase"
                  style={{ color: heroColor }}>
                  ACTIVATE AGENT
                </span>
              </div>

              {(() => {
                const tool = getAgentLinkedTool(agent);
                if (!tool) return null;
                const toolLabels: Record<string, string> = {
                  'autopilot': 'AUTO-PILOT',
                  'ui-builder': 'UI BUILDER',
                  'sentinel': 'CODE SENTINEL',
                  'brain': 'KHEMET BRAIN',
                };
                return (
                  <div className="mt-2">
                    <span className="font-[Orbitron] text-[7px] tracking-[2px] uppercase px-2 py-0.5"
                      style={{
                        background: 'rgba(212,175,55,0.08)',
                        color: 'rgba(212,175,55,0.6)',
                        border: '1px solid rgba(212,175,55,0.15)'
                      }}>
                      ✦ {toolLabels[tool]}
                    </span>
                  </div>
                );
              })()}
            </div>
          </Link>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-20">
          <p className="font-[Orbitron] text-xs tracking-widest uppercase"
            style={{ color: 'rgba(212,175,55,0.3)' }}>
            NO AGENTS IN THIS CATEGORY
          </p>
        </div>
      )}
    </section>
  );
}
