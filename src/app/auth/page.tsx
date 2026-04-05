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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!isLogin && password !== repeatPassword) {
        throw new Error("Passwords do not match.");
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const redirectUrl = searchParams.get("redirect") || "/master-orbit";
        router.push(redirectUrl);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              phone: phone,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback${
              searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""
            }`,
          },
        });
        if (error) throw error;
        const redirectUrl = searchParams.get("redirect") || "/master-orbit";
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative bg-[#0B0B0B]">
      <div className="w-full max-w-md relative z-10 flex flex-col items-center">

        <div className="flex flex-col items-center mb-10">
          <Image
            src="/khemet-logo.png"
            alt="Orbit of Khemet Logo"
            width={80}
            height={80}
            className="mb-4"
          />
          <h1 className="font-cinzel text-3xl text-white tracking-widest mt-2 uppercase">
            VOICE OF KHEMET
          </h1>
        </div>

        <div className="w-full flex mb-8">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 text-center py-3 font-sans text-lg font-medium transition-colors border-b-2 ${isLogin ? 'text-white border-[#D4AF37]' : 'text-white/40 border-white/10 hover:text-white/60'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 text-center py-3 font-sans text-lg font-medium transition-colors border-b-2 ${!isLogin ? 'text-white border-[#D4AF37]' : 'text-white/40 border-white/10 hover:text-white/60'}`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="w-full mb-6 p-4 bg-red-950/50 border border-red-500/50 rounded-lg text-red-200 text-sm font-sans text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="w-full mb-6 p-4 bg-green-950/50 border border-green-500/50 rounded-lg text-green-200 text-sm font-sans text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="w-full space-y-4">
          {!isLogin && (
            <div className="flex gap-4">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-4 text-white font-sans focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                placeholder="First Name"
                required
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-4 text-white font-sans focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                placeholder="Last Name"
                required
              />
            </div>
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-4 text-white font-sans focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
            placeholder="Email address"
            required
          />

          {!isLogin && (
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-4 text-white font-sans focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
              placeholder="+20 XXX XXX XXXX"
            />
          )}

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-4 text-white font-sans focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
              placeholder="Password"
              required
              minLength={6}
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>

          {!isLogin && (
            <div className="relative">
              <input
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-4 text-white font-sans focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                placeholder="Repeat Password"
                required
                minLength={6}
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          )}

          {isLogin && (
            <div className="flex justify-end mb-4">
              <button type="button" className="text-white/40 hover:text-white/80 text-sm transition-colors">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 flex items-center justify-center gap-2 bg-[#D1AE45] text-black font-sans text-lg font-bold py-4 rounded-lg hover:bg-[#D1AE45]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isLogin ? "Sign In" : "Create Free Account"
            )}
          </button>
        </form>

        {!isLogin && (
          <p className="mt-8 text-white/30 text-sm text-center">
            By continuing you agree to our Terms of Service
          </p>
        )}
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
