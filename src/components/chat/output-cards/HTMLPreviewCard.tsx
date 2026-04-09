'use client';

import React, { useRef } from 'react';
import { Maximize, Copy, ExternalLink, Download } from 'lucide-react';

interface HTMLPreviewCardProps {
  content: string;
}

export function HTMLPreviewCard({ content }: HTMLPreviewCardProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vision_materialized.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleFullScreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="w-full flex flex-col rounded-xl overflow-hidden mt-4" style={{ border: '1px solid #D4AF37', background: '#0A0A0A' }}>

      {/* Header & Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: '#D4AF37', background: 'rgba(212,175,55,0.05)' }}>
        <h3 className="font-['Cinzel_Decorative'] text-[#D4AF37] text-sm tracking-widest uppercase m-0">
          VISION MATERIALIZED
        </h3>

        <div className="flex items-center gap-2">
          <button onClick={handleFullScreen} className="p-1.5 hover:bg-[#D4AF37]/20 rounded transition-colors" title="Full Screen">
            <Maximize className="w-4 h-4 text-[#D4AF37]" />
          </button>
          <button onClick={handleCopy} className="p-1.5 hover:bg-[#D4AF37]/20 rounded transition-colors" title="Copy Code">
            <Copy className="w-4 h-4 text-[#D4AF37]" />
          </button>
          <button onClick={handleOpenNewTab} className="p-1.5 hover:bg-[#D4AF37]/20 rounded transition-colors" title="Open in New Tab">
            <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
          </button>
          <button onClick={handleDownload} className="p-1.5 hover:bg-[#D4AF37]/20 rounded transition-colors" title="Download .html">
            <Download className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>
      </div>

      {/* Iframe content */}
      <div style={{ color: 'gold', padding: '8px', fontSize: '12px' }}>
        HTML Preview — {content?.length || 0} characters loaded
      </div>
      <div className="w-full h-[480px] bg-white relative">
        <iframe
          ref={iframeRef}
          srcDoc={content}
          sandbox="allow-scripts"
          style={{ width: '100%', height: '480px', border: 'none', background: '#fff' }}
          title="Generated Website Preview"
        />
      </div>

    </div>
  );
}
