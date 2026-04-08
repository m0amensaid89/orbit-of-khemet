'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Download } from 'lucide-react';

interface DocumentViewCardProps {
  markdown: string;
}

export function DocumentViewCard({ markdown }: DocumentViewCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scroll_inscribed.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col rounded-xl mt-4" style={{ border: '1px solid #D4AF37', background: '#0A0A0A' }}>

      {/* Header & Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b rounded-t-xl" style={{ borderColor: '#D4AF37', background: 'rgba(212,175,55,0.05)' }}>
        <h3 className="font-['Cinzel_Decorative'] text-[#D4AF37] text-sm tracking-widest uppercase m-0">
          SCROLL INSCRIBED
        </h3>

        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="p-1.5 hover:bg-[#D4AF37]/20 rounded transition-colors" title="Copy Markdown">
            <Copy className="w-4 h-4 text-[#D4AF37]" />
          </button>
          <button onClick={handleDownload} className="p-1.5 hover:bg-[#D4AF37]/20 rounded transition-colors" title="Download .md">
            <Download className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>
      </div>

      {/* Markdown Content */}
      <div className="p-6 overflow-y-auto max-h-[600px] text-white/90 prose prose-invert prose-headings:font-['Cinzel_Decorative'] prose-headings:text-[#D4AF37] prose-a:text-[#06b6d4] hover:prose-a:text-[#D4AF37] marker:text-[#D4AF37]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdown}
        </ReactMarkdown>
      </div>

    </div>
  );
}
