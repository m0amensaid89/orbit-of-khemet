"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SavedOutput {
  id: string;
  heroSlug: string;
  agentName: string;
  prompt: string;
  output: string;
  type: string;
  savedAt: string;
  starred: boolean;
}

const HERO_COLORS: Record<string, string> = {
  thoren: '#2563EB', ramet: '#D4AF37', nexar: '#06B6D4',
  lyra: '#7C3F4E', kairo: '#B8860B', nefra: '#047857', horusen: '#1E40AF',
};

export default function GalleryPage() {
  const [outputs, setOutputs] = useState<SavedOutput[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('orbit_gallery') || '[]');
      setOutputs(saved);
    } catch { setOutputs([]); }
  }, []);

  const save = (items: SavedOutput[]) => {
    setOutputs(items);
    localStorage.setItem('orbit_gallery', JSON.stringify(items));
  };

  const toggleStar = (id: string) => {
    save(outputs.map(o => o.id === id ? { ...o, starred: !o.starred } : o));
  };

  const deleteOutput = (id: string) => {
    save(outputs.filter(o => o.id !== id));
  };

  const heroes = ['all', ...Array.from(new Set(outputs.map(o => o.heroSlug)))];
  const filtered = outputs.filter(o => {
    const matchHero = filter === 'all' || o.heroSlug === filter;
    const matchSearch = !search || o.prompt.toLowerCase().includes(search.toLowerCase()) ||
      o.agentName.toLowerCase().includes(search.toLowerCase());
    return matchHero && matchSearch;
  });
  const starred = filtered.filter(o => o.starred);
  const rest = filtered.filter(o => !o.starred);
  const sorted = [...starred, ...rest];

  const accent = '#D4AF37';
  const labelStyle = { fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(212,175,55,0.4)' };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', padding: '40px 32px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ ...labelStyle, marginBottom: '12px' }}>ORBIT OF KHEMET</div>
        <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '28px', color: accent, marginBottom: '8px', fontWeight: 400 }}>
          OUTPUT GALLERY
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(208,197,175,0.45)', letterSpacing: '0.04em' }}>
          Saved agent outputs. Star what matters, archive what does not.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search outputs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.15)', color: '#d0c5af', fontFamily: 'Roboto, sans-serif', fontSize: '13px', padding: '9px 14px', borderRadius: '4px', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {heroes.map(h => (
            <button key={h} onClick={() => setFilter(h)}
              style={{ fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '0.1em', padding: '6px 12px', border: `1px solid ${filter === h ? accent : 'rgba(212,175,55,0.2)'}`, background: filter === h ? 'rgba(212,175,55,0.1)' : 'transparent', color: filter === h ? accent : 'rgba(208,197,175,0.5)', cursor: 'pointer', borderRadius: '4px', textTransform: 'uppercase' }}>
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {outputs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '16px', color: 'rgba(212,175,55,0.3)', marginBottom: '12px' }}>
            THE GALLERY AWAITS
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(208,197,175,0.3)', marginBottom: '24px' }}>
            Save outputs from your agent missions to build your gallery.
          </p>
          <Link href="/hub" style={{ fontFamily: 'Orbitron, monospace', fontSize: '10px', letterSpacing: '0.12em', color: '#D4AF37', textDecoration: 'none', border: '1px solid rgba(212,175,55,0.3)', padding: '10px 20px' }}>
            BEGIN A MISSION
          </Link>
        </div>
      )}

      {/* Gallery grid */}
      {sorted.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {sorted.map(output => {
            const color = HERO_COLORS[output.heroSlug] || accent;
            const isOpen = expanded === output.id;
            return (
              <div key={output.id}
                style={{ background: 'rgba(212,175,55,0.02)', border: `1px solid ${output.starred ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.1)'}`, borderRadius: '4px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                {/* Card header */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(212,175,55,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(212,175,55,0.5)' }}>
                        {output.heroSlug.toUpperCase()} / {output.agentName.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#d0c5af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {output.prompt}
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(208,197,175,0.3)', marginTop: '4px', fontFamily: 'monospace' }}>
                      {new Date(output.savedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '8px', flexShrink: 0 }}>
                    <button onClick={() => toggleStar(output.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: output.starred ? accent : 'rgba(212,175,55,0.3)', fontSize: '14px', padding: '2px' }}>★</button>
                    <button onClick={() => deleteOutput(output.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,80,80,0.4)', fontSize: '12px', padding: '2px' }}>✕</button>
                  </div>
                </div>
                {/* Preview */}
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(208,197,175,0.6)', lineHeight: '1.6', maxHeight: isOpen ? 'none' : '72px', overflow: isOpen ? 'visible' : 'hidden', transition: 'max-height 0.3s' }}>
                    {output.output}
                  </div>
                  {output.output.length > 200 && (
                    <button onClick={() => setExpanded(isOpen ? null : output.id)}
                      style={{ fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(212,175,55,0.5)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px', padding: 0 }}>
                      {isOpen ? 'COLLAPSE' : 'READ MORE'}
                    </button>
                  )}
                </div>
                {/* Copy */}
                <div style={{ padding: '8px 16px 12px', borderTop: '1px solid rgba(212,175,55,0.05)' }}>
                  <button
                    onClick={() => navigator.clipboard.writeText(output.output)}
                    style={{ fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(212,175,55,0.5)', background: 'transparent', border: '1px solid rgba(212,175,55,0.15)', padding: '4px 10px', cursor: 'pointer', borderRadius: '3px' }}>
                    COPY OUTPUT
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
