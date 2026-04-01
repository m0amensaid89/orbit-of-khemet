'use client';

export default function ArtifactsPage() {
  return (
    <main className="container mx-auto px-4 py-12 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <p className="font-[Orbitron] text-[8px] tracking-[5px] uppercase mb-3" style={{ color: 'rgba(212,175,55,0.5)' }}>
          EMPIRE ENGINE
        </p>
        <h1 className="font-[Orbitron] text-4xl font-black tracking-tighter mb-2" style={{ color: '#D4AF37' }}>
          ARTIFACT GALLERY
        </h1>
        <p className="font-[Rajdhani] text-lg mb-12" style={{ color: '#d0c5af' }}>
          Your generated apps, documents, and data files.
        </p>
        <div className="flex flex-col items-center justify-center py-24 gap-4" style={{ outline: '1px solid rgba(212,175,55,0.08)', background: '#131313' }}>
          <p className="font-[Orbitron] text-xs tracking-widest uppercase" style={{ color: 'rgba(212,175,55,0.4)' }}>
            ARTIFACTS APPEAR HERE
          </p>
          <p className="font-[Rajdhani] text-sm text-center max-w-md" style={{ color: '#d0c5af' }}>
            Ask any agent to build you a dashboard, spreadsheet, or app. Your artifacts will be saved here automatically.
          </p>
        </div>
      </div>
    </main>
  );
}
