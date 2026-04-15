'use client';

import { useState, useEffect } from 'react';
import { heroOrder } from '@/lib/heroes';
import { heroMeta } from '@/lib/agents';
import RelicRenderer from './RelicRenderer';

interface Relic {
  id: string;
  hero_slug: string;
  title: string;
  output_format: string;
  created_at: string;
  task?: string;
  content?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

export default function ArtifactsPage() {
  const [showNewRelic, setShowNewRelic] = useState(false);
  const [relics, setRelics] = useState<Relic[]>([]);
  const [loading, setLoading] = useState(true);

  // New Relic State
  const [selectedHero, setSelectedHero] = useState('');
  const [task, setTask] = useState('');
  const [executing, setExecuting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [relicResult, setRelicResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Detail View State
  const [viewRelic, setViewRelic] = useState<Relic | null>(null);

  useEffect(() => {
    fetchRelics();
  }, []);

  const fetchRelics = async () => {
    try {
      const res = await fetch('/api/relics');
      const data = await res.json();
      setRelics(data.relics || []);
    } catch (err) {
      console.error('Failed to fetch relics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleRelic = async (id: string) => {
    try {
      const res = await fetch(`/api/relics/${id}`);
      const data = await res.json();
      if (data.relic) {
         setViewRelic(data.relic);
      }
    } catch (err) {
      console.error('Failed to fetch relic details:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this relic?')) return;
    try {
      await fetch('/api/relics', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setRelics(relics.filter(r => r.id !== id));
      if (viewRelic?.id === id) setViewRelic(null);
    } catch (err) {
      console.error('Failed to delete relic:', err);
    }
  };

  const handleLaunch = async () => {
    if (!selectedHero || !task.trim()) return;
    setExecuting(true);
    setRelicResult(null);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: task }],
          heroId: selectedHero,
          agentId: '',
        }),
      });

      if (!res.body) throw new Error("No response body");

      const contentType = res.headers.get('content-type') || '';

      // If the response is not a stream (like DALL-E image)
      if (contentType.includes('application/json')) {
         const data = await res.json();
         if (data.rendered_output) {
            setRelicResult({
              output_format: data.rendered_output.output_format,
              content: data.rendered_output.content,
              metadata: data.classification
            });
         }
         setExecuting(false);
         return;
      }

      // Handle streaming response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let classificationData: any = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let finalOutputData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'classification') {
                classificationData = data.data;
              } else if (data.type === 'final_render') {
                finalOutputData = data.rendered_output;
              }
            } catch {}
          }
        }
      }

      if (finalOutputData) {
         setRelicResult({
            output_format: finalOutputData.output_format,
            content: finalOutputData.content,
            metadata: classificationData
         });
      }

    } catch (err) {
      console.error(err);
      setRelicResult({ output_format: 'text_message', content: `Error: ${(err as Error).message}` });
    } finally {
      setExecuting(false);
    }
  };

  const handleSave = async () => {
     if (!relicResult) return;
     setSaving(true);
     try {
       const titleMatch = task.slice(0, 80);
       const res = await fetch('/api/relics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hero_slug: selectedHero,
            title: titleMatch,
            task,
            output_format: relicResult.output_format,
            content: relicResult.content,
            metadata: relicResult.metadata
          })
       });
       const data = await res.json();
       if (data.relic) {
          setRelics([data.relic, ...relics]);
          setSavedSuccess(true);
       }
     } catch (err) {
        console.error('Save failed', err);
     } finally {
        setSaving(false);
     }
  };

  const getFormatBadgeColor = (format: string) => {
    switch (format) {
      case 'html_preview': return '#06B6D4';
      case 'document_view': return '#D4AF37';
      case 'code_block': return '#22C55E';
      case 'image_card': return '#9B59B6';
      case 'text_message': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#d0c5af] font-sans p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-8 mt-4">
        {/* Header */}
        <div className="mb-10 border-b pb-8" style={{ borderColor: 'rgba(212,175,55,0.08)' }}>
          <p className="font-[Orbitron] text-[9px] tracking-[5px] uppercase mb-3"
            style={{ color: 'rgba(212,175,55,0.5)' }}>SUPER SKILLS</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-[Orbitron] text-4xl font-black tracking-tighter mb-2"
                style={{ color: '#D4AF37' }}>EMPIRE RELICS</h1>
              <p className="text-lg" style={{ color: '#d0c5af' }}>
                Your generated apps, documents, and outputs.
              </p>
            </div>
            <button
              onClick={() => { setShowNewRelic(!showNewRelic); setViewRelic(null); }}
              className="font-[Orbitron] text-[9px] tracking-[3px] uppercase px-6 py-3 transition-all"
              style={{
                background: showNewRelic || viewRelic ? 'transparent' : 'linear-gradient(135deg, #D4AF37, #FBBF24)',
                border: showNewRelic || viewRelic ? '1px solid #D4AF37' : 'none',
                color: showNewRelic || viewRelic ? '#D4AF37' : '#0A0A0A',
                fontWeight: 700,
              }}>
              {showNewRelic || viewRelic ? 'BACK TO LIST' : '+ NEW RELIC'}
            </button>
          </div>
        </div>

        {/* Views */}
        {viewRelic ? (
           /* Detail View */
           <div className="p-6" style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.15)' }}>
             <div className="flex items-center justify-between mb-6 border-b pb-4" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
                <div>
                   <h2 className="font-bold text-white text-xl mb-2">{viewRelic.title}</h2>
                   <div className="flex items-center gap-3">
                     <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-sm"
                        style={{
                           background: `${getFormatBadgeColor(viewRelic.output_format)}15`,
                           color: getFormatBadgeColor(viewRelic.output_format),
                           border: `1px solid ${getFormatBadgeColor(viewRelic.output_format)}30`
                        }}>
                        {viewRelic.output_format.replace('_', ' ')}
                     </span>
                     <span className="text-xs" style={{ color: 'rgba(208,197,175,0.5)' }}>
                        {new Date(viewRelic.created_at).toLocaleString()}
                     </span>
                   </div>
                </div>
                <button onClick={(e) => handleDelete(viewRelic.id, e)} className="text-red-400 hover:text-red-300">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                     <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                   </svg>
                </button>
             </div>

             {viewRelic.task && (
               <div className="mb-6 p-4 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                 <p className="font-[Orbitron] text-[10px] uppercase text-[#D4AF37] mb-2">Original Task</p>
                 <p className="text-sm text-gray-300">{viewRelic.task}</p>
               </div>
             )}

             <RelicRenderer relicResult={viewRelic} />
           </div>
        ) : showNewRelic ? (
          /* Create View */
          <div className="mb-10 p-6 flex flex-col gap-6"
            style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.15)' }}>

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
                className="w-full px-4 py-3 text-base resize-none"
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

            {executing && (
               <div className="mt-8 p-6" style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.15)' }}>
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D4AF37' }} />
                    <span className="text-sm" style={{ color: '#d0c5af' }}>
                      Agent is crafting your relic...
                    </span>
                 </div>
               </div>
            )}

            {!executing && relicResult && (
              <div className="mt-8 p-6" style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.15)' }}>
                <div className="flex items-center justify-between mb-6">
                   <p className="font-[Orbitron] text-[8px] tracking-[3px] uppercase"
                     style={{ color: 'rgba(212,175,55,0.5)' }}>
                     RELIC OUTPUT
                   </p>
                   {!savedSuccess ? (
                      <button onClick={handleSave} disabled={saving} className="font-[Orbitron] text-[10px] px-4 py-2 bg-[#D4AF37] text-black font-bold">
                        {saving ? 'SAVING...' : 'SAVE RELIC'}
                      </button>
                   ) : (
                      <span className="font-[Orbitron] text-[10px] text-green-400 font-bold">
                        SAVED TO EMPIRE RELICS
                      </span>
                   )}
                </div>

                <RelicRenderer relicResult={relicResult} />
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <div>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
              </div>
            ) : relics.length === 0 ? (
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
                <p className="text-sm text-center max-w-xs"
                  style={{ color: '#d0c5af', opacity: 0.5 }}>
                  Click NEW RELIC to start a mission and generate your first empire relic.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relics.map(relic => {
                  const meta = heroMeta[relic.hero_slug as keyof typeof heroMeta];
                  return (
                    <div key={relic.id} className="relative group p-5 transition-all hover:-translate-y-1 cursor-pointer"
                      onClick={() => fetchSingleRelic(relic.id)}
                      style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.1)', borderRadius: '4px' }}>

                      <button onClick={(e) => handleDelete(relic.id, e)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        style={{ color: 'rgba(255,255,255,0.3)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: meta?.color_signature || '#FFF' }} />
                        <span className="font-[Orbitron] text-[10px] uppercase font-bold tracking-wider"
                          style={{ color: meta?.color_signature || '#FFF' }}>
                          {meta?.name || relic.hero_slug}
                        </span>
                      </div>

                      <h3 className="font-bold text-white mb-4 line-clamp-2" style={{ minHeight: '3rem' }}>
                        {relic.title.length > 60 ? relic.title.substring(0, 60) + '...' : relic.title}
                      </h3>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-sm"
                          style={{
                            background: `${getFormatBadgeColor(relic.output_format)}15`,
                            color: getFormatBadgeColor(relic.output_format),
                            border: `1px solid ${getFormatBadgeColor(relic.output_format)}30`
                          }}>
                          {relic.output_format.replace('_', ' ')}
                        </span>
                        <span className="text-[10px]" style={{ color: 'rgba(208,197,175,0.5)' }}>
                          {new Date(relic.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
