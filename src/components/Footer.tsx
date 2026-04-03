import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full py-3 border-t border-border/10 bg-[#0A0A0A] fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center justify-center gap-1">
      <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/50">
          <Image src="/logo.png" alt="Orbit of Khemet Logo" fill className="object-cover" />
        </div>
      </div>

      <p className="font-[Orbitron] text-[10px] tracking-widest text-primary/50 uppercase">
        The Rise of the Grid • Leverage is the new gravity.
      </p>

      <p className="font-[Rajdhani] text-sm text-muted-foreground/50">
        © Orbit of Khemet — All rights reserved 2026
      </p>
    </footer>
  );
}
