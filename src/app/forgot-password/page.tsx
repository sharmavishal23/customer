"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, Loader2, MailCheck, X } from "lucide-react";
import AuthLayout, { inputCls, primaryBtn } from "@/components/AuthLayout";

const RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "sent" | "reset">("email");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (step === "sent")
    return (
      <AuthLayout title="Check your inbox" subtitle={<>If an account exists for <b className="text-slate-700">{email}</b>, we&apos;ve sent a link to reset your password. The link is valid for 30 minutes.</>}>
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <MailCheck className="h-7 w-7" />
        </div>
        <div className="mt-6 space-y-3">
          <button onClick={() => setStep("reset")} className={primaryBtn}>
            Open reset link (demo)
          </button>
          <button onClick={() => setStep("email")} className="h-11 w-full rounded-xl text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">
            Use a different email
          </button>
        </div>
        <Link href="/login" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to log in
        </Link>
      </AuthLayout>
    );

  if (step === "reset")
    return (
      <AuthLayout title="Choose a new password" subtitle="Pick a strong password you don't use anywhere else.">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!RULES.every((r) => r.test(pw))) return setError("Your password doesn't meet the requirements yet.");
            if (pw !== pw2) return setError("The passwords don't match.");
            setError("");
            setBusy(true);
            setTimeout(() => router.push("/login?reset=1"), 700);
          }}
          noValidate
        >
          <label className="block">
            <span className="text-sm font-medium text-slate-700">New password</span>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className={`mt-1.5 ${inputCls}`} autoComplete="new-password" />
          </label>
          <ul className="space-y-1">
            {RULES.map((r) => {
              const ok = r.test(pw);
              return (
                <li key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-emerald-600" : "text-slate-400"}`}>
                  {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} {r.label}
                </li>
              );
            })}
          </ul>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Confirm new password</span>
            <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={`mt-1.5 ${inputCls}`} autoComplete="new-password" />
          </label>
          {error && <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}
          <button className={primaryBtn} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Update password
          </button>
          <p className="text-center text-xs text-slate-400">Demo: the portal keeps using the demo password afterwards.</p>
        </form>
      </AuthLayout>
    );

  return (
    <AuthLayout title="Reset your password" subtitle="Enter the email you use for the Airflo portal and we'll send you a reset link.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");
          setError("");
          setBusy(true);
          setTimeout(() => {
            setBusy(false);
            setStep("sent");
          }, 700);
        }}
        noValidate
      >
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Work email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className={`mt-1.5 ${inputCls}`} autoComplete="email" />
        </label>
        {error && <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}
        <button className={primaryBtn} disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link
        </button>
      </form>
      <Link href="/login" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to log in
      </Link>
    </AuthLayout>
  );
}
