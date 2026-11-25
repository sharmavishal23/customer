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
  Search,
  ShieldCheck,
  TriangleAlert,
  Truck,
  Zap,
} from "lucide-react";
import RouteMap from "@/components/RouteMap";
import { SHIPMENTS, SITES, arrivalAt, formatTime, relative, supplierName } from "@/lib/data";

const DEMO = SHIPMENTS[0];
const DEMO_SITE = SITES[DEMO.destination];
const DEMO_ETA = formatTime(arrivalAt(DEMO), DEMO.destination);
const DEMO_ETA_TIME = formatTime(arrivalAt(DEMO), DEMO.destination, { date: false });

const FEATURES = [
  { I: Bell, h: "Arrival alerts", p: "Know the moment cargo departs Amsterdam and when it lands at your airport — by email or WhatsApp, in your local time." },
  { I: Radio, h: "Live flight tracking", p: "Actual departure and arrival times from live flight data, including transit stops, delays and ETA changes." },
  { I: FileText, h: "Customs-ready documents", p: "AWB, commercial invoice, packing list and certificate of origin ready before landing — sent to your broker automatically." },
  { I: Truck, h: "All suppliers, one view", p: "Every shipment from every European supplier that ships through Airflo, from collection at their door to your runway." },
  { I: BarChart3, h: "Reports per site & supplier", p: "Inbound volumes, punctuality and lead times for each receiving site and each supplier." },
  { I: Globe2, h: "Your language, your time zone", p: "English and Español, with every time shown in the local time of the airport — no more converting from Amsterdam time." },
];

const MILESTONES = [
  { I: Truck, label: `Collected from ${supplierName(DEMO.shipper)}`, time: formatTime(DEMO.milestones[0].actual, "AMS", { date: false }), src: "Trucking partner" },
  { I: PackageCheck, label: "Loaded on aircraft", time: formatTime(DEMO.milestones[1].actual, "AMS", { date: false }), src: "Airline handling" },
  { I: PlaneTakeoff, label: `Departed Amsterdam · ${DEMO.flights[0]}`, time: formatTime(DEMO.milestones[2].actual, "AMS", { date: false }), src: "Live flight data" },
  { I: PlaneLanding, label: `Lands in ${DEMO_SITE.name}`, time: DEMO_ETA_TIME, src: "Live flight data · ETA" },
  { I: FileText, label: "Arrival notice to your broker", time: "auto", src: DEMO_SITE.broker },
];

const FAQ = [
  { q: "Who can use the Airflo portal?", a: "Every company that receives air freight through Airflo — whether you booked it yourself or your European supplier did. Request access with a recent AWB or your supplier's name and we'll link all your shipments." },
  { q: "Where does the tracking data come from?", a: "We combine our own booking system with live flight data and confirmations from our trucking and airline handling partners. Each milestone shows its source so you know how it was captured." },
  { q: "Can my customs broker get the documents?", a: "Yes. Add your broker per receiving site and Airflo sends the arrival notice, AWB, invoice and packing list automatically when the flight lands." },
  { q: "What happens if my shipment is offloaded?", a: "You'll see it in the portal immediately and get a notification with the new flight and ETA. The old flight number is kept for reference." },
  { q: "Does it cost extra?", a: "No. Track & trace is included for all Airflo customers and consignees." },
];

const DESTINATIONS = [
  { code: "GRU", city: "São Paulo" },
  { code: "MEX", city: "Mexico City" },
  { code: "BOG", city: "Bogotá" },
  { code: "SCL", city: "Santiago", new: true },
  { code: "LIM", city: "Lima", soon: true },
  { code: "EZE", city: "Buenos Aires", soon: true },
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
              <Zap className="h-3.5 w-3.5" /> For importers receiving cargo via Airflo
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              Know exactly when
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">your cargo lands.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-slate-600 sm:text-lg">
              Receiving air freight from Europe? Follow every shipment from your supplier&apos;s door to your local airport — live flight times, arrival alerts and customs-ready documents in one portal. No more emails asking &ldquo;where is my cargo?&rdquo;
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
              {["Included at no extra cost", "Email & WhatsApp alerts", "English & Español"].map((x) => (
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
                  <div className="font-mono text-[11px] text-slate-500">AWB {DEMO.awb} · {DEMO.flights[0]} · from {supplierName(DEMO.shipper)}</div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" /> In flight
                </span>
              </div>
              <div className="mt-3 h-[260px]">
                <RouteMap shipment={DEMO} />
              </div>
            </div>

            <div className="absolute -bottom-10 -left-4 hidden w-64 rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-slate-200 sm:block lg:-left-10">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
                WhatsApp · Airflo
                <span className="ml-auto text-[10px] font-normal text-slate-400">now</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">✈️ {DEMO.flights[0]} with your {DEMO.pieces} pcs from {supplierName(DEMO.shipper)} lands in {DEMO_SITE.name} at {DEMO_ETA_TIME}. Documents are ready for your broker.</p>
            </div>
            <div className="absolute -right-3 -top-5 hidden rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-slate-200 sm:block">
              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">ETA {DEMO_SITE.name}</div>
              <div className="text-lg font-semibold text-slate-900">{DEMO_ETA}</div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="h-3 w-3" /> lands {relative(arrivalAt(DEMO))}
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
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Everything you need before your cargo lands.</h2>
          <p className="mt-3 text-slate-600">Built around the questions importers ask our team most: when does it land, is it on time, and are the documents ready?</p>
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
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">From your supplier&apos;s door to your runway.</h2>
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
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${i < 3 ? "bg-blue-500 text-white" : i === 3 ? "bg-white/10 text-blue-200 ring-2 ring-blue-400" : "bg-white/10 text-slate-400"}`}>
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
            { n: "1", h: "Request access", p: "Share a recent AWB or the supplier that ships to you. We link every inbound Airflo shipment to your account.", I: ShieldCheck },
            { n: "2", h: "Add your sites & broker", p: "Set up your receiving sites and customs brokers, and invite colleagues at each warehouse.", I: PackageCheck },
            { n: "3", h: "Get updates automatically", p: "Choose email and/or WhatsApp per event. We notify you at departure, on any delay and when your cargo lands.", I: Bell },
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
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">Built for importers in Latin America</h2>
              <p className="mt-3 text-blue-100">Direct and connecting flights from Amsterdam to your airport, with the portal in Spanish and every time shown in your local time zone.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {DESTINATIONS.map((d) => (
                <span key={d.code} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 ring-1 ring-white/20">
                  <span className="font-semibold">{d.code}</span>
                  <span className="text-sm text-blue-100">{d.city}</span>
                  {d.new && <span className="rounded-full bg-emerald-400 px-1.5 py-0.5 text-[10px] font-bold text-emerald-950">NEW</span>}
                  {d.soon && <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white">SOON</span>}
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
            <p className="mt-2 text-slate-600">Receiving cargo via Airflo? Get portal access today — it&apos;s included.</p>
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
