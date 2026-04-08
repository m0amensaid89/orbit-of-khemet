'use client';

import React, { useEffect, useRef } from 'react';
import { Copy } from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

interface CodeBlockCardProps {
  code: string;
  language: string;
}

export function CodeBlockCard({ code, language }: CodeBlockCardProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
       // Only highlight if language is set and known by hljs, else auto-detect.
       // Delete 'language-...' class first to allow re-render highlight
       codeRef.current.className = '';
       if (language && language !== 'text' && hljs.getLanguage(language)) {
          codeRef.current.classList.add(`language-${language}`);
       }
       hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="w-full flex flex-col rounded-xl mt-4 overflow-hidden" style={{ border: '1px solid #D4AF37', background: '#0A0A0A' }}>

      {/* Header & Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: '#D4AF37', background: 'rgba(212,175,55,0.05)' }}>
        <div className="flex items-center gap-3">
            <h3 className="font-['Cinzel_Decorative'] text-[#D4AF37] text-sm tracking-widest uppercase m-0">
            BLUEPRINT FORGED
            </h3>
            {language && (
                <span className="text-xs font-['Orbitron'] text-white/50 bg-white/5 px-2 py-0.5 rounded">
                    {language}
                </span>
            )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="p-1.5 hover:bg-[#D4AF37]/20 rounded transition-colors" title="Copy Code">
            <Copy className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative">
        <pre className="m-0 p-4 overflow-x-auto text-[13px] leading-[1.6]">
            <code ref={codeRef} className={language ? `language-${language}` : ''}>
                {code}
            </code>
        </pre>
      </div>

    </div>
  );
}
