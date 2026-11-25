"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import AuthLayout, { inputCls, primaryBtn } from "@/components/AuthLayout";
import { DEMO_PASSWORD, DEFAULT_PROFILE, useStore } from "@/lib/store";

function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);
  return (
    <div className="flex justify-between gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (!v) return;
            const next = (value.slice(0, i) + v + value.slice(i + 1)).slice(0, 6);
            onChange(next);
            refs.current[Math.min(5, i + 1)]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              onChange(value.slice(0, i) + value.slice(i + 1));
              refs.current[Math.max(0, i - 1)]?.focus();
            }
          }}
          onPaste={(e) => {
            const v = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (v) {
              e.preventDefault();
              onChange(v);
              refs.current[Math.min(5, v.length)]?.focus();
            }
          }}
          className="h-12 w-full rounded-xl bg-white text-center text-lg font-semibold text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500"
        />
      ))}
    </div>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const { checkCredentials, signIn, session, ready, profile } = useStore();

  const [step, setStep] = useState<"password" | "code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) router.replace(next);
  }, [ready, session, next, router]);

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Enter your email and password.");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (!checkCredentials(email, password)) return setError("That email and password combination is incorrect.");
      setStep("code");
    }, 700);
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return setError("Enter the 6-digit code.");
    setError("");
    setBusy(true);
    setTimeout(() => {
      signIn(email.trim(), remember);
      router.replace(next);
    }, 600);
  };

  if (step === "code") {
    return (
      <AuthLayout
        title="Check your phone"
        subtitle={
          <>
            We sent a 6-digit verification code to the WhatsApp number ending in <b className="text-slate-700">{profile.whatsapp.slice(-4)}</b>.
          </>
        }
      >
        <form onSubmit={submitCode} className="space-y-5">
          <CodeInput value={code} onChange={setCode} />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button className={primaryBtn} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Verify & sign in
          </button>
          <div className="rounded-xl bg-blue-50 px-3.5 py-2.5 text-xs text-blue-800 ring-1 ring-blue-100">
            <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Demo: any 6 digits work.{" "}
            <button type="button" className="font-semibold underline" onClick={() => setCode("482913")}>
              Fill code
            </button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => setStep("password")} className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button type="button" className="font-semibold text-blue-600 hover:text-blue-700">
              Resend code
            </button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Log in to your account" subtitle="Track your shipments, documents and reports in one place.">
      {params.get("signedout") && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800 ring-1 ring-emerald-100">
          <CheckCircle2 className="h-4 w-4" /> You&apos;ve been signed out.
        </div>
      )}
      {params.get("reset") && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800 ring-1 ring-emerald-100">
          <CheckCircle2 className="h-4 w-4" /> Password updated. Log in with your new password.
        </div>
      )}
      {params.get("next") && !params.get("signedout") && (
        <div className="mb-5 rounded-xl bg-slate-100 px-3.5 py-2.5 text-sm text-slate-600">Please log in to continue.</div>
      )}

      <form onSubmit={submitPassword} className="space-y-4" noValidate>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Work email</span>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className={`mt-1.5 ${inputCls}`} />
        </label>
        <label className="block">
          <span className="flex items-center justify-between text-sm font-medium text-slate-700">
            Password
            <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Forgot password?
            </Link>
          </span>
          <div className="relative mt-1.5">
            <input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputCls} pr-11`}
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:text-slate-700" aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-blue-600" />
          Keep me logged in on this device
        </label>
        {error && <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}
        <button className={primaryBtn} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Log in
        </button>
      </form>

      <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3.5 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <KeyRound className="h-3.5 w-3.5" /> Demo account
        </div>
        <div className="mt-1 font-mono">{DEFAULT_PROFILE.email}</div>
        <div className="font-mono">{DEMO_PASSWORD}</div>
        <button
          type="button"
          onClick={() => {
            setEmail(profile.email);
            setPassword(DEMO_PASSWORD);
            setError("");
          }}
          className="mt-2 font-semibold text-blue-600 hover:text-blue-700"
        >
          Fill demo login →
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        New to the Airflo portal?{" "}
        <Link href="/request-access" className="font-semibold text-blue-600 hover:text-blue-700">
          Request access
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
