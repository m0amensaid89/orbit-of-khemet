import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/50 bg-background/80 backdrop-blur-md py-6 z-40 relative mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-3 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/30 shadow-[0_0_8px_rgba(212,175,119,0.2)]">
            <Image src="/logo.png" alt="Orbit of Khemet Logo" fill className="object-cover" />
          </div>
          <p className="text-xs font-mono text-primary/80 tracking-widest uppercase">The Rise of the Grid • Leverage is the new gravity.</p>
        </div>
        <p className="text-sm text-muted-foreground">
          © Orbit of Khemet • Powered by{" "}
          <Link href="https://i-gamify.net" target="_blank" className="hover:text-primary transition-colors underline underline-offset-2">
            I-Gamify.net
          </Link>
        </p>
      </div>
    </footer>
  );
}
