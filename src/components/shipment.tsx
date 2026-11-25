"use client";

/* Shared shipment UI building blocks used across portal pages. */

import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  CircleCheck,
  Copy,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Mail,
  MessageCircle,
  Package,
  PackageCheck,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Radio,
  Receipt,
  RefreshCw,
  Scale,
  Search,
  Share2,
  TriangleAlert,
  Truck,
  ClipboardList,
  X,
} from "lucide-react";
import RouteMap from "@/components/RouteMap";
import {
  AIRPORTS,
  delayMinutes,
  eta,
  etd,
  formatTime,
  relative,
  routeProgress,
  type Doc,
  type Milestone,
  type Shipment,
  type Source,
  type Status,
  type StatusGroup,
} from "@/lib/data";
import type { Key } from "@/lib/i18n";

/* ------------------------------------------------------------------ */
/* Visual tokens                                                       */
/* ------------------------------------------------------------------ */

export const STATUS_STYLE: Record<Status, { pill: string; dot: string }> = {
  booked: { pill: "bg-slate-100 text-slate-700 ring-slate-200", dot: "bg-slate-400" },
  picked_up: { pill: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-500" },
  in_flight: { pill: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500" },
  at_transit: { pill: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  arrived: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  offloaded: { pill: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
};

export const SOURCE_ICON: Record<Source, typeof Truck> = {
  trucking: Truck,
  airline: Building2,
  flight: Radio,
  booking: ClipboardList,
};

export const DOC_ICON: Record<Doc["kind"], typeof FileText> = {
  awb: FileText,
  booking: ClipboardList,
  invoice: Receipt,
  packing: Package,
  pod: FileCheck2,
};

export const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

/* ------------------------------------------------------------------ */
/* KPI tiles                                                           */
/* ------------------------------------------------------------------ */

export function StatTiles({
  counts,
  group,
  setGroup,
  t,
}: {
  counts: Record<StatusGroup, number>;
  group: StatusGroup;
  setGroup: (g: StatusGroup) => void;
  t: (k: Key) => string;
}) {
  const tiles: { key: StatusGroup; label: Key; icon: typeof Plane; tone: string; bar: string }[] = [
    { key: "all", label: "all", icon: Package, tone: "text-slate-900 bg-slate-100", bar: "bg-slate-900" },
    { key: "booked", label: "booked", icon: ClipboardList, tone: "text-violet-700 bg-violet-50", bar: "bg-violet-500" },
    { key: "transit", label: "transit", icon: Plane, tone: "text-blue-700 bg-blue-50", bar: "bg-blue-600" },
    { key: "arrived", label: "arrived", icon: PlaneLanding, tone: "text-emerald-700 bg-emerald-50", bar: "bg-emerald-500" },
    { key: "exception", label: "exception", icon: TriangleAlert, tone: "text-rose-700 bg-rose-50", bar: "bg-rose-500" },
  ];
  return (
    <div className="mt-6 grid grid-cols-5 gap-2 sm:gap-3">
      {tiles.map(({ key, label, icon: Icon, tone, bar }) => {
        const active = group === key;
        return (
          <button
            key={key}
            onClick={() => setGroup(active && key !== "all" ? "all" : key)}
            className={cx(
              "group relative overflow-hidden rounded-2xl bg-white p-2.5 text-left ring-1 transition sm:p-4",
              active ? "ring-2 ring-blue-600 shadow-md shadow-blue-600/10" : "ring-slate-200 hover:ring-slate-300 hover:shadow-sm",
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cx("hidden h-9 w-9 place-items-center rounded-xl sm:grid", tone)}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              {active && <Check className="hidden h-4 w-4 text-blue-600 sm:block" />}
            </div>
            <div className="text-xl font-semibold sm:mt-3 sm:text-[28px] sm:font-semibold leading-none tracking-tight text-slate-900">{counts[key]}</div>
            <div className="mt-1 truncate text-[10px] font-medium text-slate-500 sm:text-xs">{t(label)}</div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100 sm:mt-3">
              <div className={cx("h-full rounded-full", bar)} style={{ width: `${(counts[key] / counts.all) * 100}%` }} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shipment list                                                       */
/* ------------------------------------------------------------------ */

export function StatusPill({ status, t, size = "sm" }: { status: Status; t: (k: Key) => string; size?: "sm" | "md" }) {
  const st = STATUS_STYLE[status];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset",
        st.pill,
        size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[11px]",
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", st.dot, (status === "in_flight" || status === "at_transit") && "animate-pulse")} />
      {t(`s.${status}` as Key)}
    </span>
  );
}

export function ShipmentList({
  items,
  selectedId,
  onSelect,
  t,
  query,
  setQuery,
}: {
  items: Shipment[];
  selectedId: string;
  onSelect: (id: string) => void;
  t: (k: Key) => string;
  query: string;
  setQuery: (q: string) => void;
}) {
  return (
    <aside className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 max-h-[460px] lg:sticky lg:top-[132px] lg:max-h-[calc(100vh-210px)] xl:top-[88px] xl:max-h-[calc(100vh-160px)]">
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-900">{t("shipments")}</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{items.length}</span>
        </div>
        <div className="relative mt-3 lg:hidden">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            className="h-10 w-full rounded-xl bg-slate-100 pl-9 pr-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <ul className="scroll-thin flex-1 divide-y divide-slate-100 overflow-y-auto">
        {items.length === 0 && <li className="p-8 text-center text-sm text-slate-500">{t("no_results")}</li>}
        {items.map((s) => {
          const active = s.id === selectedId;
          const arr = eta(s);
          const dep = etd(s);
          const p = routeProgress(s);
          return (
            <li key={s.id}>
              <button
                onClick={() => onSelect(s.id)}
                className={cx(
                  "relative w-full px-4 py-3.5 text-left transition",
                  active ? "bg-blue-50/70" : "hover:bg-slate-50",
                )}
              >
                {active && <span className="absolute inset-y-0 left-0 w-1 rounded-r bg-blue-600" />}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-slate-900">#{s.id}</span>
                    <span className="font-mono text-xs text-slate-500">{s.awb}</span>
                  </div>
                  <StatusPill status={s.status} t={t} />
                </div>

                <div className="mt-2.5 flex items-center gap-2 text-sm">
                  <span className="font-semibold text-slate-800">{s.origin}</span>
                  <div className="relative h-1 flex-1 rounded-full bg-slate-100">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-blue-500" style={{ width: `${p * 100}%` }} />
                    {s.via && <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-400" />}
                  </div>
                  <span className="font-semibold text-slate-800">{s.destination}</span>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
                  <div>
                    <div className="uppercase tracking-wide text-slate-400">{dep?.actual ? t("atd") : t("etd")}</div>
                    <div className="font-medium text-slate-700">{formatTime(dep?.actual ?? dep?.planned, s.origin)}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wide text-slate-400">{arr?.actual ? t("ata") : t("eta")}</div>
                    <div className="font-medium text-slate-700">{formatTime(arr?.actual ?? arr?.planned, s.destination)}</div>
                  </div>
                  <div className="text-right">
                    <div className="uppercase tracking-wide text-slate-400">{t("pcs")} · kg</div>
                    <div className="font-medium text-slate-700">
                      {s.pieces} · {s.chargeableWeight}
                    </div>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: route + map                                                   */
/* ------------------------------------------------------------------ */

export function DelayChip({ m, t }: { m?: Milestone; t: (k: Key) => string }) {
  const d = delayMinutes(m);
  if (d === null) return null;
  if (Math.abs(d) <= 10)
    return <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">{t("on_time")}</span>;
  const late = d > 0;
  return (
    <span className={cx("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", late ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700")}>
      {Math.abs(d)} min {late ? t("late") : t("early")}
    </span>
  );
}

export function ShipmentHero({ s, t }: { s: Shipment; t: (k: Key) => string }) {
  const [copied, setCopied] = useState(false);
  const dep = etd(s);
  const arr = eta(s);
  const o = AIRPORTS[s.origin];
  const d = AIRPORTS[s.destination];

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/track?awb=${s.awb}`);
    } catch {
      /* clipboard may be unavailable */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const headline =
    s.status === "in_flight"
      ? `${t("lands")} ${relative(arr!.planned!)}`
      : s.status === "arrived"
        ? `${t("landed")} ${relative(arr!.actual!)}`
        : s.status === "at_transit"
          ? `${AIRPORTS[s.via!].city} · ${t("s.at_transit").toLowerCase()}`
          : `${t("departs")} ${relative(dep!.planned!)}`;

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {t("shipment")} {s.id}
            </h2>
            <StatusPill status={s.status} t={t} size="md" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              {t("awb")} <span className="font-mono font-medium text-slate-700">{s.awb}</span>
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>
              {t("flight")}{" "}
              <span className="font-medium text-slate-700">{s.flights.join(" → ")}</span>
              {s.previousFlight && (
                <span className="ml-1 text-slate-400 line-through decoration-rose-400">{s.previousFlight}</span>
              )}
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>
              {t("reference")} <span className="font-medium text-slate-700">{s.reference}</span>
            </span>
          </div>
        </div>
        <button
          onClick={share}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
          {copied ? t("copied") : t("share")}
        </button>
      </div>

      {s.status === "offloaded" && (
        <div className="mx-5 mb-4 flex items-start gap-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-100">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">{t("m.offload")}</div>
            <div className="text-rose-700/90">{s.milestones.find((m) => m.key === "offload")?.note}</div>
          </div>
        </div>
      )}

      {/* Boarding-pass style route summary */}
      <div className="mx-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-xl bg-slate-50 px-5 py-4 ring-1 ring-slate-100">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{dep?.actual ? t("atd") : t("etd")}</div>
          <div className="text-3xl font-semibold tracking-tight text-slate-900">{s.origin}</div>
          <div className="text-xs text-slate-500">{o.city}</div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm font-medium text-slate-800">
            {formatTime(dep?.actual ?? dep?.planned, s.origin)} <DelayChip m={dep} t={t} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center gap-1 text-blue-600">
            <span className="h-px w-6 bg-blue-200 sm:w-14" />
            <Plane className="h-5 w-5" />
            <span className="h-px w-6 bg-blue-200 sm:w-14" />
          </div>
          <div className="text-xs font-semibold text-slate-700">{headline}</div>
          {s.via && <div className="text-[11px] text-slate-500">via {s.via}</div>}
        </div>
        <div className="text-right">
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{arr?.actual ? t("ata") : t("eta")}</div>
          <div className="text-3xl font-semibold tracking-tight text-slate-900">{s.destination}</div>
          <div className="text-xs text-slate-500">{d.city}</div>
          <div className="mt-1.5 flex flex-wrap items-center justify-end gap-1.5 text-sm font-medium text-slate-800">
            <DelayChip m={arr} t={t} /> {formatTime(arr?.actual ?? arr?.planned, s.destination)}
          </div>
        </div>
      </div>

      <div className="relative mt-4 h-[260px] sm:h-[320px]">
        <RouteMap key={s.id} shipment={s} />
        {(s.status === "in_flight" || s.status === "at_transit") && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg bg-white/90 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur">
            <Radio className="h-3.5 w-3.5 text-blue-600" /> {t("src.flight")} · {s.flights[s.status === "at_transit" ? 1 : 0] ?? s.flights[0]}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

export const MILESTONE_ICON = {
  pickup: Truck,
  loaded: PackageCheck,
  departed: PlaneTakeoff,
  transit: RefreshCw,
  arrived: PlaneLanding,
  offload: TriangleAlert,
};

export function Timeline({ s, t }: { s: Shipment; t: (k: Key) => string }) {
  const currentIdx = s.milestones.findIndex((m) => !m.actual);

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-slate-900">{t("progress")}</h3>
        <span className="text-[11px] text-slate-400">{t("local_times")}</span>
      </div>

      <ol className="mt-5">
        {s.milestones.map((m, i) => {
          const done = !!m.actual;
          const exception = m.key === "offload";
          const current = i === currentIdx;
          const last = i === s.milestones.length - 1;
          const Icon = MILESTONE_ICON[m.key];
          const SrcIcon = SOURCE_ICON[m.source];
          const plannedLabel = m.key === "departed" ? t("etd") : m.key === "arrived" ? t("eta") : t("planned");
          const actualLabel = m.key === "departed" ? t("atd") : m.key === "arrived" ? t("ata") : t("actual");
          const flight = m.key === "departed" ? s.flights[0] : m.key === "transit" ? s.flights[1] : undefined;

          return (
            <li key={m.key} className="relative flex gap-4 pb-6 last:pb-0">
              {!last && (
                <span
                  className={cx(
                    "absolute left-[17px] top-10 bottom-1 w-0.5 rounded-full",
                    done && !exception ? "bg-blue-500" : exception ? "bg-rose-200" : "bg-slate-200",
                  )}
                />
              )}
              <div
                className={cx(
                  "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-white",
                  exception
                    ? "bg-rose-100 text-rose-600"
                    : done
                      ? "bg-blue-600 text-white"
                      : current
                        ? "bg-white text-blue-600 ring-blue-100 outline-2 outline-blue-600"
                        : "bg-slate-100 text-slate-400",
                )}
              >
                {current && <span className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />}
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <div className={cx("text-sm font-semibold", exception ? "text-rose-700" : done || current ? "text-slate-900" : "text-slate-400")}>
                    {t(`m.${m.key}` as Key)}
                    {flight && <span className="ml-1.5 font-medium text-slate-500">· {flight}</span>}
                  </div>
                  {done && !exception && <DelayChip m={m} t={t} />}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  {AIRPORTS[m.at].city} ({m.at})
                </div>

                {!exception && (
                  <div className="mt-2 grid max-w-sm grid-cols-2 gap-2">
                    <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{plannedLabel}</div>
                      <div className="text-xs font-semibold text-slate-700">{formatTime(m.planned, m.at)}</div>
                    </div>
                    <div className={cx("rounded-lg px-2.5 py-1.5", done ? "bg-blue-50" : "bg-slate-50")}>
                      <div className={cx("text-[10px] font-medium uppercase tracking-wide", done ? "text-blue-500" : "text-slate-400")}>{actualLabel}</div>
                      <div className={cx("text-xs font-semibold", done ? "text-blue-800" : "text-slate-400")}>{formatTime(m.actual, m.at)}</div>
                    </div>
                  </div>
                )}

                {m.note && <p className={cx("mt-2 text-xs", exception ? "text-rose-700" : "text-slate-500")}>{m.note}</p>}
                {exception && <p className="mt-1 text-xs text-slate-400">{formatTime(m.actual, m.at)}</p>}

                <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 ring-1 ring-slate-200">
                  <SrcIcon className="h-3 w-3" /> {t(`src.${m.source}` as Key)}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Details                                                             */
/* ------------------------------------------------------------------ */

export function Details({ s, t }: { s: Shipment; t: (k: Key) => string }) {
  const [copied, setCopied] = useState(false);
  const party = (label: string, value: string) => {
    const [name, ...rest] = value.split(", ");
    return (
      <div className="rounded-xl bg-slate-50 p-3">
        <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
        <div className="mt-0.5 text-sm font-semibold text-slate-800">{name}</div>
        <div className="text-xs text-slate-500">{rest.join(", ")}</div>
      </div>
    );
  };
  const stat = (icon: typeof Scale, label: string, value: string) => {
    const I = icon;
    return (
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500">
          <I className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[11px] text-slate-500">{label}</div>
          <div className="text-sm font-semibold text-slate-900">{value}</div>
        </div>
      </div>
    );
  };
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-slate-900">{t("details")}</h3>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(s.awb).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-700 hover:bg-slate-200"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {s.awb}
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {party(t("shipper"), s.shipper)}
        {party(t("consignee"), s.consignee)}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {stat(Package, t("pieces"), `${s.pieces} ${t("pcs")}`)}
        {stat(Scale, t("actual_weight"), `${s.actualWeight.toLocaleString("en-GB")} kg`)}
        {stat(Scale, t("chargeable_weight"), `${s.chargeableWeight.toLocaleString("en-GB")} kg`)}
        {stat(ClipboardList, t("commodity"), s.commodity)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export function Documents({ s, t, onView }: { s: Shipment; t: (k: Key) => string; onView: (d: Doc) => void }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-slate-900">
          {t("documents")} <span className="ml-1 text-xs font-medium text-slate-400">{s.documents.length}</span>
        </h3>
        <button className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
          <Download className="h-3.5 w-3.5" /> {t("download_all")}
        </button>
      </div>
      <ul className="mt-3 divide-y divide-slate-100">
        {s.documents.map((d) => {
          const I = DOC_ICON[d.kind];
          return (
            <li key={d.kind} className="group flex items-center gap-3 py-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <I className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-800">{d.name}</div>
                <div className="text-[11px] text-slate-400">
                  PDF · {d.size} · {formatTime(d.date, s.origin)}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-80 transition group-hover:opacity-100">
                <button onClick={() => onView(d)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label={t("view")}>
                  <Eye className="h-4 w-4" />
                </button>
                <button className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Download">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DocPreview({ doc, s, onClose }: { doc: Doc; s: Shipment; onClose: () => void }) {
  const dep = etd(s);
  const arr = eta(s);
  const rows: [string, string][] = [
    ["Air Waybill No.", s.awb],
    ["Shipment No.", s.id],
    ["Shipper", s.shipper],
    ["Consignee", s.consignee],
    ["Airport of departure", `${AIRPORTS[s.origin].city} (${s.origin})`],
    ["Airport of destination", `${AIRPORTS[s.destination].city} (${s.destination})`],
    ["Routing", [s.origin, s.via, s.destination].filter(Boolean).join(" – ")],
    ["Flight / Date", `${s.flights.join(", ")} / ${formatTime(dep?.planned, s.origin)}`],
    ["Expected arrival", formatTime(arr?.planned, s.destination)],
    ["No. of pieces", String(s.pieces)],
    ["Gross weight", `${s.actualWeight} kg`],
    ["Chargeable weight", `${s.chargeableWeight} kg`],
    ["Nature of goods", s.commodity],
  ];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">{doc.name}</div>
            <div className="text-xs text-slate-500">
              {t_static(s)} · PDF · {doc.size}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
              <Download className="h-3.5 w-3.5" /> Download
            </button>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-y-auto bg-slate-100 p-6">
          <div className="mx-auto rounded-md bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
              <div>
                <div className="text-lg font-bold tracking-tight">{doc.name.toUpperCase()}</div>
                <div className="text-[11px] text-slate-500">Issued by Airflo B.V. as agent of the carrier</div>
              </div>
              <div className="text-right font-mono text-sm font-semibold">{s.awb}</div>
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {rows.map(([k, v]) => (
                <div key={k} className="border-b border-dashed border-slate-200 py-2">
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{k}</dt>
                  <dd className="text-sm text-slate-800">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
              <CircleCheck className="h-3.5 w-3.5 text-emerald-500" /> Preview generated from shipment data
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const t_static = (s: Shipment) => `Shipment ${s.id}`;

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export function Notifications({ s, t }: { s: Shipment; t: (k: Key) => string }) {
  const [subs, setSubs] = useState<Record<string, { email: boolean; whatsapp: boolean }>>({
    pickup: { email: true, whatsapp: false },
    departure: { email: true, whatsapp: true },
    arrival: { email: true, whatsapp: true },
    exception: { email: true, whatsapp: true },
  });

  const feed = s.milestones
    .filter((m) => m.actual)
    .sort((a, b) => +new Date(b.actual!) - +new Date(a.actual!))
    .map((m) => {
      const city = AIRPORTS[m.at].city;
      const time = formatTime(m.actual, m.at, { date: false });
      const text: Record<string, string> = {
        pickup: `Shipment ${s.id} was picked up at ${time}. Next: delivery to the airline at ${city}.`,
        loaded: `Your freight is loaded on ${s.flights[0]} at ${city}.`,
        departed: `${s.flights[0]} departed ${city} at ${time} with ${s.pieces} pcs on board.`,
        transit: `Arrived at ${city} (${time}). Connecting to ${s.flights[1]}.`,
        arrived: `${s.flights[s.flights.length - 1]} landed in ${city} at ${time}.`,
        offload: `Heads-up: shipment ${s.id} was moved to ${s.flights[0]}. New ETA has been updated.`,
      };
      return { m, text: text[m.key], exception: m.key === "offload" };
    });

  const rows: { key: string; label: Key; icon: typeof Truck }[] = [
    { key: "pickup", label: "n.pickup", icon: Truck },
    { key: "departure", label: "n.departure", icon: PlaneTakeoff },
    { key: "arrival", label: "n.arrival", icon: PlaneLanding },
    { key: "exception", label: "n.exception", icon: TriangleAlert },
  ];

  const Toggle = ({ on, onClick, icon: I, label }: { on: boolean; onClick: () => void; icon: typeof Mail; label: string }) => (
    <button
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition",
        on ? "bg-blue-600 text-white ring-blue-600" : "bg-white text-slate-500 ring-slate-200 hover:ring-slate-300",
      )}
      aria-pressed={on}
    >
      <I className="h-3 w-3" /> {label}
    </button>
  );

  return (
    <div className="grid gap-6 rounded-2xl bg-white p-5 ring-1 ring-slate-200 xl:grid-cols-2">
      <div>
        <h3 className="text-[15px] font-semibold text-slate-900">{t("updates")}</h3>
        <p className="text-xs text-slate-500">{t("updates_sub")}</p>
        <ul className="mt-4 space-y-2">
          {rows.map(({ key, label, icon: I }) => (
            <li key={key} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                <I className="h-4 w-4 text-slate-400" /> {t(label)}
              </span>
              <span className="flex gap-1.5">
                <Toggle on={subs[key].email} icon={Mail} label={t("email")} onClick={() => setSubs({ ...subs, [key]: { ...subs[key], email: !subs[key].email } })} />
                <Toggle
                  on={subs[key].whatsapp}
                  icon={MessageCircle}
                  label={t("whatsapp")}
                  onClick={() => setSubs({ ...subs, [key]: { ...subs[key], whatsapp: !subs[key].whatsapp } })}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900">{t("recent")}</h3>
          <span className="text-[11px] text-slate-400">
            {t("shipment")} {s.id}
          </span>
        </div>
        <ul className="mt-4 space-y-3">
          {feed.length === 0 && <li className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">—</li>}
          {feed.map(({ m, text, exception }) => (
            <li key={m.key} className="flex gap-3">
              <span className={cx("mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full", exception ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600")}>
                {exception ? <TriangleAlert className="h-3.5 w-3.5" /> : <MessageCircle className="h-3.5 w-3.5" />}
              </span>
              <div className={cx("flex-1 rounded-2xl rounded-tl-sm px-3 py-2 text-sm", exception ? "bg-rose-50 text-rose-900" : "bg-slate-50 text-slate-700")}>
                {text}
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{formatTime(m.actual, m.at)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3" /> <MessageCircle className="h-3 w-3" /> <ArrowRight className="h-3 w-3" /> sent automatically
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
