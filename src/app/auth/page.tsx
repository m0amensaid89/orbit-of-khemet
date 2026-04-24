/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      if (error) throw error;
      setMessage("TRANSMISSION SENT. Check your email.");
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

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
        if ((err as Error).message.toLowerCase().includes("failed to fetch") || (err as Error).message.includes("NetworkError")) {
          setError("Network error. Please check your connection to the Empire Engine.");
        } else {
          setError((err as Error).message);
        }
      } else {
        setError("An error occurred during authentication. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative">
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

        {isResetMode ? (
          <form onSubmit={handleResetPassword} className="space-y-5">
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
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-[Orbitron] text-[12px] font-bold tracking-[3px] uppercase py-4 rounded-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SEND RESET LINK"}
            </button>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="font-[Rajdhani] text-white/50 hover:text-[#D4AF37] transition-colors text-sm"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <>
        {/* Social login section */}
        <div className="flex flex-col gap-3 mb-6">
          <p className="font-[Orbitron] text-[8px] tracking-[3px] uppercase text-center"
            style={{ color: 'rgba(212,175,55,0.5)' }}>
            CONTINUE WITH
          </p>

          {/* Google */}
          <button onClick={() => handleOAuth('google')} type="button"
            className="w-full flex items-center justify-center gap-3 py-3 transition-all"
            style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.15)', color: '#d0c5af' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-[Rajdhani] text-base">Google</span>
          </button>

          {/* GitHub */}
          <button onClick={() => handleOAuth('github')} type="button"
            className="w-full flex items-center justify-center gap-3 py-3 transition-all"
            style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.15)', color: '#d0c5af' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span className="font-[Rajdhani] text-base">GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.1)' }} />
          <span className="font-[Orbitron] text-[8px] tracking-[3px] uppercase"
            style={{ color: 'rgba(212,175,55,0.3)' }}>OR</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.1)' }} />
        </div>

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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white font-[Rajdhani] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all placeholder:text-white/20 pr-12"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#D4AF37] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isLogin && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="font-[Rajdhani] text-xs text-white/40 hover:text-[#D4AF37] transition-colors"
                >
                  Forgot your access key?
                </button>
              </div>
            )}
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
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center bg-[#0A0A0A]"><Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" /></div>}>
      <AuthForm />
    </Suspense>
  );
}
