import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 relative w-full h-full bg-[#0A0A0A]">
      <div className="absolute inset-0 z-0 opacity-10 flex items-center justify-center">
        <div className="w-[400px] h-[400px] bg-[#D4AF37] rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 rounded-full border border-[#D4AF37]/20 border-b-[#FFD700] animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" style={{ animationDuration: '1.5s' }} />
          </div>
        </div>

        <div className="font-[Orbitron] text-[10px] tracking-[5px] uppercase text-[#D4AF37]/70 font-bold animate-pulse">
          Establishing Link...
        </div>
      </div>
    </div>
  );
}
