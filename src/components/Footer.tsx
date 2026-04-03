export function Footer() {
  return (
    <footer className="w-full py-3 border-t flex flex-col items-center justify-center gap-1"
      style={{
        background: '#0A0A0A',
        borderColor: 'rgba(212,175,55,0.08)',
        zIndex: 10,
      }}>
      <div className="flex items-center gap-2 opacity-60">
        <div className="relative w-6 h-6 shrink-0">
          <img src="/khemet-logo.png" alt="Khemet AI" className="w-full h-full object-contain" />
        </div>
        <span className="font-[Orbitron] text-[8px] tracking-[3px] uppercase"
          style={{ color: 'rgba(212,175,55,0.5)' }}>
          KHEMET AI
        </span>
      </div>
      <p className="font-[Orbitron] text-[8px] tracking-widest uppercase"
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
