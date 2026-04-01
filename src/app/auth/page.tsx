"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const redirectUrl = searchParams.get("redirect") || "/hub";
        router.push(redirectUrl);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback${
              searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""
            }`,
          },
        });
        if (error) throw error;
        // In Supabase, if auto-confirm is enabled, it logs them in directly.
        // Even if not, it's safe to redirect or show a message.
        // Let's redirect them to /hub automatically or show a success message if email verification is required.
        const redirectUrl = searchParams.get("redirect") || "/hub";
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        // If the error message is something cryptic like "Failed to fetch", provide a clearer one
        if (err.message.toLowerCase().includes("failed to fetch") || err.message.includes("NetworkError")) {
          setError("Network error. Please check your connection to the Empire Engine.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An error occurred during authentication. Please try again.");
      }
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
            {isLogin ? "Ascend the Grid" : "Join the Empire"}
          </h1>
          <p className="font-[Rajdhani] text-white/50 mt-2 text-center">
            {isLogin
              ? "Sign in to command your agents."
              : "Create an account to forge your legacy."}
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

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block font-[Orbitron] text-[10px] tracking-widest text-[#D4AF37] mb-2 uppercase">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white font-[Rajdhani] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all placeholder:text-white/20"
              placeholder="commander@khemet.com"
              required
            />
          </div>
          <div>
            <label className="block font-[Orbitron] text-[10px] tracking-widest text-[#D4AF37] mb-2 uppercase">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white font-[Rajdhani] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all placeholder:text-white/20"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-[Orbitron] text-[12px] font-bold tracking-[3px] uppercase py-4 rounded-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isLogin ? "Deploy" : "Initialize Node"
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setMessage(null);
            }}
            className="font-[Rajdhani] text-white/50 hover:text-[#D4AF37] transition-colors text-sm"
          >
            {isLogin
              ? "Don't have an access code? Sign up."
              : "Already a commander? Sign in."}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]"><Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" /></div>}>
      <AuthForm />
    </Suspense>
  );
}
