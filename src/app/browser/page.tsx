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
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10">
        <p className="font-[Orbitron] text-[9px] tracking-[5px] uppercase mb-2"
          style={{ color: 'rgba(212,175,55,0.5)' }}>
          BUILD TOOLS
        </p>
        <h1 className="font-[Orbitron] text-3xl font-black mb-2"
          style={{ color: '#D4AF37' }}>
          BROWSER CONTROL
        </h1>
        <p className="font-[Rajdhani] text-base"
          style={{ color: '#d0c5af' }}>
          Command a real browser. Describe your task and watch the agent execute it.
        </p>
      </div>

      {/* Input panel */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-col gap-4">

        <div>
          <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2"
            style={{ color: 'rgba(212,175,55,0.5)' }}>
            STARTING URL (optional)
          </label>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://google.com"
            className="w-full px-4 py-3 font-[Rajdhani] text-base"
            style={{
              background: '#111111',
              border: '1px solid rgba(212,175,55,0.15)',
              color: '#d0c5af',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2"
            style={{ color: 'rgba(212,175,55,0.5)' }}>
            MISSION DIRECTIVE
          </label>
          <textarea
            value={task}
            onChange={e => setTask(e.target.value)}
            placeholder="Search for AI agents in Egypt and take a screenshot of the results..."
            rows={3}
            className="w-full px-4 py-3 font-[Rajdhani] text-base resize-none"
            style={{
              background: '#111111',
              border: '1px solid rgba(212,175,55,0.15)',
              color: '#d0c5af',
              outline: 'none',
            }}
          />
        </div>

        <button
          onClick={execute}
          disabled={loading || !task.trim()}
          className="font-[Orbitron] text-xs tracking-[3px] uppercase px-8 py-4 transition-all disabled:opacity-40"
          style={{
            background: loading ? 'transparent' : '#D4AF37',
            color: loading ? '#D4AF37' : '#0A0A0A',
            border: '1px solid #D4AF37',
            fontWeight: 700,
          }}>
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
  );
}
