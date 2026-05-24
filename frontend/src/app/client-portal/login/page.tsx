"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import RebildLogo from "@/components/rebild-logo";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { PORTAL_BASE } from "@/lib/constants";
import { FullScreenLoader } from "@/components/primitives";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display font-black text-2xl text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1">{label}</div>
    </div>
  );
}

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) {
      router.replace(user.role === "admin" ? `${PORTAL_BASE}/admin` : `${PORTAL_BASE}/client`);
    }
  }, [user, router]);

  if (user === undefined) return <FullScreenLoader />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const u = await login(email, password);
      router.replace(u.role === "admin" ? `${PORTAL_BASE}/admin` : `${PORTAL_BASE}/client`);
    } catch (e) {
      setErr((e as Error).message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen login-bg relative overflow-hidden grain-overlay">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#F77418]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#F77418]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 border-r border-white/5">
          <RebildLogo size="lg" />
          <div className="space-y-8 max-w-md">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#F77418] font-mono">
              Client Portal
            </div>
            <h1 className="font-display font-black text-5xl xl:text-6xl leading-[0.95] tracking-tight">
              Your <span className="text-[#F77418]">brand,</span>
              <br />
              rebuilt every
              <br />
              single day.
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed">
              One workspace for everything we ship for you — campaigns, creatives, invoices,
              reports and the team that makes it all happen.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <Stat label="Active services" value="04+" />
              <Stat label="Avg. response" value="< 2h" />
              <Stat label="Client NPS" value="92" />
            </div>
          </div>
          <div className="text-xs text-zinc-600 uppercase tracking-[0.2em]">
            Ads · Photo · Video · Graphics · & more
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-10 flex justify-center">
              <RebildLogo size="lg" />
            </div>

            <div className="bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#F77418] font-mono mb-3">
                Welcome back
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-white">
                Sign in to your portal
              </h2>
              <p className="text-zinc-500 text-sm mt-2">
                Use the credentials provided by your Rebild contact.
              </p>

              <form onSubmit={onSubmit} className="mt-8 space-y-5" data-testid="login-form">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-2 block">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    data-testid="login-email-input"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-[#F77418] focus:ring-2 focus:ring-[#F77418]/30 outline-none rounded-md px-4 py-3 text-white placeholder:text-zinc-600 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-2 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      data-testid="login-password-input"
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-[#F77418] focus:ring-2 focus:ring-[#F77418]/30 outline-none rounded-md px-4 py-3 pr-11 text-white placeholder:text-zinc-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      data-testid="login-toggle-password"
                      aria-label="Toggle password visibility"
                    >
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {err && (
                  <div
                    className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2"
                    data-testid="login-error"
                  >
                    {err}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  data-testid="login-submit-button"
                  className="group w-full bg-[#F77418] hover:bg-[#ff8a3d] text-black font-bold py-3.5 rounded-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Enter portal
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="text-center text-xs text-zinc-600 pt-2">
                  Need access? Contact your agency representative.
                </div>
              </form>
            </div>

            <div className="mt-8 text-center text-xs text-zinc-600 tracking-[0.2em] uppercase">
              Crafted by Rebild Marketing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
