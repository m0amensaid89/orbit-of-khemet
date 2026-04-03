export function Footer() {
  return (
    <footer className="w-full py-3 border-t flex flex-col items-center justify-center gap-1 shrink-0"
      style={{ background: '#0A0A0A', borderColor: 'rgba(212,175,55,0.08)' }}>
      <div className="flex items-center gap-2">
        <img
          src="/khemet-logo.png"
          alt="Khemet AI"
          style={{ width: '20px', height: '20px', objectFit: 'contain', opacity: 0.6 }}
        />
        <span className="font-[family-name:var(--font-cinzel-decorative)] text-[8px] tracking-[3px] uppercase"
          style={{ color: 'rgba(212,175,55,0.5)' }}>
          KHEMET AI
        </span>
      </div>
      <p className="font-[Orbitron] text-[7px] tracking-widest uppercase"
        style={{ color: 'rgba(212,175,55,0.3)' }}>
        The Rise of the Grid • Leverage is the new gravity.
      </p>
      <p className="font-[Rajdhani] text-xs"
        style={{ color: 'rgba(255,255,255,0.2)' }}>
        © Orbit of Khemet — All rights reserved 2026
      </p>
    </footer>
  );
}
