"use client";

import React, { useState, Suspense } from 'react';
import { Download, Copy, Play, CheckCircle, Loader2, Circle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function AutopilotContent() {
  const [goal, setGoal] = useState('');
  const [phase, setPhase] = useState<'idle' | 'running' | 'complete'>('idle');
  const [status, setStatus] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [stepResults, setStepResults] = useState<Record<number, string>>({});
  const [outputType, setOutputType] = useState<string>('text');
  const [finalResult, setFinalResult] = useState('');

  const searchParams = useSearchParams();
  const fromAgent = searchParams.get('agent');
  const fromHero = searchParams.get('from');

  const handleLaunch = async () => {
    if (!goal.trim()) return;
    setPhase('running');
    setSteps([]);
    setStepResults({});
    setActiveStep(-1);
    setFinalResult('');
    setStatus('Analyzing mission...');

    try {
      const res = await fetch('/api/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, heroSlug: 'master' }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'planning') setStatus('Analyzing mission...');
            if (data.type === 'steps') {
              setSteps(data.steps);
              if (data.outputType) setOutputType(data.outputType);
            }
            if (data.type === 'step_start') {
              setActiveStep(data.stepIndex);
              setStatus(`Executing Step ${data.stepIndex + 1}...`);
            }
            if (data.type === 'step_complete') {
              setStepResults(prev => ({ ...prev, [data.stepIndex]: data.result }));
            }
            if (data.type === 'synthesizing') setStatus('Synthesizing final deliverable...');
            if (data.type === 'complete') {
              setFinalResult(data.result);
              if (data.outputType) setOutputType(data.outputType);
              setPhase('complete');
              setActiveStep(-1);
              setStatus('Mission Complete');
            }
            if (data.type === 'error') {
              setPhase('idle');
              setStatus('Mission failed. Please try again.');
            }
          } catch (e) {
            console.error("Error parsing SSE line:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error launching mission:", error);
      setPhase('idle');
      setStatus('Mission failed to launch.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalResult);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d0c5af] font-sans p-6 md:p-12 relative overflow-hidden">
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
            AUTO-PILOT
          </h1>
          <h2 className="text-xl md:text-2xl font-rajdhani font-semibold text-[#d0c5af]/80 tracking-widest uppercase">
            Autonomous Mission Execution
          </h2>
        </div>

        {/* Mission Input Section */}
        <div
          style={{ backgroundColor: '#131313', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '4px' }}
          className="p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
        >
          {phase === 'running' && (
             <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[#D4AF37] to-[#F2CA50] animate-[pulse_2s_ease-in-out_Infinity] w-full" />
          )}

          <div className="space-y-4 relative">
             <div className="absolute -left-2 top-0 bottom-0 w-px bg-gradient-to-b from-[#D4AF37]/50 to-transparent" />

            <label className="block font-orbitron text-sm tracking-widest text-[#D4AF37] ml-4">
              MISSION PARAMETERS
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={phase === 'running'}
              placeholder="Describe your mission goal... e.g., Create a complete marketing strategy for I-Gamify.net including target audience analysis, content calendar, and campaign ideas"
              className="w-full h-32 p-4 bg-black/40 border border-[#D4AF37]/20 rounded text-[#d0c5af] placeholder:text-[#d0c5af]/30 focus:outline-none focus:border-[#D4AF37]/50 transition-colors resize-none disabled:opacity-50"
              style={{ fontFamily: 'inherit' }}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#d0c5af]/50 font-rajdhani italic">
              Auto-Pilot will break your goal into steps and execute each one autonomously.
            </p>
            <button
              onClick={handleLaunch}
              disabled={phase === 'running' || !goal.trim()}
              className="w-full sm:w-auto px-8 py-3 rounded flex items-center justify-center gap-2 font-orbitron font-bold tracking-widest text-black transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #f2ca50, #D4AF37)', boxShadow: '0 0 15px rgba(212,175,55,0.4)' }}
            >
              {phase === 'running' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  EXECUTING
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" fill="currentColor" />
                  LAUNCH MISSION
                </>
              )}
            </button>
          </div>
        </div>

        {/* Execution Display */}
        {(phase === 'running' || phase === 'complete' || steps.length > 0) && (
          <div
            style={{ backgroundColor: '#131313', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '4px' }}
            className="p-6 md:p-8 space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-[#D4AF37]/10 pb-4">
              {phase === 'running' && <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_8px_#D4AF37]" />}
              <h3 className="font-orbitron tracking-widest text-sm text-[#D4AF37]">
                {status}
              </h3>
            </div>

            <div className="space-y-1.5">
              {steps.map((step, index) => {
                const isActive = activeStep === index;
                const isComplete = stepResults[index] !== undefined || phase === 'complete';
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-4 py-2 rounded transition-all duration-300"
                    style={{
                      background: isActive
                        ? 'rgba(212,175,55,0.06)'
                        : 'transparent',
                      borderLeft: isActive
                        ? '2px solid #D4AF37'
                        : isComplete
                        ? '2px solid rgba(74,222,128,0.4)'
                        : '2px solid rgba(255,255,255,0.05)',
                      opacity: !isActive && !isComplete ? 0.4 : 1,
                    }}
                  >
                    <div className="shrink-0">
                      {isComplete ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      ) : isActive ? (
                        <Loader2 className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
                      ) : (
                        <Circle className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.2)' }} />
                      )}
                    </div>
                    <span
                      className="font-[Rajdhani] text-sm tracking-wide"
                      style={{ color: isActive ? '#D4AF37' : isComplete ? '#d0c5af' : 'rgba(208,197,175,0.5)' }}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Final Result Section */}
        {phase === 'complete' && finalResult && (() => {
          // --- WEBSITE output: full iframe preview
          if (outputType === 'website') {
            return (
              <div style={{ backgroundColor: '#131313', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '4px' }} className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
                  <h3 className="font-[Orbitron] text-xl font-bold tracking-widest text-[#D4AF37] flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" /> WEBSITE BUILT
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="p-2 rounded border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-2 text-sm font-[Rajdhani]">
                      <Copy className="w-4 h-4" /> Copy HTML
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([finalResult], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = 'khemet-website.html';
                        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                      }}
                      className="p-2 rounded border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-2 text-sm font-[Rajdhani]"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                </div>
                <iframe
                  srcDoc={finalResult}
                  className="w-full rounded"
                  style={{ height: '600px', border: '1px solid rgba(212,175,55,0.1)', background: '#fff' }}
                  sandbox="allow-scripts allow-same-origin"
                  title="Generated Website"
                />
              </div>
            );
          }

          // --- EXCEL/CSV output: render as table
          if (outputType === 'excel') {
            const lines = finalResult.trim().split('\n');
            const headers = lines[0]?.split(',') || [];
            const rows = lines.slice(1).map(l => l.split(','));
            return (
              <div style={{ backgroundColor: '#131313', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '4px' }} className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
                  <h3 className="font-[Orbitron] text-xl font-bold tracking-widest text-[#D4AF37] flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" /> SPREADSHEET READY
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="p-2 rounded border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-2 text-sm font-[Rajdhani]">
                      <Copy className="w-4 h-4" /> Copy CSV
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([finalResult], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = 'khemet-data.csv';
                        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                      }}
                      className="p-2 rounded border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-2 text-sm font-[Rajdhani]"
                    >
                      <Download className="w-4 h-4" /> Download CSV
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                        {headers.map((h, i) => (
                          <th key={i} className="text-left px-3 py-2 font-[Orbitron] text-[9px] tracking-widest uppercase" style={{ color: '#D4AF37' }}>
                            {h.trim().replace(/^"|"$/g, '')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 50).map((row, ri) => (
                        <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-3 py-2 font-[Rajdhani] text-sm" style={{ color: '#d0c5af' }}>
                              {cell.trim().replace(/^"|"$/g, '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          // --- IMAGE output: show prompt in a styled card
          if (outputType === 'image') {
            return (
              <div style={{ backgroundColor: '#131313', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '4px' }} className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
                  <h3 className="font-[Orbitron] text-xl font-bold tracking-widest text-[#D4AF37] flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" /> IMAGE BRIEF READY
                  </h3>
                  <button onClick={handleCopy} className="p-2 rounded border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-2 text-sm font-[Rajdhani]">
                    <Copy className="w-4 h-4" /> Copy Prompt
                  </button>
                </div>
                <div className="p-5 rounded" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)', borderLeft: '3px solid #D4AF37' }}>
                  <pre className="whitespace-pre-wrap font-[Rajdhani] text-sm leading-relaxed" style={{ color: '#d0c5af' }}>
                    {finalResult}
                  </pre>
                </div>
              </div>
            );
          }

          // --- ALL OTHER types (text, pdf, word, powerpoint, video): styled markdown viewer
          return (
            <div style={{ backgroundColor: '#131313', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '4px' }} className="p-6 space-y-4 shadow-[0_0_30px_rgba(212,175,55,0.05)]">
              <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
                <h3 className="font-[Orbitron] text-xl font-bold tracking-widest text-[#D4AF37] flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" /> MISSION COMPLETE
                </h3>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="p-2 rounded border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-2 text-sm font-[Rajdhani]">
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                  <button
                    onClick={() => {
                      const ext = outputType === 'powerpoint' ? 'md' : outputType === 'excel' ? 'csv' : 'md';
                      const blob = new Blob([finalResult], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = url;
                      a.download = `khemet-${outputType}.${ext}`;
                      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                    }}
                    className="p-2 rounded border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-2 text-sm font-[Rajdhani]"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              </div>
              <div className="bg-black/40 border border-white/5 rounded p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed" style={{ color: '#d0c5af' }}>
                  {finalResult}
                </pre>
              </div>
            </div>
          );
        })()}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212,175,55,0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212,175,55,0.5);
        }
      `}} />
    </div>
  );
}

export default function AutopilotPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <AutopilotContent />
    </Suspense>
  );
}
