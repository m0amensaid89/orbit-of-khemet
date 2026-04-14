import { Suspense } from 'react';
import ChatPage from './chat-client';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Page({ params }: { params: Promise<{ hero: string }> }) {
  const { hero } = await params;

  // Auth guard — redirect to login if not authenticated
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect('/hub');
    }
  } catch {
    // Auth check failed silently — allow page to render
  }

  return (
    <Suspense fallback={<div className="h-full bg-[#0A0A0A] flex items-center justify-center text-[#D4AF37] font-[Orbitron] animate-pulse">Establishing Link...</div>}>
      <ChatPage heroSlug={hero} />
    </Suspense>
  );
}
