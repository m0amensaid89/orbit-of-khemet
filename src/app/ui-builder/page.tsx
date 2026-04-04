"use client";

import { useState, Suspense, useRef } from 'react';
import { Wand2, Monitor, Code, Copy, Download, RotateCcw, Maximize2, X, History } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const COMPONENT_OPTIONS = [
  'Navigation Bar', 'Hero Section', 'Features Grid', 'Pricing Table',
  'Testimonials', 'FAQ Accordion', 'Contact Form', 'Footer',
  'Image Gallery', 'Stats Counter', 'Team Section', 'CTA Banner',
  'Login Form', 'Dashboard Layout', 'Card Grid', 'Timeline',
];

function UIBuilderContent() {
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('dark');
  const [complexity, setComplexity] = useState('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [history, setHistory] = useState<{html: string; description: string; time: string}[]>([]);
  const [refinement, setRefinement] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<string[]>(['Navigation Bar', 'Hero Section', 'Footer']);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleComponent = (c: string) => setSelectedComponents(prev =>
    prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
  );

  const searchParams = useSearchParams();
  const fromAgent = searchParams.get('agent');
  const fromHero = searchParams.get('from');

  const handleGenerate = async () => {
    if (!description.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ui-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, style, complexity, components: selectedComponents }),
      });
      const data = await res.json();
      if (data.html) {
        setGeneratedHtml(data.html);
        setView('preview');
        setHistory(prev => [{
          html: data.html,
          description: description.slice(0, 40) + (description.length > 40 ? '...' : ''),
          time: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!refinement.trim() || !generatedHtml || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ui-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: `Take this existing HTML and improve it: ${refinement}\n\nExisting HTML:\n${generatedHtml}`,
          style,
          complexity,
        }),
      });
      const data = await res.json();
      if (data.html) {
        setGeneratedHtml(data.html);
        setRefinement('');
        setHistory(prev => [{
          html: data.html,
          description: refinement.slice(0, 40) + (refinement.length > 40 ? '...' : ''),
          time: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedHtml);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interface-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFullscreen = () => {
    if (iframeRef.current && iframeRef.current.requestFullscreen) {
      iframeRef.current.requestFullscreen();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-[#d0c5af] p-6 pb-20 md:pb-6 overflow-y-auto w-full mx-auto relative" style={{ fontFamily: 'var(--font-rajdhani), sans-serif' }}>
      {fromHero && fromAgent && (
        <div className="w-full px-6 py-2 flex items-center gap-3 absolute top-0 left-0 z-20"
          style={{ background: 'rgba(212,175,55,0.06)', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
          <span style={{ color: '#D4AF37', fontSize: '10px' }}>✦</span>
          <span className="font-[Orbitron] text-[9px] tracking-[2px] uppercase"
            style={{ color: 'rgba(212,175,55,0.6)' }}>
            ACTIVATED FROM {fromHero.toUpperCase()} ORBIT
          </span>
        </div>
      )}

      {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 mb-2 border border-[#D4AF37]/30 bg-[#D4AF37]/10 rounded font-orbitron text-[10px] tracking-widest text-[#D4AF37]">
            EMPIRE ENGINE
          </div>
          <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D1] to-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            UI BUILDER
          </h1>
          <h2 className="text-xl md:text-2xl font-rajdhani font-semibold text-[#d0c5af]/80 tracking-widest uppercase">
            Interface Forge
          </h2>
          <button
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 mt-2 font-[Orbitron] text-xs tracking-widest uppercase transition-all"
            style={{ color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.08)', borderRadius: '4px' }}
          >
            <History size={14} /> VIEW HISTORY
          </button>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Input Panel */}
        <div className="flex flex-col gap-6 p-6 rounded-lg overflow-y-auto" style={{ backgroundColor: '#131313', border: '1px solid rgba(212,175,55,0.08)' }}>

          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest font-bold" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#D4AF37' }}>
              DESCRIBE YOUR INTERFACE
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., A dashboard for a fitness app with workout tracker, calorie counter, and weekly progress charts"
              className="w-full min-h-[150px] p-4 rounded text-sm resize-y outline-none transition-all duration-300"
              style={{
                backgroundColor: '#0e0e0e',
                color: '#d0c5af',
                border: '1px solid rgba(212,175,55,0.2)'
              }}
              onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.2)'}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest font-bold" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#D4AF37' }}>
              VISUAL STYLE
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {['dark', 'minimal', 'corporate', 'creative'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className="py-2 px-3 text-xs font-bold tracking-wider rounded transition-all duration-300 uppercase"
                  style={{
                    backgroundColor: style === s ? 'transparent' : 'rgba(212,175,55,0.08)',
                    backgroundImage: style === s ? 'linear-gradient(135deg, #f2ca50, #D4AF37)' : 'none',
                    color: style === s ? '#000000' : '#D4AF37',
                    border: style === s ? 'none' : '1px solid rgba(212,175,55,0.3)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest font-bold" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#D4AF37' }}>
              COMPLEXITY
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['simple', 'standard', 'advanced'].map((c) => (
                <button
                  key={c}
                  onClick={() => setComplexity(c)}
                  className="py-2 px-3 text-xs font-bold tracking-wider rounded transition-all duration-300 uppercase"
                  style={{
                    backgroundColor: complexity === c ? 'transparent' : 'rgba(212,175,55,0.08)',
                    backgroundImage: complexity === c ? 'linear-gradient(135deg, #f2ca50, #D4AF37)' : 'none',
                    color: complexity === c ? '#000000' : '#D4AF37',
                    border: complexity === c ? 'none' : '1px solid rgba(212,175,55,0.3)',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest font-bold" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#D4AF37' }}>
              COMPONENTS
            </label>
            <div className="flex flex-wrap gap-2 mb-6">
              {COMPONENT_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => toggleComponent(c)}
                  className="px-3 py-1.5 rounded-full text-xs font-[Rajdhani] tracking-wider transition-all"
                  style={{
                    background: selectedComponents.includes(c) ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedComponents.includes(c) ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: selectedComponents.includes(c) ? '#D4AF37' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-mono p-3 rounded" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
            Build: {description || '(your description)'} | Style: {style} | Components: {selectedComponents.join(', ')}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !description.trim()}
            className="w-full mt-2 px-8 py-3 rounded flex items-center justify-center gap-2 font-orbitron font-bold tracking-widest text-black transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #f2ca50, #D4AF37)', boxShadow: '0 0 15px rgba(212,175,55,0.4)' }}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                BUILDING YOUR INTERFACE...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                FORGE INTERFACE
              </>
            )}
          </button>
        </div>

        {/* Preview Panel */}
        <div className="sticky top-0 flex flex-col gap-6">
          {isGenerating ? (
            <div className="flex flex-col rounded-lg overflow-hidden h-full min-h-[600px]" style={{ backgroundColor: '#131313', border: '1px solid rgba(212,175,55,0.08)' }}>
              <div className="flex-1 w-full relative">
                <div style={{
                  width: '100%', height: '100%',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(6,182,212,0.08), rgba(212,175,55,0.08))',
                  backgroundSize: '400% 400%',
                  animation: 'shimmer 3s ease-in-out infinite',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.8)" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                  </div>
                  <span style={{ fontFamily: 'Orbitron', fontSize: '12px', letterSpacing: '4px', color: 'rgba(212,175,55,0.6)', textTransform: 'uppercase' }}>
                    Generating Interface...
                  </span>
                </div>
              </div>
            </div>
          ) : generatedHtml ? (
            <>
              <div className="flex flex-col rounded-lg overflow-hidden" style={{ backgroundColor: '#131313', border: '1px solid rgba(212,175,55,0.08)' }}>
                {/* Preview Header Bar */}
                <div className="flex flex-wrap items-center justify-between p-3 border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D4AF37', boxShadow: '0 0 5px #D4AF37' }} />
                    <span className="text-sm tracking-widest font-bold truncate max-w-[150px] sm:max-w-[200px]" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#D4AF37' }}>
                      {description.slice(0, 20) || 'INTERFACE'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold" style={{ backgroundColor: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>
                      HTML
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <div className="flex rounded overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.3)' }}>
                      <button
                        onClick={() => setView('preview')}
                        className="px-3 py-1 flex items-center gap-1 text-xs font-bold transition-all duration-200"
                        style={{
                          backgroundColor: view === 'preview' ? 'rgba(212,175,55,0.2)' : 'transparent',
                          color: view === 'preview' ? '#D4AF37' : '#888'
                        }}
                      >
                        <Monitor size={14} /> PREVIEW
                      </button>
                      <button
                        onClick={() => setView('code')}
                        className="px-3 py-1 flex items-center gap-1 text-xs font-bold transition-all duration-200"
                        style={{
                          backgroundColor: view === 'code' ? 'rgba(212,175,55,0.2)' : 'transparent',
                          color: view === 'code' ? '#D4AF37' : '#888'
                        }}
                      >
                        <Code size={14} /> CODE
                      </button>
                    </div>
                    <button onClick={handleFullscreen} title="Fullscreen Preview" className="p-1.5 rounded transition-all duration-200 hover:bg-white/5" style={{ color: '#D4AF37' }}>
                      <Maximize2 size={16} />
                    </button>
                    <button onClick={handleCopy} title="Copy Code" className="p-1.5 rounded transition-all duration-200 hover:bg-white/5" style={{ color: '#D4AF37' }}>
                      <Copy size={16} />
                    </button>
                    <button onClick={handleDownload} title="Download HTML" className="p-1.5 rounded transition-all duration-200 hover:bg-white/5" style={{ color: '#D4AF37' }}>
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="relative w-full h-[600px] overflow-hidden" style={{ backgroundColor: view === 'code' ? '#0e0e0e' : '#ffffff' }}>
                  {view === 'preview' ? (
                    <iframe
                      ref={iframeRef}
                      srcDoc={generatedHtml}
                      sandbox="allow-scripts allow-same-origin"
                      className="w-full h-full border-none bg-white"
                      title="UI Preview"
                    />
                  ) : (
                    <pre className="w-full h-full p-4 overflow-auto text-xs sm:text-sm font-mono whitespace-pre-wrap outline-none" style={{ color: '#d0c5af' }}>
                      {generatedHtml}
                    </pre>
                  )}
                </div>
              </div>

              {/* Refinement Section */}
              <div className="flex flex-col p-4 rounded-lg gap-3" style={{ backgroundColor: '#131313', border: '1px solid rgba(212,175,55,0.08)' }}>
                <label className="text-xs tracking-widest font-bold" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#D4AF37' }}>
                  REFINE YOUR INTERFACE
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={refinement}
                    onChange={(e) => setRefinement(e.target.value)}
                    placeholder="e.g., Add a dark sidebar navigation"
                    className="flex-grow p-3 rounded text-sm outline-none transition-all duration-300"
                    style={{
                      backgroundColor: '#0e0e0e',
                      color: '#d0c5af',
                      border: '1px solid rgba(212,175,55,0.2)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.2)'}
                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                  />
                  <button
                    onClick={handleRefine}
                    disabled={isGenerating || !refinement.trim()}
                    className="px-6 py-3 rounded flex items-center justify-center gap-2 font-orbitron font-bold tracking-widest text-black transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg, #f2ca50, #D4AF37)', boxShadow: '0 0 15px rgba(212,175,55,0.4)' }}
                  >
                    <Wand2 size={16} />
                    ITERATE
                  </button>
                </div>
              </div>

            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] lg:h-[600px] rounded-lg" style={{ backgroundColor: '#131313', border: '1px dashed rgba(212,175,55,0.2)' }}>
              <div className="text-center flex flex-col items-center gap-4 opacity-50">
                <Wand2 size={48} style={{ color: '#D4AF37' }} />
                <p className="tracking-widest text-sm" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#D4AF37' }}>
                  AWAITING INTERFACE DIRECTIVES
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 shadow-2xl transition-transform duration-300 z-50`}
        style={{
          transform: isHistoryDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          backgroundColor: '#0a0a0a',
          borderRight: '1px solid rgba(212,175,55,0.2)',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
          <h2 className="font-[Orbitron] text-sm tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
            <History size={16} /> VERSION HISTORY
          </h2>
          <button
            onClick={() => setIsHistoryDrawerOpen(false)}
            className="p-1 hover:bg-white/5 rounded text-[#D4AF37]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-y-auto h-[calc(100vh-64px)]">
          {history.length === 0 ? (
            <div className="text-center text-xs text-[#d0c5af]/50 italic mt-8">
              No generation history yet.
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="flex flex-col p-4 rounded-lg gap-3 transition-colors hover:bg-white/5" style={{ backgroundColor: '#131313', border: '1px solid rgba(212,175,55,0.1)' }}>
                <div className="text-sm truncate font-medium" style={{ color: '#d0c5af' }} title={item.description}>
                  {item.description || 'Interface Generation'}
                </div>

                <div className="w-full h-24 bg-white rounded overflow-hidden relative pointer-events-none opacity-80">
                   <iframe
                      srcDoc={item.html}
                      className="w-[400%] h-[400%] origin-top-left scale-25 border-none"
                      tabIndex={-1}
                   />
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs" style={{ color: 'rgba(212,175,55,0.6)' }}>{item.time}</span>
                  <button
                    onClick={() => {
                      setGeneratedHtml(item.html);
                      setView('preview');
                      setIsHistoryDrawerOpen(false);
                    }}
                    className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded transition-all duration-200"
                    style={{ backgroundColor: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
                  >
                    <RotateCcw size={12} /> RESTORE
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Overlay for Drawer */}
      {isHistoryDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsHistoryDrawerOpen(false)}
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .scale-25 { transform: scale(0.25); }
      `}} />
    </div>
  );
}

export default function UIBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <UIBuilderContent />
    </Suspense>
  );
}
