'use client';

import React, { useState } from 'react';
import { Download, RefreshCw, Loader2, Maximize2, X } from 'lucide-react';

interface ImageOutputProps {
  urls?: string[]; // Handle array of URLs
  isLoading?: boolean;
  onRegenerate?: () => void;
  onRefine?: (url: string) => void;
  onUseAsReference?: (url: string) => void;
}

export function ImageOutput({ urls = [], isLoading = false, onRegenerate, onRefine, onUseAsReference }: ImageOutputProps) {
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const handleDownload = async (url: string) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'vision_summoned.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const showLoader = isLoading || (urls.length > 0 && urls.some((_, i) => !loadedImages[i]));

  // If we receive a single URL fallback
  const displayUrls = urls;

  return (
    <>
      <div className="w-full flex flex-col rounded-xl mt-4 overflow-hidden" style={{ border: '1px solid #D4AF37', background: '#0A0A0A' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: '#D4AF37', background: 'rgba(212,175,55,0.05)' }}>
          <h3 className="font-['Cinzel_Decorative'] text-[#D4AF37] text-sm tracking-widest uppercase m-0">
            VISION SUMMONED
          </h3>
          {displayUrls.length > 0 && !isLoading && (
              <div className="flex items-center gap-2">
              {onRegenerate && (
                  <button onClick={onRegenerate} className="p-1.5 hover:bg-[#D4AF37]/20 rounded transition-colors" title="Regenerate">
                  <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
                  </button>
              )}
              </div>
          )}
        </div>

        {/* Content */}
        <div className="w-full min-h-[300px] relative bg-[#0A0A0A] p-2">
          {showLoader && (
             <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10" style={{ background: '#0A0A0A' }}>
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                <span className="font-['Cinzel_Decorative'] text-[#D4AF37] text-sm">
                   Summoning the Vision from the Void...
                </span>
             </div>
          )}

          {displayUrls.length > 0 && (
              <div className={`grid gap-2 ${displayUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {displayUrls.map((url, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden" style={{ border: '1px solid transparent' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#D4AF37'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                    <img
                        src={url}
                        alt={`Generated Vision ${i + 1}`}
                        className={`w-full h-auto object-cover transition-opacity duration-500 cursor-pointer ${loadedImages[i] ? 'opacity-100' : 'opacity-0'}`}
                        style={{ aspectRatio: '1/1' }}
                        onLoad={() => setLoadedImages(prev => ({ ...prev, [i]: true }))}
                        onClick={() => setFullscreenImage(url)}
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                       <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleDownload(url); }} className="p-2 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40 rounded-full transition-colors text-[#D4AF37]" title="Download Image">
                             <Download className="w-5 h-5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setFullscreenImage(url); }} className="p-2 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40 rounded-full transition-colors text-[#D4AF37]" title="View Fullscreen">
                             <Maximize2 className="w-5 h-5" />
                          </button>
                       </div>
                       {onRefine && (
                         <button onClick={(e) => { e.stopPropagation(); onRefine(url); }} className="px-3 py-1.5 text-xs font-['Orbitron'] bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40 rounded border border-[#D4AF37]/50 transition-colors text-[#D4AF37] w-full max-w-[150px]">
                           REFINE IMAGE
                         </button>
                       )}
                       {onUseAsReference && (
                         <button onClick={(e) => { e.stopPropagation(); onUseAsReference(url); }} className="px-3 py-1.5 text-xs font-['Orbitron'] bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40 rounded border border-[#D4AF37]/50 transition-colors text-[#D4AF37] w-full max-w-[150px]">
                           USE AS REFERENCE
                         </button>
                       )}
                    </div>
                  </div>
                ))}
              </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setFullscreenImage(null)}>
          <button
            className="absolute top-4 right-4 p-2 bg-[#0A0A0A] border border-[#D4AF37] rounded-full text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors z-50"
            onClick={(e) => { e.stopPropagation(); setFullscreenImage(null); }}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={fullscreenImage}
            alt="Fullscreen Vision"
            className="max-w-full max-h-full object-contain border border-[#D4AF37]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
