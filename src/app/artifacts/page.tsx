'use client';

import { useState } from 'react';
import { heroOrder } from '@/lib/heroes';
import { heroMeta } from '@/lib/agents';

export default function ArtifactsPage() {
  const [showNewRelic, setShowNewRelic] = useState(false);
  const [selectedHero, setSelectedHero] = useState('');
  const [task, setTask] = useState('');
  const [relicResult, setRelicResult] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  const handleLaunch = async () => {
    if (!selectedHero || !task.trim()) return;
    setExecuting(true);
    setRelicResult(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: task }],
          hero: selectedHero,
          agent: '',
          threadId: null,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          // Parse SSE chunks
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const text = JSON.parse(line.slice(2));
                fullText += text;
                setRelicResult(fullText);
              } catch {}
            }
          }
        }
      }
    } catch (err) {
      setRelicResult(`Error: ${(err as Error).message}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#d0c5af] font-sans p-6 md:p-12 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-4xl mx-auto relative z-10 space-y-8 mt-4">

      {/* Header */}
      <div className="mb-10 border-b pb-8" style={{ borderColor: 'rgba(212,175,55,0.08)' }}>
        <p className="font-[Orbitron] text-[9px] tracking-[5px] uppercase mb-3"
          style={{ color: 'rgba(212,175,55,0.5)' }}>SUPER SKILLS</p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[Orbitron] text-4xl font-black tracking-tighter mb-2"
              style={{ color: '#D4AF37' }}>EMPIRE RELICS</h1>
            <p className="font-[Rajdhani] text-lg" style={{ color: '#d0c5af' }}>
              Your generated apps, documents, and outputs.
            </p>
          </div>
          <button
            onClick={() => setShowNewRelic(true)}
            className="font-[Orbitron] text-[9px] tracking-[3px] uppercase px-6 py-3 transition-all"
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #FBBF24)',
              color: '#0A0A0A',
              fontWeight: 700,
            }}>
            + NEW RELIC
          </button>
        </div>
      </div>

      {/* New Relic creation panel */}
      {showNewRelic && (
        <div className="mb-10 p-6 flex flex-col gap-6"
          style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="flex items-center justify-between">
            <p className="font-[Orbitron] text-sm font-bold" style={{ color: '#D4AF37' }}>
              NEW RELIC MISSION
            </p>
            <button onClick={() => setShowNewRelic(false)}
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Step 1: Select hero */}
          <div>
            <p className="font-[Orbitron] text-[8px] tracking-[3px] uppercase mb-3"
              style={{ color: 'rgba(212,175,55,0.5)' }}>
              STEP 1: SELECT YOUR HERO
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {heroOrder.map(slug => {
                const meta = heroMeta[slug as keyof typeof heroMeta];
                return (
                  <button key={slug} onClick={() => setSelectedHero(slug)}
                    className="p-3 text-left transition-all"
                    style={{
                      background: selectedHero === slug ? `${meta?.color_signature}15` : 'transparent',
                      border: `1px solid ${selectedHero === slug ? meta?.color_signature : 'rgba(212,175,55,0.1)'}`,
                    }}>
                    <div className="w-1.5 h-1.5 rounded-full mb-2"
                      style={{ background: meta?.color_signature }} />
                    <p className="font-[Orbitron] text-[9px] font-bold"
                      style={{ color: selectedHero === slug ? meta?.color_signature : '#ffffff' }}>
                      {meta?.name}
                    </p>
                    <p className="font-[Rajdhani] text-[10px] mt-0.5"
                      style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {meta?.archetype}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Describe task */}
          <div>
            <p className="font-[Orbitron] text-[8px] tracking-[3px] uppercase mb-3"
              style={{ color: 'rgba(212,175,55,0.5)' }}>
              STEP 2: DESCRIBE YOUR RELIC
            </p>
            <textarea
              value={task}
              onChange={e => setTask(e.target.value)}
              placeholder="Describe what you want to create: a report, a document, a tool, an analysis..."
              rows={3}
              className="w-full px-4 py-3 font-[Rajdhani] text-base resize-none"
              style={{
                background: '#0A0A0A',
                border: '1px solid rgba(212,175,55,0.15)',
                color: '#d0c5af',
                outline: 'none',
              }}
            />
          </div>

          <button
            onClick={handleLaunch}
            disabled={executing || !selectedHero || !task.trim()}
            className="font-[Orbitron] text-[9px] tracking-[3px] uppercase px-8 py-3 transition-all disabled:opacity-40 self-start"
            style={{
              background: '#D4AF37',
              color: '#0A0A0A',
              fontWeight: 700,
            }}>
            {executing ? 'EXECUTING MISSION...' : 'LAUNCH MISSION'}
          </button>

          {(executing || relicResult) && (
            <div className="mt-8 p-6"
              style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.15)' }}>
              <p className="font-[Orbitron] text-[8px] tracking-[3px] uppercase mb-4"
                style={{ color: 'rgba(212,175,55,0.5)' }}>
                {executing ? 'EXECUTING MISSION...' : 'RELIC OUTPUT'}
              </p>
              {executing && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D4AF37' }} />
                  <span className="font-[Rajdhani] text-sm" style={{ color: '#d0c5af' }}>
                    Agent is crafting your relic...
                  </span>
                </div>
              )}
              {relicResult && (
                <div className="font-[Rajdhani] text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: '#d0c5af' }}>
                  {relicResult}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-24 gap-4"
        style={{ border: '1px solid rgba(212,175,55,0.08)', background: '#111111' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
          stroke="rgba(212,175,55,0.3)" strokeWidth="1" strokeLinecap="round">
          <circle cx="12" cy="7" r="4"/>
          <line x1="12" y1="11" x2="12" y2="22"/>
          <line x1="7" y1="15" x2="17" y2="15"/>
        </svg>
        <p className="font-[Orbitron] text-xs tracking-widest uppercase"
          style={{ color: 'rgba(212,175,55,0.4)' }}>
          NO RELICS CREATED YET
        </p>
        <p className="font-[Rajdhani] text-sm text-center max-w-xs"
          style={{ color: '#d0c5af', opacity: 0.5 }}>
          Click NEW RELIC to start a mission and generate your first empire relic.
        </p>
      </div>
      </div>
    </main>
  );
}
