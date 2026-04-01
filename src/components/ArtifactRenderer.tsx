'use client';

import { useState } from 'react';
import { Artifact } from '@/lib/artifacts';
import { Download, Code, Eye, Copy, Check } from 'lucide-react';

interface ArtifactRendererProps {
  artifact: Artifact;
  title: string;
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
              <th key={i} className="px-3 py-2 text-left" style={{ color: '#D4AF37', fontFamily: 'Orbitron', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase' }}>{h.trim()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-1.5" style={{ color: '#d0c5af' }}>{cell.trim()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ArtifactRenderer({ artifact, title }: ArtifactRendererProps) {
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const slug = title.replace(/\s+/g, '-').toLowerCase();
    let blob: Blob;
    let filename: string;
    if (artifact.type === 'html') {
      blob = new Blob([artifact.content], { type: 'text/html' });
      filename = `${slug}.html`;
    } else if (artifact.type === 'csv') {
      blob = new Blob([artifact.content], { type: 'text/csv' });
      filename = `${slug}.csv`;
    } else if (artifact.type === 'json') {
      blob = new Blob([artifact.content], { type: 'application/json' });
      filename = `${slug}.json`;
    } else if (artifact.type === 'markdown') {
      blob = new Blob([artifact.content], { type: 'text/markdown' });
      filename = `${slug}.md`;
    } else {
      blob = new Blob([artifact.content], { type: 'text/plain' });
      filename = `${slug}.txt`;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-3 rounded-sm overflow-hidden" style={{ background: '#0e0e0e', outline: '1px solid rgba(212,175,55,0.15)' }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)', background: '#131313' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D4AF37' }} />
          <span style={{ color: '#D4AF37', fontFamily: 'Orbitron', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase' }}>{title}</span>
          <span className="px-1.5 py-0.5 rounded-sm font-mono text-[8px]" style={{ background: 'rgba(212,175,55,0.1)', color: 'rgba(212,175,55,0.6)' }}>
            {artifact.language?.toUpperCase() || artifact.type?.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {artifact.type === 'html' && (
            <>
              <button onClick={() => setView('preview')} className="flex items-center gap-1 px-2 py-1 transition-all" style={{ color: view === 'preview' ? '#D4AF37' : 'rgba(255,255,255,0.3)', background: view === 'preview' ? 'rgba(212,175,55,0.1)' : 'transparent', fontFamily: 'Orbitron', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <Eye className="w-3 h-3" /> Preview
              </button>
              <button onClick={() => setView('code')} className="flex items-center gap-1 px-2 py-1 transition-all" style={{ color: view === 'code' ? '#D4AF37' : 'rgba(255,255,255,0.3)', background: view === 'code' ? 'rgba(212,175,55,0.1)' : 'transparent', fontFamily: 'Orbitron', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <Code className="w-3 h-3" /> Code
              </button>
            </>
          )}
          <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-1" style={{ color: copied ? '#4ECDC4' : 'rgba(255,255,255,0.3)', fontFamily: 'Orbitron', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1 px-2 py-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Orbitron', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Download className="w-3 h-3" /> Download
          </button>
        </div>
      </div>
      <div className="relative">
        {artifact.type === 'html' && view === 'preview' ? (
          <iframe srcDoc={artifact.content} className="w-full border-0" style={{ height: '400px', background: '#fff' }} sandbox="allow-scripts allow-same-origin" title={title} />
        ) : artifact.type === 'csv' ? (
          <CSVPreview content={artifact.content} />
        ) : artifact.type === 'json' ? (
          <pre className="p-4 text-xs overflow-auto max-h-64 font-mono" style={{ color: '#d0c5af' }}>
            {(() => { try { return JSON.stringify(JSON.parse(artifact.content), null, 2); } catch { return artifact.content; } })()}
          </pre>
        ) : (
          <pre className="p-4 text-xs overflow-auto max-h-64 font-mono" style={{ color: '#d0c5af' }}>{artifact.content}</pre>
        )}
      </div>
    </div>
  );
}
