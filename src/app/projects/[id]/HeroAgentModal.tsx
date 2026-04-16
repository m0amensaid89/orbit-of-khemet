'use client'

import React, { useState } from 'react'
import { X, Search } from 'lucide-react'
import { getHero, heroOrder } from '@/lib/heroes'
import { heroAgents } from '@/lib/agents'

type HeroAgentModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (heroSlug: string, agentId: string | null, agentName: string | null) => void
}

export default function HeroAgentModal({ isOpen, onClose, onSelect }: HeroAgentModalProps) {
  const [search, setSearch] = useState('')
  const [collapsedHeroes, setCollapsedHeroes] = useState<Set<string>>(new Set())

  if (!isOpen) return null

  const toggleHero = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newCollapsed = new Set(collapsedHeroes)
    if (newCollapsed.has(slug)) newCollapsed.delete(slug)
    else newCollapsed.add(slug)
    setCollapsedHeroes(newCollapsed)
  }

  const filteredHeroes = heroOrder.filter(slug => {
    const hero = getHero(slug)
    const agents = heroAgents[slug] || []

    if (!hero) return false

    const matchesSearch = (text: string) => text.toLowerCase().includes(search.toLowerCase())

    const heroMatches = matchesSearch(hero.name) || matchesSearch(hero.role)
    const agentMatches = agents.some(a => matchesSearch(a.name) || matchesSearch(a.role_summary))

    return heroMatches || agentMatches
  })

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] border border-[#D4AF37] w-full max-w-3xl max-h-[90vh] flex flex-col relative shadow-[0_0_40px_rgba(212,175,55,0.1)]">

        {/* Header */}
        <div className="p-6 border-b border-[rgba(212,175,55,0.2)] flex justify-between items-center bg-[rgba(212,175,55,0.02)]">
          <h2 className="font-orbitron tracking-widest text-[#D4AF37] text-lg uppercase flex items-center gap-3">
            <span className="text-[#D4AF37]">✦</span> SELECT YOUR OPERATIVE
          </h2>
          <button
            onClick={onClose}
            className="text-[#d0c5af]/50 hover:text-[#D4AF37] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[rgba(212,175,55,0.1)]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d0c5af]/40" />
            <input
              type="text"
              placeholder="Search heroes or agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] text-white py-2 pl-10 pr-4 font-orbitron text-xs tracking-wider outline-none transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-8 custom-scrollbar">
          {filteredHeroes.length === 0 ? (
            <div className="text-center text-[#d0c5af]/50 font-roboto py-8">
              No operatives found matching &quot;{search}&quot;
            </div>
          ) : (
            filteredHeroes.map(slug => {
              const hero = getHero(slug)
              if (!hero) return null

              const allAgents = heroAgents[slug] || []
              const visibleAgents = search
                ? allAgents.filter(a =>
                    a.name.toLowerCase().includes(search.toLowerCase()) ||
                    a.role_summary.toLowerCase().includes(search.toLowerCase()) ||
                    hero.name.toLowerCase().includes(search.toLowerCase())
                  )
                : allAgents

              if (visibleAgents.length === 0 && search && !hero.name.toLowerCase().includes(search.toLowerCase())) return null

              const isCollapsed = collapsedHeroes.has(slug) && !search

              return (
                <div key={slug} className="space-y-4">
                  <div
                    className="flex items-center gap-3 cursor-pointer group select-none"
                    onClick={(e) => toggleHero(slug, e)}
                  >
                    <div
                      className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-transform group-hover:scale-125"
                      style={{ backgroundColor: hero.accentColor, color: hero.accentColor }}
                    />
                    <h3 className="font-orbitron tracking-widest text-white text-lg group-hover:text-[#D4AF37] transition-colors">
                      {hero.name}
                    </h3>
                    <span className="text-[#d0c5af]/50 font-roboto text-sm ml-2">
                      {hero.role}
                    </span>
                    <span className="bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] text-[#D4AF37] text-xs font-orbitron px-2 py-1 hover:bg-[rgba(212,175,55,0.2)] ml-auto" onClick={(e) => { e.stopPropagation(); onSelect(slug, null, null); }}>
                      DIRECT CHAT
                    </span>
                    <span className="bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] text-[#D4AF37] text-xs font-orbitron px-2 py-1 ml-2">
                      {allAgents.length} AGENTS {isCollapsed ? '+' : '-'}
                    </span>
                  </div>

                  {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6 border-l border-[rgba(212,175,55,0.1)] ml-1.5 transition-all">
                    {visibleAgents.map(agent => (
                      <div
                        key={agent.id}
                        onClick={() => onSelect(slug, agent.id, agent.name)}
                        className="bg-[rgba(212,175,55,0.03)] border border-[rgba(212,175,55,0.12)] p-3 cursor-pointer hover:bg-[rgba(212,175,55,0.08)] hover:border-[#D4AF37] transition-all group"
                      >
                        <div className="font-orbitron text-sm text-[#d0c5af] group-hover:text-white mb-1">
                          {agent.name}
                        </div>
                        <div className="font-roboto text-xs text-[#d0c5af]/60">
                          {agent.role_summary}
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
