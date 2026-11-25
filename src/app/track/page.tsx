"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowRight, Lock, Mail, MessageCircle, PackageSearch, Search, ShieldCheck, Zap } from "lucide-react";
import RouteMap from "@/components/RouteMap";
import { DelayChip, MILESTONE_ICON, StatusPill, cx } from "@/components/shipment";
import { AIRPORTS, SHIPMENTS, eta, etd, findShipment, formatTime, relative, type Shipment } from "@/lib/data";
import { useStore } from "@/lib/store";

const SAMPLES = ["5006", "5007", "5010", "5009", "5008"].map((id) => SHIPMENTS.find((s) => s.id === id)!);

function Result({ s }: { s: Shipment }) {
  const { t } = useStore();
  const dep = etd(s);
  const arr = eta(s);
  const currentIdx = s.milestones.findIndex((m) => !m.actual);
  return (
    <article className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Air Waybill</div>
          <div className="font-mono text-lg font-semibold text-slate-900">{s.awb}</div>
        </div>
        <StatusPill status={s.status} t={t} size="md" />
      </div>

      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="p-5">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div>
              <div className="text-3xl font-semibold tracking-tight text-slate-900">{s.origin}</div>
              <div className="text-xs text-slate-500">{AIRPORTS[s.origin].city}</div>
              <div className="mt-1 text-sm font-medium text-slate-800">{formatTime(dep?.actual ?? dep?.planned, s.origin)}</div>
              <div className="text-[11px] text-slate-400">{dep?.actual ? "Departed" : "Scheduled departure"}</div>
            </div>
            <div className="text-center text-[11px] text-slate-500">
              <div className="mx-auto mb-1 h-px w-10 bg-slate-300" />
              {s.flights.join(" · ")}
              {s.via && <div>via {s.via}</div>}
            </div>
            <div className="text-right">
              <div className="text-3xl font-semibold tracking-tight text-slate-900">{s.destination}</div>
              <div className="text-xs text-slate-500">{AIRPORTS[s.destination].city}</div>
              <div className="mt-1 text-sm font-medium text-slate-800">{formatTime(arr?.actual ?? arr?.planned, s.destination)}</div>
              <div className="text-[11px] text-slate-400">{arr?.actual ? "Arrived" : `Expected ${relative(arr!.planned!)}`}</div>
            </div>
          </div>

          <ol className="mt-6 space-y-3">
            {s.milestones.map((m, i) => {
              const I = MILESTONE_ICON[m.key];
              const done = !!m.actual;
              const exc = m.key === "offload";
              return (
                <li key={m.key} className="flex items-center gap-3">
                  <span
                    className={cx(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                      exc ? "bg-rose-100 text-rose-600" : done ? "bg-blue-600 text-white" : i === currentIdx ? "bg-blue-50 text-blue-600 ring-2 ring-blue-600" : "bg-slate-100 text-slate-400",
                    )}
                  >
                    <I className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className={cx("truncate text-sm", exc ? "font-medium text-rose-700" : done ? "font-medium text-slate-800" : "text-slate-400")}>
                      {t(`m.${m.key}` as never)} <span className="text-xs font-normal text-slate-400">· {m.at}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
                      {done && !exc && <DelayChip m={m} t={t} />}
                      {formatTime(m.actual ?? m.planned, m.at)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="relative min-h-[260px] border-t border-slate-100 md:border-l md:border-t-0">
          <RouteMap key={s.id} shipment={s} />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" /> Shipper, consignee, weights and documents are visible after login.
        </span>
        <Link href={`/shipments/${s.id}`} className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700">
          Open in customer portal <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

function TrackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("awb") ?? "";
  const [value, setValue] = useState(initial);
  const [queries, setQueries] = useState<string[]>([]);

  useEffect(() => {
    setValue(initial);
    setQueries(
      initial
        .split(/[,\s;]+/)
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 5),
    );
  }, [initial]);

  const submit = (v: string) => router.push(`/track?awb=${encodeURIComponent(v.trim())}`);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white to-[#f4f6fa]">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(#d6e2f0_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-14 text-center sm:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
            <Zap className="h-3.5 w-3.5" /> Live flight data · updated automatically
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Track your air cargo</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Enter up to 5 Air Waybill numbers, separated by commas.</p>
          <form
            className="mx-auto mt-6 flex max-w-xl gap-2 rounded-2xl bg-white p-2 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200"
            onSubmit={(e) => {
              e.preventDefault();
              submit(value);
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 074-12345675"
                className="h-12 w-full rounded-xl bg-transparent pl-11 pr-3 font-mono text-base text-slate-900 outline-none placeholder:font-sans placeholder:text-slate-400"
                aria-label="Air Waybill numbers"
              />
            </div>
            <button className="rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700">Track</button>
          </form>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400">Try a sample:</span>
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                onClick={() => submit(s.awb)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-mono font-medium text-slate-700 ring-1 ring-slate-200 hover:ring-blue-400"
              >
                <span className={cx("h-1.5 w-1.5 rounded-full", { in_flight: "bg-blue-500", at_transit: "bg-amber-500", offloaded: "bg-rose-500", arrived: "bg-emerald-500", booked: "bg-slate-400", picked_up: "bg-violet-500" }[s.status])} />
                {s.awb}
              </button>
            ))}
            <button onClick={() => submit(SAMPLES.map((s) => s.awb).join(","))} className="rounded-full px-2.5 py-1 font-semibold text-blue-600 hover:bg-blue-50">
              All 5
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {queries.length === 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { I: Zap, h: "Real-time milestones", p: "Pick-up, departure, transit and arrival — as they happen." },
              { I: MessageCircle, h: "Updates via WhatsApp & email", p: "Customers get notified automatically, no need to call." },
              { I: ShieldCheck, h: "Secure customer portal", p: "Documents, weights and history behind your login." },
            ].map(({ I, h, p }) => (
              <div key={h} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <I className="h-4 w-4" />
                </span>
                <div className="mt-3 text-sm font-semibold text-slate-900">{h}</div>
                <p className="mt-1 text-xs text-slate-500">{p}</p>
              </div>
            ))}
          </div>
        )}

        {queries.map((q) => {
          const s = findShipment(q);
          return s ? (
            <Result key={q} s={s} />
          ) : (
            <div key={q} className="flex items-start gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                <PackageSearch className="h-5 w-5" />
              </span>
              <div>
                <div className="font-mono text-sm font-semibold text-slate-900">{q}</div>
                <p className="mt-0.5 text-sm text-slate-500">We couldn&apos;t find this Air Waybill. Check the number, or contact the Airflo export desk.</p>
                <a href="mailto:export@airflo.example" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                  <Mail className="h-3.5 w-3.5" /> export@airflo.example
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackInner />
    </Suspense>
  );
}
