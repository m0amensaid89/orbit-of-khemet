'use client';

import { useState } from 'react';

export default function BrowserPage() {
  const [task, setTask] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    task: string;
    finalUrl?: string;
    finalTitle?: string;
    screenshots?: string[];
    log?: string[];
    error?: string;
  } | null>(null);

  const execute = async () => {
    if (!task.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/browser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, url: url.trim() || undefined }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, task, error: 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d0c5af] font-sans p-6 md:p-12 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-4xl mx-auto relative z-10 space-y-8 mt-4">

      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="inline-block px-3 py-1 mb-2 border border-[#D4AF37]/30 bg-[#D4AF37]/10 rounded font-orbitron text-[10px] tracking-widest text-[#D4AF37]">
          EMPIRE ENGINE
        </div>
        <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D1] to-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          BROWSER CONTROL
        </h1>
        <h2 className="text-xl md:text-2xl font-rajdhani font-semibold text-[#d0c5af]/80 tracking-widest uppercase">
          Command a real browser. Describe your task and watch the agent execute it.
        </h2>
      </div>

      {/* Input panel */}
      <div className="max-w-4xl mx-auto mb-8 p-8 flex flex-col"
        style={{
          background: 'rgba(212,175,55,0.02)',
          border: '1px solid rgba(212,175,55,0.12)',
        }}>

        {/* URL input */}
        <div className="mb-6">
          <label className="font-[Orbitron] text-[10px] tracking-[4px] uppercase block mb-2"
            style={{ color: 'rgba(212,175,55,0.6)' }}>
            REPOSITORY URL
          </label>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-5 py-4 font-mono text-sm"
            style={{
              background: 'rgba(212,175,55,0.03)',
              border: '1px solid rgba(212,175,55,0.2)',
              color: '#d0c5af',
              outline: 'none',
            }}
          />
        </div>

        {/* Task input — rename label to CUSTOM TASK */}
        <div className="mb-6">
          <label className="font-[Orbitron] text-[10px] tracking-[4px] uppercase block mb-2"
            style={{ color: 'rgba(212,175,55,0.6)' }}>
            CUSTOM TASK
          </label>
          <textarea
            value={task}
            onChange={e => setTask(e.target.value)}
            placeholder="OR DESCRIBE A CUSTOM TASK ..."
            rows={4}
            className="w-full px-5 py-4 font-mono text-sm resize-none"
            style={{
              background: 'rgba(212,175,55,0.03)',
              border: '1px solid rgba(212,175,55,0.2)',
              color: '#d0c5af',
              outline: 'none',
            }}
          />
        </div>

        {/* Execute button — same style as DEPLOY SENTINEL */}
        <button
          onClick={execute}
          disabled={loading || !task.trim()}
          className="w-full font-[Orbitron] text-sm tracking-[4px] uppercase py-4 transition-all disabled:opacity-40 flex items-center justify-center gap-3 mt-2"
          style={{
            background: 'transparent',
            border: '1px solid rgba(212,175,55,0.3)',
            color: '#D4AF37',
          }}>
          {/* Globe SVG icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          {loading ? 'AGENT EXECUTING...' : 'EXECUTE MISSION'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="max-w-4xl mx-auto">

          {/* Status */}
          <div className="mb-6 p-4"
            style={{
              background: result.success ? 'rgba(212,175,55,0.06)' : 'rgba(255,68,68,0.06)',
              border: `1px solid ${result.success ? 'rgba(212,175,55,0.2)' : 'rgba(255,68,68,0.2)'}`,
            }}>
            <p className="font-[Orbitron] text-[9px] tracking-[3px] uppercase mb-1"
              style={{ color: result.success ? '#D4AF37' : '#FF4444' }}>
              {result.success ? 'MISSION COMPLETE' : 'MISSION FAILED'}
            </p>
            {result.finalTitle && (
              <p className="font-[Rajdhani] text-sm" style={{ color: '#d0c5af' }}>
                Page: {result.finalTitle}
              </p>
            )}
            {result.finalUrl && (
              <p className="font-[Rajdhani] text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {result.finalUrl}
              </p>
            )}
            {result.error && (
              <p className="font-[Rajdhani] text-sm" style={{ color: '#FF4444' }}>
                {result.error}
              </p>
            )}
          </div>

          {/* Execution log */}
          {result.log && result.log.length > 0 && (
            <div className="mb-6">
              <p className="font-[Orbitron] text-[8px] tracking-[3px] uppercase mb-3"
                style={{ color: 'rgba(212,175,55,0.4)' }}>
                EXECUTION LOG
              </p>
              <div className="p-4" style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.08)' }}>
                {result.log.map((line, i) => (
                  <div key={i} className="flex items-start gap-3 mb-1">
                    <span style={{ color: '#D4AF37', fontSize: '10px', marginTop: '3px' }}>✦</span>
                    <span className="font-[Rajdhani] text-sm" style={{ color: '#d0c5af' }}>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screenshots */}
          {result.screenshots && result.screenshots.length > 0 && (
            <div>
              <p className="font-[Orbitron] text-[8px] tracking-[3px] uppercase mb-3"
                style={{ color: 'rgba(212,175,55,0.4)' }}>
                CAPTURED FRAMES ({result.screenshots.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.screenshots.map((shot, i) => (
                  <div key={i} style={{ border: '1px solid rgba(212,175,55,0.1)' }}>
                    <div className="px-3 py-1.5"
                      style={{ background: 'rgba(212,175,55,0.04)', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
                      <span className="font-[Orbitron] text-[7px] tracking-[2px] uppercase"
                        style={{ color: 'rgba(212,175,55,0.4)' }}>
                        FRAME {i + 1}
                      </span>
                    </div>
                    <img
                      src={`data:image/jpeg;base64,${shot}`}
                      alt={`Frame ${i + 1}`}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
