'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';

import { GlobalNav } from '@/components/GlobalNav';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname === '/' || pathname === '/auth' || pathname?.startsWith('/auth/');

  const isHomePage = pathname === '/';

  if (hideSidebar) {
    // Landing + auth: full width, footer visible at bottom
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
        <GlobalNav />
        <div className="flex-1">{children}</div>
        <Footer isHomePage={isHomePage} />
      </div>
    );
  }

  // App pages: sidebar + content, footer spanning full width at bottom
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0A0A0A]">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — never moves on desktop */}
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

      {/* Footer — spanning full width below sidebar and content */}
      <Footer isHomePage={isHomePage} />
    </div>
  );
}
