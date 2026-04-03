'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

import { GlobalNav } from '@/components/GlobalNav';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname === '/' || pathname === '/auth' || pathname?.startsWith('/auth/');

  if (hideSidebar) {
    // Landing + auth: full width, footer visible at bottom
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
        <GlobalNav />
        <div className="flex-1">{children}</div>
        {/* Footer for landing page */}
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
            <a href="/privacy" className="font-[Rajdhani] text-[10px] hover:text-[#D4AF37] transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Privacy Policy
            </a>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <a href="/terms" className="font-[Rajdhani] text-[10px] hover:text-[#D4AF37] transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Terms of Service
            </a>
          </div>
          <p className="font-[Rajdhani] text-[10px] mt-1"
            style={{ color: 'rgba(255,255,255,0.2)' }}>
            © Orbit of Khemet — All rights reserved 2026
          </p>
        </footer>
      </div>
    );
  }

  // App pages: sidebar + content
  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0A]">
      {/* Sidebar — full height, never moves on desktop, includes footer */}
      <Sidebar />

      {/* Content column — scrollable */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="md:hidden">
          <GlobalNav />
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
