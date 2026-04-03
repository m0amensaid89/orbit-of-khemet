import Link from "next/link";

export function Footer({ isHomePage = false }: { isHomePage?: boolean }) {
  if (!isHomePage) {
    return (
      <footer className="w-full border-t flex flex-col items-center justify-center shrink-0 py-4"
        style={{ background: '#0A0A0A', borderColor: 'rgba(212,175,55,0.08)' }}>
        <p className="font-[Orbitron] tracking-widest uppercase"
          style={{ color: 'rgba(212,175,55,0.3)', fontSize: '9px' }}>
          The Rise of the Grid • Leverage is the new gravity. © Orbit of Khemet — All rights reserved 2026
        </p>
      </footer>
    );
  }

  return (
    <footer className="w-full border-t flex flex-col items-center justify-center gap-2 shrink-0 py-6"
      style={{ background: '#0A0A0A', borderColor: 'rgba(212,175,55,0.08)' }}>
      <div className="flex items-center gap-2 mb-2">
        <img
          src="/khemet-logo.png"
          alt="Khemet AI"
          style={{ width: '20px', height: '20px', objectFit: 'contain', display: 'block', opacity: 0.7 }}
        />
        <span className="font-[family-name:var(--font-cinzel-decorative)] text-[8px] tracking-[3px] uppercase"
          style={{ color: 'rgba(212,175,55,0.5)' }}>
          KHEMET AI
        </span>
      </div>
      <p className="font-[Orbitron] text-[9px] tracking-widest uppercase text-center px-4"
        style={{ color: 'rgba(212,175,55,0.3)' }}>
        The Rise of the Grid • Leverage is the new gravity. © Orbit of Khemet — All rights reserved 2026
      </p>
    </footer>
  );
}
