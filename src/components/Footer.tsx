import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full py-8 border-t border-border/10 bg-black relative z-10 flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/50">
          <Image src="/logo.png" alt="Orbit of Khemet Logo" fill className="object-cover" />
        </div>
      </div>

      <p className="font-[Orbitron] text-[10px] tracking-widest text-primary/50 uppercase">
        The Rise of the Grid • Leverage is the new gravity.
      </p>

      <p className="font-[Rajdhani] text-sm text-muted-foreground/50">
        © Orbit of Khemet • Powered by{" "}
        <Link href="https://i-gamify.net" target="_blank" className="hover:text-primary transition-colors hover:underline">
          I-Gamify.net
        </Link>
      </p>
    </footer>
  );
}
