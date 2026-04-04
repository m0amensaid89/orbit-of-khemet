"use client";

import { useState, Suspense } from 'react';
import { Shield, Copy, Download, RefreshCw, Star, GitFork, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSearchParams } from 'next/navigation';

function CodeSentinelContent() {
  const [repoUrl, setRepoUrl] = useState('');
  const [task, setTask] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    analysis: string;
    repoInfo: { name: string; stars: number; forks: number; language: string | null; description: string | null };
    fileCount: number;
    filesAnalyzed: number;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const quickTasks = [
    'ARCHITECTURE OVERVIEW',
    'FIND BUGS',
    'SECURITY AUDIT',
    'SUGGEST IMPROVEMENTS',
  ];

  const searchParams = useSearchParams();
  const fromAgent = searchParams.get('agent');
  const fromHero = searchParams.get('from');

  const handleAnalyze = async () => {
    if (!repoUrl.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setResult(null);

    const messages = [
      'Connecting to repository...',
      'Reading file structure...',
      'Analyzing key files...',
      'Running intelligence sweep...',
    ];
    let msgIdx = 0;
    setStatusMessage(messages[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      setStatusMessage(messages[msgIdx]);
    }, 2500);

    try {
      const res = await fetch('/api/sentinel/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          task: selectedTask || task || undefined,
        }),
      });
      const data = await res.json();
      if (data.analysis) setResult(data);
      else setStatusMessage('Analysis failed. Check the repository URL and try again.');
    } catch {
      setStatusMessage('Connection failed. Please try again.');
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (result) navigator.clipboard.writeText(result.analysis);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.analysis], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.repoInfo.name.replace(/\//g, '-')}-analysis.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setResult(null);
    setRepoUrl('');
    setTask('');
    setSelectedTask('');
    setStatusMessage('');
  };

  return (
    <div className="min-h-screen bg-black text-[#d0c5af] p-6 lg:p-12 relative overflow-hidden">
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
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#00A8E8]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10 mt-4">

        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 mb-2 border border-[#D4AF37]/30 bg-[#D4AF37]/10 rounded font-orbitron text-[10px] tracking-widest text-[#D4AF37]">
            EMPIRE ENGINE
          </div>
          <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D1] to-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            CODE SENTINEL
          </h1>
          <h2 className="text-xl md:text-2xl font-rajdhani font-semibold text-[#d0c5af]/80 tracking-widest uppercase">
            Repository Intelligence
          </h2>
        </div>

        {/* Input Panel */}
        {!result && (
          <div className="bg-[#131313] border border-[#D4AF37]/30 rounded-xl p-6 lg:p-8 shadow-[0_0_30px_rgba(212,175,55,0.05)] space-y-6">

            <div className="space-y-2">
              <label className="font-[Orbitron] text-xs tracking-widest text-[#D4AF37] uppercase">
                REPOSITORY URL
              </label>
              <input
                type="text"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full bg-[#0e0e0e] border border-[#D4AF37]/20 rounded p-4 text-[#d0c5af] font-mono focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all placeholder:text-[#d0c5af]/30"
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-3">
              <label className="font-[Orbitron] text-xs tracking-widest text-[#D4AF37] uppercase">
                QUICK TASKS
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickTasks.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedTask(t);
                      setTask('');
                    }}
                    disabled={isAnalyzing}
                    className={`p-3 font-[Orbitron] text-[11px] tracking-widest border transition-all duration-300 ${
                      selectedTask === t
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-black border-[#D4AF37] font-bold'
                        : 'bg-[#131313] border-[rgba(212,175,55,0.08)] text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-[Orbitron] text-xs tracking-widest text-[#D4AF37] uppercase">
                CUSTOM TASK
              </label>
              <textarea
                placeholder="OR DESCRIBE A CUSTOM TASK..."
                value={task}
                onChange={(e) => {
                  setTask(e.target.value);
                  setSelectedTask('');
                }}
                rows={3}
                className="w-full bg-[#0e0e0e] border border-[#D4AF37]/20 rounded p-4 text-[#d0c5af] font-mono focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all placeholder:text-[#d0c5af]/30 resize-none"
                disabled={isAnalyzing}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !repoUrl.trim()}
              className={`w-full p-4 flex items-center justify-center space-x-3 font-[Orbitron] tracking-[0.2em] font-bold transition-all duration-300 rounded ${
                isAnalyzing || !repoUrl.trim()
                  ? 'bg-[#1a1a1a] text-[#d0c5af]/30 border border-[#d0c5af]/10 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-[1.01]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
                  <span>{statusMessage}</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>DEPLOY SENTINEL</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Results Panel */}
        {result && (
          <div className="bg-[#131313] border border-[#D4AF37]/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.1)] animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Results Header */}
            <div className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent p-6 border-b border-[#D4AF37]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-[Orbitron] text-xl font-bold tracking-widest text-[#D4AF37] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#D4AF37]" />
                  INTELLIGENCE REPORT
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm font-[Rajdhani] text-[#d0c5af]/80">
                  <span className="bg-[#0e0e0e] border border-[#D4AF37]/30 px-3 py-1 rounded text-[#D4AF37] font-mono text-xs">
                    {result.repoInfo.name}
                  </span>
                  <span className="bg-[#0e0e0e] border border-[#D4AF37]/30 px-3 py-1 rounded text-[#D4AF37] font-mono text-xs">
                    {result.fileCount} FILES SCANNED
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-4 border border-[#D4AF37]/20 bg-[#0e0e0e] rounded p-2 px-4">
                <div className="flex items-center gap-1.5 text-[#D4AF37] font-mono text-xs">
                  <Star className="w-3.5 h-3.5" /> {result.repoInfo.stars}
                </div>
                <div className="w-px h-4 bg-[#D4AF37]/20"></div>
                <div className="flex items-center gap-1.5 text-[#D4AF37] font-mono text-xs">
                  <GitFork className="w-3.5 h-3.5" /> {result.repoInfo.forks}
                </div>
                <div className="w-px h-4 bg-[#D4AF37]/20"></div>
                <div className="flex items-center gap-1.5 text-[#D4AF37] font-mono text-xs">
                  <Code className="w-3.5 h-3.5" /> {result.repoInfo.language || 'N/A'}
                </div>
              </div>
            </div>

            {/* Markdown Report Area */}
            <div className="p-6 md:p-8 bg-[#0e0e0e] max-h-[60vh] overflow-y-auto font-[Rajdhani] text-lg text-[#d0c5af] prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#131313] prose-pre:border prose-pre:border-[#D4AF37]/20 prose-a:text-[#D4AF37] prose-headings:font-[Orbitron] prose-headings:text-[#D4AF37] max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.analysis}
              </ReactMarkdown>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-[#D4AF37]/20 bg-[#131313] flex flex-wrap gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-[Orbitron] text-[10px] tracking-widest hover:bg-[#D4AF37]/20 transition-colors rounded"
              >
                <Copy className="w-3.5 h-3.5" /> COPY REPORT
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-[Orbitron] text-[10px] tracking-widest hover:bg-[#D4AF37]/20 transition-colors rounded"
              >
                <Download className="w-3.5 h-3.5" /> DOWNLOAD .md
              </button>
              <div className="flex-grow"></div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-[#0e0e0e] border border-[#d0c5af]/20 text-[#d0c5af]/80 font-[Orbitron] text-[10px] tracking-widest hover:text-[#d0c5af] hover:border-[#d0c5af]/50 transition-colors rounded"
              >
                <RefreshCw className="w-3.5 h-3.5" /> ANALYZE AGAIN
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function CodeSentinelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CodeSentinelContent />
    </Suspense>
  );
}