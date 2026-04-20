'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { skillsRegistry } from '@/lib/agent-skills'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

const NAV_ITEMS = [
  { label: 'Hub', href: '/hub', category: 'NAVIGATE' },
  { label: 'Brain', href: '/brain', category: 'NAVIGATE' },
  { label: 'Gallery', href: '/gallery', category: 'NAVIGATE' },
  { label: 'Settings', href: '/settings/guardrails', category: 'NAVIGATE' },
]

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const allAgents = useMemo(() => Object.values(skillsRegistry), [])

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return NAV_ITEMS.slice(0, 6).map(n => ({ ...n, type: 'nav' as const }))

    const agents = allAgents
      .filter(a =>
        a.name.toLowerCase().includes(q) ||
        (a.capabilities || []).some((c: string) => c.toLowerCase().includes(q)) ||
        (a.routingHints || []).some((h: string) => h.toLowerCase().includes(q))
      )
      .slice(0, 6)
      .map(a => ({
        label: a.name,
        href: `/chat?agent=${a.slug}&hero=${a.hero.toLowerCase()}`,
        category: a.hero,
        type: 'agent' as const,
      }))

    const navs = NAV_ITEMS
      .filter(n => n.label.toLowerCase().includes(q))
      .map(n => ({ ...n, type: 'nav' as const }))

    return [...navs, ...agents].slice(0, 8)
  }, [query, allAgents])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (results[selected]) { router.push(results[selected].href); onClose() }
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [open, results, selected, router, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '15vh',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '560px',
          background: '#111111',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            placeholder="Search agents, pages, actions..."
            style={{
              width: '100%', padding: '16px', paddingRight: '80px',
              background: 'transparent', border: 'none', outline: 'none',
              color: '#d0c5af', fontSize: '14px', fontFamily: 'Roboto, sans-serif',
              boxSizing: 'border-box',
            }}
          />
          <span style={{
            position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '9px', fontFamily: 'Orbitron, monospace', letterSpacing: '1px',
            color: 'rgba(212,175,55,0.3)',
          }}>
            ESC TO CLOSE
          </span>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(208,197,175,0.3)', fontSize: '11px', fontFamily: 'Orbitron, monospace', letterSpacing: '2px' }}>
              NO RESULTS
            </div>
          ) : results.map((item, i) => (
            <div
              key={item.href}
              onClick={() => { router.push(item.href); onClose() }}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '12px',
                background: i === selected ? 'rgba(212,175,55,0.06)' : 'transparent',
                borderLeft: i === selected ? '2px solid #D4AF37' : '2px solid transparent',
                transition: 'all 0.1s',
              }}
              onMouseEnter={() => setSelected(i)}
            >
              <span style={{ fontSize: '8px', fontFamily: 'Orbitron, monospace', letterSpacing: '2px', color: 'rgba(212,175,55,0.4)', minWidth: '60px' }}>
                {item.category}
              </span>
              <span style={{ fontSize: '13px', fontFamily: 'Roboto, sans-serif', color: i === selected ? '#D4AF37' : '#d0c5af' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
