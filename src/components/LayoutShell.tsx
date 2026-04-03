'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname === '/' || pathname === '/auth' || pathname?.startsWith('/auth/');

  if (hideSidebar) {
    return <div className="flex flex-col min-h-screen bg-[#0A0A0A]">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      <div className="flex-1 overflow-auto pb-16">{children}</div>
      <Footer />
    </div>
  );
}
