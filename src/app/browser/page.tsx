'use client';

import { useState } from 'react';
import { Globe, Loader2, CheckCircle, ExternalLink } from 'lucide-react';

interface BrowserResult {
  success: boolean;
  task: string;
  visitedUrls?: { url: string; title: string }[];
  steps?: string[];
  answer?: string;
  finalUrl?: string;
  finalTitle?: string;
  error?: string;
}

export default function BrowserPage() {
  const [task, setTask] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrowserResult | null>(null);
  const [activeUrl, setActiveUrl] = useState('');

  const execute = async () => {
    if (!task.trim()) return;
    setLoading(true);
    setResult(null);
    setActiveUrl('');
    try {
      const res = await fetch('/api/browser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, url: url.trim() || undefined }),
      });
      const data: BrowserResult = await res.json();
      setResult(data);
      if (data.visitedUrls?.[0]) setActiveUrl(data.visitedUrls[0].url);
    } catch {
      setResult({ success: false, task, error: 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d0c5af] font-sans flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
        <p className="font-[Orbitron] text-[9px] tracking-[5px] uppercase mb-1" style={{ color: 'rgba(212,175,55,0.5)' }}>
          SUPER SKILLS
        </p>
        <h1 className="font-[Orbitron] text-3xl font-black tracking-tighter" style={{ color: '#D4AF37' }}>
          BROWSER CONTROL
        </h1>
      </div>

      {/* Input Row */}
      <div className="px-8 py-4 border-b flex gap-4 items-end flex-wrap" style={{ borderColor: 'rgba(212,175,55,0.08)' }}>
        <div className="flex-1 min-w-[200px]">
          <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-1" style={{ color: 'rgba(212,175,55,0.5)' }}>
            START URL (optional)
          </label>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2.5 text-sm font-mono"
            style={{ background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.2)', color: '#d0c5af', outline: 'none' }}
          />
        </div>
        <div className="flex-[2] min-w-[300px]">
          <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-1" style={{ color: 'rgba(212,175,55,0.5)' }}>
            TASK
          </label>
          <input
            type="text"
            value={task}
            onChange={e => setTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && execute()}
            placeholder="Find the pricing of OpenRouter, summarize it..."
            className="w-full px-4 py-2.5 text-sm"
            style={{ background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.2)', color: '#d0c5af', outline: 'none' }}
          />
        </div>
        <button
          onClick={execute}
          disabled={loading || !task.trim()}
          className="px-8 py-2.5 font-[Orbitron] text-[10px] tracking-[3px] uppercase flex items-center gap-2 transition-all disabled:opacity-40"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
          {loading ? (isAr ? 'جارٍ التنفيذ' : 'RUNNING') : (isAr ? 'تنفيذ' : 'EXECUTE')}
        </button>
      </div>

      {/* Split Panel */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>

        {/* LEFT — Results */}
        <div className="w-2/5 overflow-y-auto p-6 border-r" style={{ borderColor: 'rgba(212,175,55,0.08)' }}>
          {loading && (
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#D4AF37' }} />
              <span className="font-[Orbitron] text-[9px] tracking-[3px] uppercase" style={{ color: '#D4AF37' }}>
                Agent navigating...
              </span>
            </div>
          )}
          {result && (
            <>
              {/* Status */}
              <div className="mb-4 flex items-center gap-2">
                {result.success
                  ? <CheckCircle className="w-4 h-4 text-green-400" />
                  : <span className="text-red-400 text-sm">Failed</span>}
                <span className="font-[Orbitron] text-[9px] tracking-[2px] uppercase" style={{ color: result.success ? '#4CAF50' : '#FF4444' }}>
                  {result.success ? 'Mission Complete' : 'Mission Failed'}
                </span>
              </div>

              {/* Visited URLs */}
              {result.visitedUrls && result.visitedUrls.length > 0 && (
                <div className="mb-4">
                  <p className="font-[Orbitron] text-[7px] tracking-[3px] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.4)' }}>
                    PAGES VISITED
                  </p>
                  <div className="flex flex-col gap-1">
                    {result.visitedUrls.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveUrl(v.url)}
                        className="flex items-center gap-2 px-3 py-2 rounded text-left transition-all hover:bg-white/5"
                        style={{
                          background: activeUrl === v.url ? 'rgba(212,175,55,0.08)' : 'transparent',
                          border: `1px solid ${activeUrl === v.url ? 'rgba(212,175,55,0.2)' : 'transparent'}`,
                        }}
                      >
                        <Globe className="w-3 h-3 shrink-0" style={{ color: '#D4AF37' }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-[Rajdhani] text-xs truncate" style={{ color: '#d0c5af' }}>{v.title}</p>
                          <p className="font-mono text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{v.url}</p>
                        </div>
                        <ExternalLink className="w-3 h-3 shrink-0" style={{ color: 'rgba(212,175,55,0.4)' }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps Log */}
              {result.steps && result.steps.length > 0 && (
                <div className="mb-4">
                  <p className="font-[Orbitron] text-[7px] tracking-[3px] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.4)' }}>
                    EXECUTION LOG
                  </p>
                  <div className="p-3" style={{ background: '#0d0d0d', border: '1px solid rgba(212,175,55,0.06)' }}>
                    {result.steps.map((s, i) => (
                      <div key={i} className="flex gap-2 mb-1">
                        <span style={{ color: '#D4AF37', fontSize: '9px' }}>✦</span>
                        <span className="font-[Rajdhani] text-xs" style={{ color: '#d0c5af' }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Answer */}
              {result.answer && (
                <div>
                  <p className="font-[Orbitron] text-[7px] tracking-[3px] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.4)' }}>
                    AI SYNTHESIS
                  </p>
                  <div className="p-4 rounded" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.08)', borderLeft: '3px solid #D4AF37' }}>
                    <pre className="font-[Rajdhani] text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#d0c5af' }}>
                      {result.answer}
                    </pre>
                  </div>
                </div>
              )}

              {result.error && (
                <p className="font-[Rajdhani] text-sm" style={{ color: '#FF4444' }}>{result.error}</p>
              )}
            </>
          )}
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-full opacity-30">
              <Globe className="w-12 h-12 mb-4" style={{ color: '#D4AF37' }} />
              <p className="font-[Orbitron] text-xs tracking-widest uppercase" style={{ color: '#D4AF37' }}>
                Enter a task and execute
              </p>
            </div>
          )}
        </div>

        {/* RIGHT — Live Site Panel */}
        <div className="w-1/2 flex flex-col">
          {/* URL bar */}
          <div className="px-4 py-2 border-b flex items-center gap-3" style={{ borderColor: 'rgba(212,175,55,0.08)', background: '#0d0d0d' }}>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F56' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#27C93F' }} />
            </div>
            <div className="flex-1 px-3 py-1 rounded font-mono text-[11px] truncate" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
              {activeUrl || (isAr ? 'لم يتم تحميل أي صفحة' : 'No page loaded')}
            </div>
            {activeUrl && (
              <a href={activeUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" style={{ color: 'rgba(212,175,55,0.5)' }} />
              </a>
            )}
          </div>

          {/* iFrame */}
          <div className="flex-1 relative">
            {activeUrl ? (
              <iframe
                key={activeUrl}
                src={activeUrl}
                className="w-full h-full border-0"
                title="Browser View"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                onError={() => {}}
                style={{ background: '#0A0A0A', colorScheme: 'dark' }}
              />
            ) : loading ? (
              <div className="w-full h-full flex items-center justify-center" style={{ background: '#0d0d0d' }}>
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#D4AF37' }} />
                  <p className="font-[Orbitron] text-[9px] tracking-[3px] uppercase" style={{ color: 'rgba(212,175,55,0.5)' }}>
                    Navigating...
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: '#0d0d0d' }}>
                <div className="text-center opacity-20">
                  <Globe className="w-16 h-16 mx-auto mb-4" style={{ color: '#D4AF37' }} />
                  <p className="font-[Orbitron] text-[9px] tracking-[3px] uppercase" style={{ color: '#D4AF37' }}>
                    Site preview will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}