"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, KeyRound, RotateCcw } from "lucide-react";
import { PAGE } from "@/components/AppShell";
import { cx } from "@/components/shipment";
import { DEMO_PASSWORD, useStore, type Profile } from "@/lib/store";

function ChangePassword() {
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const cls = "mt-1 h-10 w-full rounded-lg bg-white px-3 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500";
  return (
    <form
      id="security"
      className="scroll-mt-40 rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (cur !== DEMO_PASSWORD) return setMsg({ ok: false, text: "Your current password is incorrect." });
        if (pw.length < 8 || !/\d/.test(pw) || !/[A-Z]/.test(pw)) return setMsg({ ok: false, text: "Use at least 8 characters with a number and an uppercase letter." });
        if (pw !== pw2) return setMsg({ ok: false, text: "The new passwords don't match." });
        setMsg({ ok: true, text: "Password updated (demo — the demo password stays the same)." });
        setCur("");
        setPw("");
        setPw2("");
      }}
      noValidate
    >
      <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
        <KeyRound className="h-4 w-4 text-slate-400" /> Change password
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Current password</span>
          <input type="password" value={cur} onChange={(e) => setCur(e.target.value)} className={cls} autoComplete="current-password" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">New password</span>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className={cls} autoComplete="new-password" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Confirm new password</span>
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={cls} autoComplete="new-password" />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Update password</button>
        {msg && <span className={cx("text-sm", msg.ok ? "text-emerald-600" : "text-rose-600")}>{msg.text}</span>}
      </div>
    </form>
  );
}

type Errors = Partial<Record<keyof Profile, string>>;

function validate(p: Profile): Errors {
  const e: Errors = {};
  if (!p.firstName.trim()) e.firstName = "Required";
  if (!p.lastName.trim()) e.lastName = "Required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) e.email = "Enter a valid email address";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.billingEmail)) e.billingEmail = "Enter a valid email address";
  if (p.phone && !/^\+?[\d\s()-]{7,}$/.test(p.phone)) e.phone = "Enter a valid phone number";
  if (p.whatsapp && !/^\+?[\d\s()-]{7,}$/.test(p.whatsapp)) e.whatsapp = "Enter a valid phone number";
  if (!p.company.trim()) e.company = "Required";
  return e;
}

export default function EditProfilePage() {
  const { t, profile, saveProfile, resetProfile } = useStore();
  const router = useRouter();
  const [form, setForm] = useState<Profile>(profile);
  const [touched, setTouched] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(profile), [profile]);

  const errors = touched ? validate(form) : {};
  const dirty = JSON.stringify(form) !== JSON.stringify(profile);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setForm((f) => ({ ...f, [k]: v }));

  const input = (k: keyof Profile, label: string, opts: { type?: string; placeholder?: string; span?: boolean } = {}) => (
    <label className={cx("block", opts.span && "sm:col-span-2")}>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input
        type={opts.type ?? "text"}
        value={form[k] as string}
        placeholder={opts.placeholder}
        onChange={(e) => set(k, e.target.value as never)}
        className={cx(
          "mt-1 h-10 w-full rounded-lg bg-white px-3 text-sm text-slate-900 outline-none ring-1 transition focus:ring-2",
          errors[k] ? "ring-rose-300 focus:ring-rose-500" : "ring-slate-200 focus:ring-blue-500",
        )}
      />
      {errors[k] && <span className="mt-1 block text-xs text-rose-600">{errors[k]}</span>}
    </label>
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(validate(form)).length) return;
    saveProfile(form);
    setSaved(true);
    setTimeout(() => router.push("/profile"), 700);
  };

  const card = "rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:p-6";

  return (
    <main className={PAGE}>
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> {t("nav_profile")}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{t("edit_profile")}</h1>
      <p className="mt-1 text-sm text-slate-500">Changes apply to your portal account and to where we send shipment updates.</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]" noValidate>
        <div className="space-y-6">
          <section className={card}>
            <h2 className="text-[15px] font-semibold text-slate-900">Personal details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {input("firstName", "First name")}
              {input("lastName", "Last name")}
              {input("role", "Job title", { span: true })}
              {input("email", "Email", { type: "email" })}
              {input("phone", "Phone", { type: "tel" })}
              {input("whatsapp", "WhatsApp number (for shipment updates)", { type: "tel", span: true })}
            </div>
          </section>

          <section className={card}>
            <h2 className="text-[15px] font-semibold text-slate-900">Company</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {input("company", "Company name", { span: true })}
              {input("street", "Street & number", { span: true })}
              {input("postcode", "Postcode")}
              {input("city", "City")}
              {input("country", "Country")}
              {input("billingEmail", "Billing email", { type: "email" })}
              {input("vat", "VAT number")}
              {input("eori", "EORI number")}
            </div>
          </section>

          <section className={card}>
            <h2 className="text-[15px] font-semibold text-slate-900">Preferences</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Portal language</span>
                <select
                  value={form.language}
                  onChange={(e) => set("language", e.target.value as Profile["language"])}
                  className="mt-1 h-10 w-full rounded-lg bg-white px-3 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Time zone</span>
                <select
                  value={form.timezone}
                  onChange={(e) => set("timezone", e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg bg-white px-3 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500"
                >
                  {["Europe/Amsterdam", "Europe/London", "America/Sao_Paulo", "America/Mexico_City", "America/Bogota", "America/New_York", "Asia/Hong_Kong", "Asia/Singapore"].map((z) => (
                    <option key={z}>{z}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[150px] lg:self-start xl:top-[100px]">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-900 text-base font-semibold text-white">
                {(form.firstName[0] ?? "") + (form.lastName.split(" ").pop()?.[0] ?? "")}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {form.firstName} {form.lastName}
                </div>
                <div className="truncate text-xs text-slate-500">{form.email}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button
                type="submit"
                disabled={!dirty || saved}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4" /> Saved
                  </>
                ) : (
                  t("save")
                )}
              </button>
              <Link href="/profile" className="block w-full rounded-lg py-2.5 text-center text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">
                {t("cancel")}
              </Link>
            </div>
            {dirty && !saved && <p className="mt-3 text-center text-xs text-amber-600">You have unsaved changes</p>}
          </div>
          <button
            type="button"
            onClick={() => {
              resetProfile();
              setTouched(false);
            }}
            className="inline-flex w-full items-center justify-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset demo profile
          </button>
        </aside>
      </form>

      <div className="mt-6 lg:mr-[324px]">
        <ChangePassword />
      </div>
    </main>
  );
}
