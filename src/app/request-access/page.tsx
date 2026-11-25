"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import AuthLayout, { inputCls, primaryBtn } from "@/components/AuthLayout";

type Form = { company: string; name: string; email: string; phone: string; country: string; existing: "yes" | "no"; account: string; volume: string; lanes: string; message: string; terms: boolean };

const EMPTY: Form = { company: "", name: "", email: "", phone: "", country: "Netherlands", existing: "yes", account: "", volume: "1–5 shipments / month", lanes: "", message: "", terms: false };

export default function RequestAccessPage() {
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!f.company.trim()) e.company = "Required";
    if (!f.name.trim()) e.name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email";
    if (f.existing === "yes" && !f.account.trim()) e.account = "Add your Airflo account or a recent AWB";
    if (!f.terms) e.terms = "Please accept to continue";
    return e;
  };

  if (done)
    return (
      <AuthLayout title="Request received" subtitle="Thanks — our team will review your request.">
        <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          <p className="mt-3 text-sm text-emerald-900">
            We&apos;ll verify <b>{f.company}</b> and email <b>{f.email}</b> an invitation within one business day.
          </p>
        </div>
        <ol className="mt-6 space-y-3 text-sm text-slate-600">
          {["We check your company against our customer records", "You receive an invite link to set your password", "Log in and see all your shipments instantly"].map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <div className="mt-8 flex gap-3">
          <Link href="/" className="flex-1 rounded-xl py-3 text-center text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
            Back to website
          </Link>
          <Link href="/track" className="flex-1 rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700">
            Track a shipment
          </Link>
        </div>
      </AuthLayout>
    );

  const field = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input {...props} value={f[k] as string} onChange={(e) => set(k, e.target.value as never)} className={`mt-1.5 ${inputCls} ${errors[k] ? "ring-rose-300" : ""}`} />
      {errors[k] && <span className="mt-1 block text-xs text-rose-600">{errors[k]}</span>}
    </label>
  );

  return (
    <AuthLayout
      title="Request portal access"
      subtitle={
        <>
          Get live visibility on your Airflo shipments. Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600">
            Log in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const errs = validate();
          setErrors(errs);
          if (Object.keys(errs).length) return;
          setBusy(true);
          setTimeout(() => setDone(true), 800);
        }}
      >
        {field("company", "Company name", { placeholder: "Your company B.V." })}
        <div className="grid gap-4 sm:grid-cols-2">
          {field("name", "Full name", { autoComplete: "name" })}
          {field("phone", "Phone / WhatsApp", { type: "tel", placeholder: "+31 6 …" })}
        </div>
        {field("email", "Work email", { type: "email", autoComplete: "email", placeholder: "name@company.com" })}

        <div>
          <span className="text-sm font-medium text-slate-700">Are you already shipping with Airflo?</span>
          <div className="mt-1.5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            {(["yes", "no"] as const).map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => set("existing", v)}
                className={`rounded-lg py-2 text-sm font-semibold ${f.existing === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                {v === "yes" ? "Yes, existing customer" : "Not yet"}
              </button>
            ))}
          </div>
        </div>

        {f.existing === "yes" ? (
          field("account", "Airflo account number or a recent AWB", { placeholder: "AF-100284 or 074-12345675" })
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Expected volume</span>
              <select value={f.volume} onChange={(e) => set("volume", e.target.value)} className={`mt-1.5 ${inputCls}`}>
                {["1–5 shipments / month", "5–20 shipments / month", "20–50 shipments / month", "50+ shipments / month"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            {field("lanes", "Main destinations", { placeholder: "e.g. GRU, MEX, HKG" })}
          </div>
        )}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Country</span>
          <select value={f.country} onChange={(e) => set("country", e.target.value)} className={`mt-1.5 ${inputCls}`}>
            {["Netherlands", "Belgium", "Germany", "Brazil", "Mexico", "Colombia", "Chile", "Peru", "United States", "Other"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={f.terms} onChange={(e) => set("terms", e.target.checked)} className="mt-0.5 h-4 w-4 accent-blue-600" />
          <span>
            I agree that Airflo may contact me about this request and process my details according to the privacy policy.
            {errors.terms && <span className="block text-xs text-rose-600">{errors.terms}</span>}
          </span>
        </label>

        <button className={primaryBtn} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Request access <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </AuthLayout>
  );
}
