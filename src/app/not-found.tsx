import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <div className="w-24 h-24 rounded-full border border-[#D4AF37]/30 flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 rounded-full border border-[#D4AF37] animate-ping opacity-20" />
          <AlertTriangle className="w-10 h-10 text-[#D4AF37]" />
        </div>

        <h1 className="font-[Orbitron] text-6xl font-black text-white mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          404
        </h1>

        <div className="inline-block px-4 py-1.5 bg-red-950/30 border border-red-900/50 rounded-full mb-6">
           <span className="font-[Orbitron] text-[10px] tracking-[4px] uppercase text-red-500 font-bold">
             SIGNAL LOST
           </span>
        </div>

        <p className="font-[Rajdhani] text-lg text-white/60 mb-10">
          The grid coordinates you entered do not exist or the sector has been purged.
          Recalibrate your navigation systems.
        </p>

        <Link href="/hub">
          <button className="group relative font-[Orbitron] text-xs tracking-[3px] uppercase px-8 py-4 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] rounded flex items-center gap-3">
            <Home className="w-4 h-4" />
            <span className="relative z-10">Return to Hub</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
