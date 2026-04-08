'use client';

import React, { useState } from 'react';
import { Download, RefreshCw, Loader2 } from 'lucide-react';

interface ImageCardProps {
  url?: string;
  isLoading?: boolean;
  onRegenerate?: () => void;
}

export function ImageCard({ url, isLoading = false, onRegenerate }: ImageCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleDownload = async () => {
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

  const showLoader = isLoading || (url && !isImageLoaded);

  return (
    <div className="w-full flex flex-col rounded-xl mt-4 overflow-hidden" style={{ border: '1px solid #D4AF37', background: '#0A0A0A' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: '#D4AF37', background: 'rgba(212,175,55,0.05)' }}>
        <h3 className="font-['Cinzel_Decorative'] text-[#D4AF37] text-sm tracking-widest uppercase m-0">
          VISION SUMMONED
        </h3>

        {url && !isLoading && (
            <div className="flex items-center gap-2">
            {onRegenerate && (
                <button onClick={onRegenerate} className="p-1.5 hover:bg-[#D4AF37]/20 rounded transition-colors" title="Regenerate">
                <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
                </button>
            )}
            <button onClick={handleDownload} className="p-1.5 hover:bg-[#D4AF37]/20 rounded transition-colors" title="Download Image">
                <Download className="w-4 h-4 text-[#D4AF37]" />
            </button>
            </div>
        )}
      </div>

      {/* Image / Loading Content */}
      <div className="w-full min-h-[300px] flex items-center justify-center relative bg-black/50">
        {showLoader && (
           <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10" style={{ background: '#0A0A0A' }}>
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              <span className="font-['Cinzel_Decorative'] text-[#D4AF37] text-sm">
                 Summoning the Vision from the Void...
              </span>
           </div>
        )}

        {url && (
            <img
                src={url}
                alt="Generated Vision"
                className={`w-full h-auto object-contain transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setIsImageLoaded(true)}
            />
        )}
      </div>

    </div>
  );
}
