"use client";

import { useState } from "react";
import { VideoGenerationLoader } from "@/components/ui/VideoGenerationLoader";

export const VideoQualitySelector = ({ prompt, onSelect }: { prompt: string, onSelect: (type: string) => void }) => {
  const [selectedType, setSelectedType] = useState<string>("video_standard");

  return (
    <div style={{
      background: 'rgba(212,175,55,0.05)',
      border: '1px solid rgba(212,175,55,0.2)',
      borderRadius: '4px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#D4AF37', fontFamily: 'monospace' }}>
        SELECT VIDEO QUALITY
      </div>
      <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
        {[
          { type: 'video_quick',     label: 'QUICK (480p)',     model: 'Kling Turbo', credits: 2,  desc: 'Fast preview' },
          { type: 'video_standard',  label: 'PROFESSIONAL (1080p)', model: 'Kling Pro', credits: 5,  desc: 'Standard quality' },
          { type: 'video_cinematic', label: 'CINEMATIC 4K (2160p)', model: 'Veo 3.1', credits: 12, desc: 'Premium quality' },
        ].map(opt => (
          <button key={opt.type} onClick={() => setSelectedType(opt.type)} type="button"
            style={{
              flex: 1,
              background: 'transparent',
              border: selectedType === opt.type ? '1px solid #D4AF37' : '1px solid rgba(212,175,55,0.3)',
              borderRadius: '4px',
              padding: '16px 12px',
              color: '#D4AF37',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              fontFamily: 'monospace',
              fontSize: '11px',
              letterSpacing: '0.08em',
              gap: '8px',
              textAlign: 'left'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: '1px solid #D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {selectedType === opt.type && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4AF37' }} />}
              </div>
              <span style={{ fontWeight: 'bold' }}>{opt.label}</span>
            </div>
            <span style={{ opacity: 0.6 }}>{opt.credits} credits</span>
            <span style={{ opacity: 0.6, fontSize: '9px' }}>{opt.desc}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => onSelect(selectedType)}
        style={{
          marginTop: '8px',
          background: '#D4AF37',
          color: '#0A0A0A',
          border: 'none',
          borderRadius: '4px',
          padding: '12px',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '0.1em',
          cursor: 'pointer',
        }}
      >
        GENERATE VIDEO
      </button>
    </div>
  );
};

export const VideoGenerating = ({ model }: { model: string }) => (
  <div style={{ padding: '20px', textAlign: 'center', color: '#D4AF37', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.1em' }}>
    <div>GENERATING WITH {model.toUpperCase()}</div>
    <VideoGenerationLoader />
  </div>
);

export const VideoResult = ({ videoUrl, platform, creditsUsed }: { videoUrl: string, platform: string, creditsUsed: number }) => (
  <div style={{ borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)' }}>
    <video controls autoPlay style={{ width: '100%', maxHeight: '400px', background: '#0A0A0A' }}>
      <source src={videoUrl} type="video/mp4" />
    </video>
    <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)' }}>
      <a href={videoUrl} download style={{ color: '#D4AF37', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.08em', textDecoration: 'none' }}>
        DOWNLOAD VIDEO
      </a>
      <span style={{ color: '#D4AF37', fontSize: '10px', fontFamily: 'monospace', opacity: 0.6 }}>
        {platform} · {creditsUsed} credits
      </span>
    </div>
  </div>
);