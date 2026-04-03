import Link from "next/link";

export function Footer({ isHomePage = false }: { isHomePage?: boolean }) {
  if (!isHomePage) {
    return (
      <footer className="w-full py-2 border-t flex flex-col items-center justify-center shrink-0"
        style={{ background: '#0A0A0A', borderColor: 'rgba(212,175,55,0.08)' }}>
        <p className="font-[Orbitron] tracking-widest uppercase m-0 leading-none"
          style={{ color: 'rgba(212,175,55,0.3)', fontSize: '9px' }}>
          The Rise of the Grid • Leverage is the new gravity. © Orbit of Khemet — All rights reserved 2026
        </p>
      </footer>
    );
  }

  return (
    <footer className="w-full py-4 border-t flex flex-col items-center justify-center gap-2 shrink-0"
      style={{ background: '#0A0A0A', borderColor: 'rgba(212,175,55,0.08)' }}>
      <div className="flex items-center gap-2">
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
      <p className="font-[Orbitron] text-[7px] tracking-widest uppercase"
        style={{ color: 'rgba(212,175,55,0.3)' }}>
        The Rise of the Grid • Leverage is the new gravity.
      </p>
      <div className="flex items-center gap-4 mt-1">
        <Link href="/privacy" className="font-[Rajdhani] text-[10px] hover:text-[#D4AF37] transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Privacy Policy
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <Link href="/terms" className="font-[Rajdhani] text-[10px] hover:text-[#D4AF37] transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Terms of Service
        </Link>
      </div>
      <p className="font-[Rajdhani] text-[10px] mt-1"
        style={{ color: 'rgba(255,255,255,0.2)' }}>
        © Orbit of Khemet — All rights reserved 2026
      </p>
    </footer>
  );
}
