export default function HeroPageLoading() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero splash skeleton */}
      <div className="relative w-full min-h-[60vh] flex flex-col md:flex-row overflow-hidden border-b"
        style={{ borderColor: 'rgba(212,175,55,0.1)', background: '#0A0A0A' }}>

        {/* Left image skeleton */}
        <div className="relative md:w-2/5 w-full min-h-[500px] md:min-h-0"
          style={{ background: 'linear-gradient(135deg, #111111 0%, #0A0A0A 100%)' }}>
          <div className="absolute inset-0 animate-pulse"
            style={{ background: 'rgba(212,175,55,0.03)' }} />
        </div>

        {/* Right identity skeleton */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 gap-6">
          {/* Archetype label skeleton */}
          <div className="h-3 w-48 rounded animate-pulse"
            style={{ background: 'rgba(212,175,55,0.15)' }} />

          {/* Hero name skeleton */}
          <div className="space-y-3">
            <div className="h-10 w-40 rounded animate-pulse"
              style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="h-6 w-64 rounded animate-pulse"
              style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>

          {/* Bio skeleton */}
          <div className="space-y-2 max-w-lg">
            <div className="h-3 w-full rounded animate-pulse"
              style={{ background: 'rgba(212,175,55,0.06)' }} />
            <div className="h-3 w-5/6 rounded animate-pulse"
              style={{ background: 'rgba(212,175,55,0.06)' }} />
            <div className="h-3 w-4/6 rounded animate-pulse"
              style={{ background: 'rgba(212,175,55,0.06)' }} />
          </div>

          {/* CTA buttons skeleton */}
          <div className="flex gap-4">
            <div className="h-10 w-36 rounded animate-pulse"
              style={{ background: 'rgba(212,175,55,0.12)' }} />
            <div className="h-10 w-36 rounded animate-pulse"
              style={{ background: 'rgba(212,175,55,0.06)' }} />
          </div>
        </div>
      </div>

      {/* Agent grid skeleton */}
      <div className="px-6 md:px-12 py-12">
        <div className="h-6 w-48 rounded mb-8 animate-pulse"
          style={{ background: 'rgba(212,175,55,0.1)' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded animate-pulse"
              style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.08)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
