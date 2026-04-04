import { Suspense } from 'react';
import ChatPage from './chat-client';

// Generate static params if needed, or allow dynamic routing
export function generateStaticParams() {
  return [
    { hero: 'master' },
    { hero: 'nexar' },
    { hero: 'horusen' },
    { hero: 'kairo' },
    { hero: 'lyra' },
    { hero: 'nefra' },
    { hero: 'ramet' },
    { hero: 'thoren' },
  ];
}

export default async function Page({ params }: { params: Promise<{ hero: string }> }) {
  const { hero } = await params;

  return (
    <Suspense fallback={<div className="h-full bg-[#0A0A0A] flex items-center justify-center text-[#D4AF37] font-[Orbitron] animate-pulse">Establishing Link...</div>}>
      <ChatPage heroSlug={hero} />
    </Suspense>
  );
}
