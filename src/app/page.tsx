import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Full-bleed background group image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/group-banner.png"
          alt="The 7 Heroes of Khemet"
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />
        {/* Dark gradient overlay — bottom to top so text reads */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pb-24 pt-32 max-w-4xl mx-auto">
        {/* Logo */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4AF37]/60 shadow-[0_0_24px_rgba(212,175,55,0.4)] mb-8">
          <Image src="/logo.png" alt="Orbit of Khemet" fill className="object-cover" />
        </div>

        <p className="font-[Orbitron] text-[10px] tracking-[6px] uppercase text-[#D4AF37]/70 mb-4">
          The I-Gamify Grid
        </p>

        <h1 className="font-[Orbitron] text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mb-4 drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">
          ORBIT OF KHEMET
        </h1>

        <p className="font-[Rajdhani] text-xl md:text-2xl font-light text-white/70 max-w-2xl mb-12 leading-relaxed">
          7 heroes. 85 agents. One system built to transform how you work.
        </p>

        <Link href="/hub">
          <button className="font-[Orbitron] text-sm tracking-[3px] uppercase px-10 py-4 bg-[#D4AF37] text-black font-bold hover:bg-[#E8C84A] transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]">
            ENTER THE ORBIT
          </button>
        </Link>

        <p className="font-mono text-xs text-white/30 tracking-widest uppercase mt-12">
          The Rise of the Grid · Leverage is the new gravity.
        </p>
      </div>
    </main>
  );
}