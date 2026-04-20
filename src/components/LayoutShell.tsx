'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { GlobalNav } from '@/components/GlobalNav';
import { CommandPalette } from '@/components/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const hideSidebar = pathname === '/' || pathname === '/auth' || pathname?.startsWith('/auth/');

  const isHomePage = pathname === '/';
  const isChatPage = pathname?.startsWith('/chat');

  useKeyboardShortcuts({
    onOpenPalette: () => setPaletteOpen(true),
  });

  if (hideSidebar) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
        <GlobalNav />
        <div className="flex-1">{children}</div>
        <Footer isHomePage={isHomePage} />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0A]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="md:hidden">
          <GlobalNav />
        </div>
        <div className={`flex flex-col flex-1 ${isChatPage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {children}
        </div>
        {!isChatPage && <Footer isHomePage={isHomePage} />}
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
