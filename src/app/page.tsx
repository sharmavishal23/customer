"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Globe2,
  MessageCircle,
  PackageCheck,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  TriangleAlert,
  Truck,
  Zap,
} from "lucide-react";
import RouteMap from "@/components/RouteMap";
import { SHIPMENTS } from "@/lib/data";

const DEMO = SHIPMENTS[0];

const FEATURES = [
  { I: Radio, h: "Live flight tracking", p: "Actual departure and arrival times straight from live flight data — including transit stops and ETA changes." },
  { I: Truck, h: "Pick-up to arrival", p: "Every milestone in one timeline: pick-up at your door, loaded on aircraft, departed, in transit and landed." },
  { I: Bell, h: "Proactive alerts", p: "Get an email or WhatsApp message the moment something happens. Delays and offloads are flagged instantly." },
  { I: FileText, h: "All documents", p: "Air Waybills, invoices, packing lists and proof of delivery — always available, never lost in an inbox." },
  { I: BarChart3, h: "Performance reports", p: "Volumes, on-time performance and lane insights you can export and share with your own customers." },
  { I: Globe2, h: "Built for every market", p: "Available in English and Spanish, with local times at every airport — ready for Latin America." },
];

const MILESTONES = [
  { I: Truck, label: "Picked up", time: "07:10", src: "Trucking partner" },
  { I: PackageCheck, label: "Loaded on aircraft", time: "17:42", src: "Airline handling" },
  { I: PlaneTakeoff, label: "Departed AMS", time: "20:34", src: "Live flight data" },
  { I: RefreshCw, label: "Transit hub", time: "—", src: "Live flight data" },
  { I: PlaneLanding, label: "Arrived HKG", time: "21:45", src: "Live flight data" },
];

const FAQ = [
  { q: "Who can use the Airflo portal?", a: "Every Airflo customer. Request access with your company details or a recent AWB number and we'll send you an invitation, usually within one business day." },
  { q: "Where does the tracking data come from?", a: "We combine our own booking system with live flight data and confirmations from our trucking and airline handling partners. Each milestone shows its source so you know how it was captured." },
  { q: "What happens if my shipment is offloaded?", a: "You'll see it in the portal immediately and get a notification with the new flight and ETA. The old flight number is kept for reference." },
  { q: "Can my colleagues or my own customers follow shipments?", a: "Yes. Invite colleagues to your company account, add extra recipients for automatic updates, or share a public tracking link for a single AWB." },
  { q: "Does it cost extra?", a: "No. Track & trace is included for all Airflo customers." },
];

const DESTINATIONS = [
  { code: "HKG", city: "Hong Kong" },
  { code: "PVG", city: "Shanghai" },
  { code: "SIN", city: "Singapore" },
  { code: "DXB", city: "Dubai" },
  { code: "JFK", city: "New York" },
  { code: "MEX", city: "Mexico City", new: true },
  { code: "BOG", city: "Bogotá", new: true },
  { code: "GRU", city: "São Paulo", new: true },
];

export default function LandingPage() {
  const router = useRouter();
  const [awb, setAwb] = useState("");

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(#dbe5f2_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="pointer-events-none absolute -top-40 right-0 h-[480px] w-[640px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
              <Zap className="h-3.5 w-3.5" /> New · Real-time shipment visibility
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              Your air cargo,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">visible every step.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-slate-600 sm:text-lg">
              Follow every Airflo shipment from pick-up to landing — live flight times, automatic updates and all your documents in one portal. No more calls or emails to ask &ldquo;where is my cargo?&rdquo;
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/track?awb=${encodeURIComponent(awb.trim() || DEMO.awb)}`);
              }}
              className="mt-7 flex max-w-md gap-2 rounded-2xl bg-white p-1.5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={awb}
                  onChange={(e) => setAwb(e.target.value)}
                  placeholder={`Enter AWB, e.g. ${DEMO.awb}`}
                  className="h-11 w-full bg-transparent pl-9 pr-2 text-sm outline-none placeholder:text-slate-400"
                  aria-label="Air Waybill number"
                />
              </div>
              <button className="rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">Track</button>
            </form>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              <Link href="/login" className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800">
                Log in to your portal <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/request-access" className="rounded-xl px-4 py-2.5 font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white">
                Request access
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              {["Included for all customers", "Email & WhatsApp alerts", "English & Español"].map((x) => (
                <span key={x} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {x}
                </span>
              ))}
            </div>
          </div>

          {/* product visual */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200">
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-[11px] text-slate-400 ring-1 ring-slate-200">portal.airflo.example/shipments/{DEMO.id}</span>
              </div>
              <div className="flex items-center justify-between px-5 pt-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Shipment {DEMO.id}</div>
                  <div className="font-mono text-[11px] text-slate-500">AWB {DEMO.awb} · KL 887</div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" /> In flight
                </span>
              </div>
              <div className="mt-3 h-[260px]">
                <RouteMap shipment={DEMO} />
              </div>
            </div>

            <div className="absolute -left-4 bottom-10 hidden w-64 rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-slate-200 sm:block lg:-left-10">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
                WhatsApp · Airflo
                <span className="ml-auto text-[10px] font-normal text-slate-400">now</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">✈️ KL 887 departed Amsterdam at 20:34 with 42 pcs on board. ETA Hong Kong 21:45.</p>
            </div>
            <div className="absolute -right-3 -top-5 hidden rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-slate-200 sm:block">
              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">ETA Hong Kong</div>
              <div className="text-lg font-semibold text-slate-900">25 Nov 21:45</div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="h-3 w-3" /> lands in 3h 45m
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-slate-100 px-4 sm:px-6 md:grid-cols-4 md:divide-x">
          {[
            ["6", "milestones tracked per shipment"],
            ["24/7", "live flight data"],
            ["2", "alert channels: email & WhatsApp"],
            ["0", "calls needed to get an update"],
          ].map(([n, l]) => (
            <div key={l} className="px-4 py-8 text-center">
              <div className="text-3xl font-semibold tracking-tight text-slate-900">{n}</div>
              <div className="mt-1 text-xs text-slate-500">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold text-blue-600">Features</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Everything you need to know about your shipment, in one place.</h2>
          <p className="mt-3 text-slate-600">Built with our export team around the questions customers ask most.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ I, h, p }) => (
            <div key={h} className="group rounded-2xl bg-white p-6 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <I className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{h}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MILESTONES */}
      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <div className="text-sm font-semibold text-blue-300">Milestones</div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">From your loading dock to the destination runway.</h2>
              <p className="mt-3 text-slate-300">Every update shows planned versus actual time and where the information came from — so you always know how reliable it is.</p>
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-rose-500/10 p-4 ring-1 ring-rose-400/20">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
                <div className="text-sm">
                  <div className="font-semibold text-rose-100">Offloaded? You&apos;ll know first.</div>
                  <div className="text-rose-200/80">When cargo moves to another flight, the portal and your alerts update with the new flight and ETA automatically.</div>
                </div>
              </div>
            </div>
            <ol className="relative space-y-3">
              {MILESTONES.map(({ I, label, time, src }, i) => (
                <li key={label} className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${i < 3 ? "bg-blue-500 text-white" : i === 4 ? "bg-white/10 text-blue-200 ring-2 ring-blue-400" : "bg-white/10 text-slate-400"}`}>
                    <I className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="text-xs text-slate-400">{src}</div>
                  </div>
                  <div className="text-right text-sm font-medium tabular-nums text-slate-200">{time}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="text-center">
          <div className="text-sm font-semibold text-blue-600">How it works</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Up and running in a day</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "1", h: "Request access", p: "Tell us your company and a recent AWB. We link your account to all your shipments with Airflo.", I: ShieldCheck },
            { n: "2", h: "Log in & invite your team", p: "See every active and past shipment immediately. Invite colleagues, your warehouse or your customers.", I: PackageCheck },
            { n: "3", h: "Get updates automatically", p: "Choose email and/or WhatsApp per event. We'll notify you at pick-up, departure, arrival and on any delay.", I: Bell },
          ].map(({ n, h, p, I }) => (
            <div key={n} className="relative rounded-2xl bg-white p-6 ring-1 ring-slate-200">
              <span className="absolute right-5 top-5 text-5xl font-semibold text-slate-100">{n}</span>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white">
                <I className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{h}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations" className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white sm:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <Plane className="h-3.5 w-3.5" /> From Amsterdam Schiphol
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">Now connecting Europe with Latin America</h2>
              <p className="mt-3 text-blue-100">Same visibility on every lane — with the portal fully available in Spanish for our customers and partners in Mexico, Colombia and Brazil.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {DESTINATIONS.map((d) => (
                <span key={d.code} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 ring-1 ring-white/20">
                  <span className="font-semibold">{d.code}</span>
                  <span className="text-sm text-blue-100">{d.city}</span>
                  {d.new && <span className="rounded-full bg-emerald-400 px-1.5 py-0.5 text-[10px] font-bold text-emerald-950">NEW</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="text-center">
          <div className="text-sm font-semibold text-blue-600">FAQ</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Questions, answered</h2>
        </div>
        <div className="mt-10 divide-y divide-slate-200 rounded-2xl bg-white ring-1 ring-slate-200">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                {q}
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-white p-8 text-center ring-1 ring-slate-200 sm:p-12 lg:flex-row lg:text-left">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Stop chasing updates. Start seeing them.</h2>
            <p className="mt-2 text-slate-600">Already shipping with Airflo? Get portal access today — it&apos;s included.</p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-center gap-3">
            <Link href="/request-access" className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
              Request access <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
              Log in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
