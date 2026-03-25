import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-primary drop-shadow-[0_0_15px_rgba(244,196,48,0.5)]">
          ORBIT OF KHEMET
        </h1>

        <p className="text-xl text-secondary max-w-[600px] mb-8 drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
          The official public web platform for the Empire Engine
        </p>

        <Link href="/hub">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(244,196,48,0.4)] transition-all duration-300 border border-primary/50 text-lg px-8 py-6 rounded-none font-bold uppercase tracking-wider"
          >
            Enter the Orbit
          </Button>
        </Link>
      </div>
    </main>
  );
}
