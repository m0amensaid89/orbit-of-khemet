'use client';

import { useState } from 'react';
import { Artifact } from '@/lib/artifacts';
import { Download, Code, Eye, Copy, Check } from 'lucide-react';

interface ArtifactRendererProps {
  artifact: Artifact;
  title: string;
}

export function ArtifactRenderer({ artifact, title }: ArtifactRendererProps) {
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (artifact.type === 'html') {
      const blob = new Blob([artifact.content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (artifact.type === 'csv') {
      const { utils, writeFile } = await import('xlsx');
      const rows = artifact.content.trim().split('\n').map(r => r.split(','));
      const ws = utils.aoa_to_sheet(rows);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Sheet1');
      writeFile(wb, `${title.replace(/\s+/g, '-').toLowerCase()}.xlsx`);
    } else if (artifact.type === 'json') {
      const blob = new Blob([artifact.content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (artifact.type === 'markdown') {
      const blob = new Blob([artifact.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([artifact.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="mt-3 rounded-sm overflow-hidden"
      style={{ background: '#0e0e0e', outline: '1px solid rgba(212,175,55,0.15)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid rgba(212,175,55,0.1)', background: '#131313' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D4AF37' }} />
          <span className="font-[Orbitron] text-[9px] tracking-[2px] uppercase"
            style={{ color: '#D4AF37' }}>{title}</span>
          <span className="font-mono text-[8px] px-1.5 py-0.5 rounded-sm"
            style={{ background: 'rgba(212,175,55,0.1)', color: 'rgba(212,175,55,0.6)' }}>
            {artifact.language?.toUpperCase() || artifact.type?.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {artifact.type === 'html' && (
            <>
              <button onClick={() => setView('preview')}
                className="flex items-center gap-1 px-2 py-1 text-[9px] font-[Orbitron] tracking-wider uppercase transition-all"
                style={{ color: view === 'preview' ? '#D4AF37' : 'rgba(255,255,255,0.3)',
                  background: view === 'preview' ? 'rgba(212,175,55,0.1)' : 'transparent' }}>
                <Eye className="w-3 h-3" /> Preview
              </button>
              <button onClick={() => setView('code')}
                className="flex items-center gap-1 px-2 py-1 text-[9px] font-[Orbitron] tracking-wider uppercase transition-all"
                style={{ color: view === 'code' ? '#D4AF37' : 'rgba(255,255,255,0.3)',
                  background: view === 'code' ? 'rgba(212,175,55,0.1)' : 'transparent' }}>
                <Code className="w-3 h-3" /> Code
              </button>
            </>
          )}
          <button onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-[9px] font-[Orbitron] tracking-wider uppercase transition-all"
            style={{ color: copied ? '#4ECDC4' : 'rgba(255,255,255,0.3)' }}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 text-[9px] font-[Orbitron] tracking-wider uppercase transition-all hover:text-[#D4AF37]"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Download className="w-3 h-3" /> Download
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {artifact.type === 'html' && view === 'preview' ? (
          <iframe
            srcDoc={artifact.content}
            className="w-full border-0"
            style={{ height: '400px', background: '#fff' }}
            sandbox="allow-scripts allow-same-origin"
            title={title}
          />
        ) : artifact.type === 'csv' ? (
          <CSVPreview content={artifact.content} />
        ) : artifact.type === 'json' ? (
          <pre className="p-4 text-xs overflow-auto max-h-64 font-mono"
            style={{ color: '#d0c5af' }}>
            {JSON.stringify(JSON.parse(artifact.content), null, 2)}
          </pre>
        ) : (
          <pre className="p-4 text-xs overflow-auto max-h-64 font-mono"
            style={{ color: '#d0c5af' }}>
            {artifact.content}
          </pre>
        )}
      </div>
    </div>
  );
}

function CSVPreview({ content }: { content: string }) {
  const rows = content.trim().split('\n').map(r => r.split(','));
  const headers = rows[0] || [];
  const data = rows.slice(1);

  return (
    <div className="overflow-auto max-h-64">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-[Orbitron] text-[8px] tracking-widest uppercase"
                style={{ color: '#D4AF37' }}>{h.trim()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-1.5"
                  style={{ color: '#d0c5af' }}>{cell.trim()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
