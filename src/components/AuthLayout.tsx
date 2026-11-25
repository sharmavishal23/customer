"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, PlaneLanding, PlaneTakeoff, TriangleAlert } from "lucide-react";
import { Logo } from "@/components/AppShell";

const FEED = [
  { I: PlaneTakeoff, tone: "bg-blue-500/20 text-blue-100", title: "Departed · KL 791", body: "42 pcs from Van Leeuwen Hydraulics, on its way to São Paulo", time: "10h ago" },
  { I: TriangleAlert, tone: "bg-amber-400/20 text-amber-100", title: "Rebooked · 5010", body: "Moved to KL 687 to Mexico City — no action needed", time: "2d ago" },
  { I: PlaneLanding, tone: "bg-emerald-400/20 text-emerald-100", title: "Arrived · 5009", body: "Landed in Mexico City · documents sent to your broker", time: "2d ago" },
];

export default function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo sub="Customer portal" href="/" />
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to website
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">{title}</h1>
            {subtitle && <div className="mt-2 text-sm text-slate-500">{subtitle}</div>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-400">
          <span>© 2026 Airflo B.V.</span>
          <span>Need help? export@airflo.example · +31 20 000 0000</span>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 lg:block">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:22px_22px]" />
        <svg className="absolute -right-24 top-24 h-[520px] w-[720px] opacity-40" viewBox="0 0 720 520" fill="none" aria-hidden>
          <path d="M20 420 C 220 80, 520 60, 700 260" stroke="white" strokeWidth="2" strokeDasharray="8 10" />
          <circle cx="20" cy="420" r="7" fill="white" />
          <circle cx="700" cy="260" r="7" fill="white" />
        </svg>
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live · 4 shipments on their way to you
            </span>
            <h2 className="mt-6 max-w-md text-3xl font-semibold leading-tight tracking-tight">Know when your cargo lands — without chasing anyone.</h2>
            <ul className="mt-6 space-y-2.5 text-sm text-blue-100">
              {["Live departure, transit and arrival times", "Arrival alerts by email and WhatsApp", "Customs-ready documents, sent to your broker"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" /> {x}
                </li>
              ))}
            </ul>
          </div>

          <div className="max-w-md space-y-3">
            {FEED.map(({ I, tone, title, body, time }) => (
              <div key={title} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 backdrop-blur">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${tone}`}>
                  <I className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                    {title} <span className="text-[11px] font-normal text-blue-200">{time}</span>
                  </div>
                  <div className="truncate text-xs text-blue-100">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const inputCls =
  "h-11 w-full rounded-xl bg-white px-3.5 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500";
export const primaryBtn =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";
