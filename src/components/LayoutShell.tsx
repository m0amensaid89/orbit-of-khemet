'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname === '/' || pathname === '/auth' || pathname?.startsWith('/auth/');

  if (hideSidebar) {
    return <div className="flex flex-col min-h-screen bg-[#0A0A0A]">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">{children}</div>
    </div>
  );
}
