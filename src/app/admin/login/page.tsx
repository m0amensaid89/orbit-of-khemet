/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error("INVALID CREDENTIALS. ACCESS DENIED.");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || "AUTHENTICATION FAILED.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-6 relative overflow-hidden">
      {/* Subtle hieroglyphic eye watermark background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02]">
        <svg viewBox="0 0 100 100" className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] text-[#D4AF37] fill-current">
          <path d="M50 20 C20 20 0 50 0 50 C0 50 20 80 50 80 C80 80 100 50 100 50 C100 50 80 20 50 20 Z M50 70 C38.95 70 30 61.05 30 50 C30 38.95 38.95 30 50 30 C61.05 30 70 38.95 70 50 C70 61.05 61.05 70 50 70 Z M50 40 C44.48 40 40 44.48 40 50 C40 55.52 44.48 60 50 60 C55.52 60 60 55.52 60 50 C60 44.48 55.52 40 50 40 Z" />
        </svg>
      </div>

      <div className="w-full max-w-md bg-[#111111] border border-[#D4AF37]/20 rounded p-8 shadow-[0_0_50px_rgba(212,175,55,0.05)] relative z-10" style={{ borderRadius: '4px' }}>
        <div className="flex flex-col items-center mb-10">
          <Image
            src="/logo.png"
            alt="Orbit of Khemet Logo"
            width={70}
            height={70}
            className="mb-6 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]"
          />
          <h1 className="font-[Orbitron] text-2xl font-bold text-white tracking-[4px] uppercase text-center">
            EMPIRE COMMAND CENTER
          </h1>
          <p className="font-[Orbitron] text-[10px] tracking-[5px] text-[#D4AF37] mt-3 uppercase text-center opacity-80">
            ADMIN ACCESS ONLY
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-950/40 border border-red-500/50 text-red-400 text-sm font-[Orbitron] tracking-wider text-center" style={{ borderRadius: '2px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-[Orbitron] text-[11px] tracking-[2px] text-[#D4AF37] mb-2 uppercase">
              ADMIN ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-white/10 px-4 py-3 text-white font-[Rajdhani] focus:outline-none focus:border-[#D4AF37]/80 focus:ring-1 focus:ring-[#D4AF37]/80 transition-all placeholder:text-white/20"
              style={{ borderRadius: '2px' }}
              placeholder="Enter your commander ID"
              required
            />
          </div>
          <div>
            <label className="block font-[Orbitron] text-[11px] tracking-[2px] text-[#D4AF37] mb-2 uppercase">
              ACCESS KEY
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 px-4 py-3 text-white font-[Rajdhani] focus:outline-none focus:border-[#D4AF37]/80 focus:ring-1 focus:ring-[#D4AF37]/80 transition-all placeholder:text-white/20 pr-12"
                style={{ borderRadius: '2px' }}
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#D4AF37] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-[#D4AF37] text-black font-[Orbitron] text-[13px] font-bold tracking-[4px] uppercase py-4 hover:bg-[#FFD700] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderRadius: '2px' }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "AUTHENTICATE"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
