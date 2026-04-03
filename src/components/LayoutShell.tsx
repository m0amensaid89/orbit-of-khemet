'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname === '/' || pathname === '/auth' || pathname?.startsWith('/auth/');

  if (hideSidebar) {
    // Landing + auth: full width, footer visible at bottom
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    );
  }

  // App pages: sidebar + content + fixed footer
  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto pb-16">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
