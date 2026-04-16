/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function ResetForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessage("ACCESS KEY UPDATED.");
      setTimeout(() => {
        router.push("/hub");
        router.refresh();
      }, 2000);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-md bg-[#131313] border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10">

        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="Orbit of Khemet Logo"
            width={60}
            height={60}
            className="mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
          />
          <h1 className="font-[Orbitron] text-2xl font-bold text-white tracking-widest uppercase">
            Reset Access Key
          </h1>
          <p className="font-[Rajdhani] text-white/50 mt-2 text-center">
            Enter your new secure access key.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-500/50 rounded-lg text-red-200 text-sm font-[Rajdhani] text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-950/50 border border-green-500/50 rounded-lg text-green-200 text-sm font-[Rajdhani] text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="block font-[Orbitron] text-[10px] tracking-widest text-[#D4AF37] mb-2 uppercase">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white font-[Rajdhani] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all placeholder:text-white/20 pr-12"
                placeholder="••••••••"
                required
                minLength={8}
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

          <div>
            <label className="block font-[Orbitron] text-[10px] tracking-widest text-[#D4AF37] mb-2 uppercase">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white font-[Rajdhani] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all placeholder:text-white/20"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-[Orbitron] text-[12px] font-bold tracking-[3px] uppercase py-4 rounded-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "UPDATE KEY"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]"><Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" /></div>}>
      <ResetForm />
    </Suspense>
  );
}
