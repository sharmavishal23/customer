"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Search, SlidersHorizontal, X } from "lucide-react";
import { PAGE, PageHeader } from "@/components/AppShell";
import { DelayChip, StatusPill, cx } from "@/components/shipment";
import { AIRPORTS, ALL_SHIPMENTS, STATUS_GROUP, departedAt, eta, etd, formatTime, type Shipment, type StatusGroup } from "@/lib/data";
import { useStore } from "@/lib/store";

type SortKey = "id" | "destination" | "pieces" | "chargeableWeight" | "etd" | "eta" | "status";
const PER_PAGE = 15;

const GROUPS: { key: StatusGroup; label: string }[] = [
  { key: "all", label: "All" },
  { key: "booked", label: "Booked" },
  { key: "transit", label: "In transit" },
  { key: "arrived", label: "Arrived" },
  { key: "exception", label: "Needs attention" },
];

const PERIODS = [
  { key: "all", label: "All time", days: 9999 },
  { key: "7", label: "Last 7 days", days: 7 },
  { key: "30", label: "Last 30 days", days: 30 },
  { key: "90", label: "Last 90 days", days: 90 },
];

function toCsv(rows: Shipment[]) {
  const head = ["Shipment", "AWB", "Origin", "Via", "Destination", "Flights", "Shipper", "Consignee", "Pieces", "Actual weight (kg)", "Chargeable weight (kg)", "ETD", "ATD", "ETA", "ATA", "Status", "Reference"];
  const esc = (v: string | number | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((s) => {
    const d = etd(s);
    const a = eta(s);
    return [s.id, s.awb, s.origin, s.via, s.destination, s.flights.join(" / "), s.shipper, s.consignee, s.pieces, s.actualWeight, s.chargeableWeight, d?.planned, d?.actual, a?.planned, a?.actual, s.status, s.reference].map(esc).join(",");
  });
  return [head.map(esc).join(","), ...lines].join("\n");
}

export default function ShipmentsPage() {
  const { t } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<StatusGroup>("all");
  const [dest, setDest] = useState("all");
  const [period, setPeriod] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "etd", dir: -1 });
  const [page, setPage] = useState(1);

  const destinations = useMemo(() => [...new Set(ALL_SHIPMENTS.map((s) => s.destination))].sort(), []);

  const rows = useMemo(() => {
    const qq = q.trim().toLowerCase().replace(/[\s-]/g, "");
    const days = PERIODS.find((p) => p.key === period)!.days;
    const cutoff = new Date("2026-11-25T10:00:00Z").getTime() - days * 86400000;
    const list = ALL_SHIPMENTS.filter((s) => {
      if (group !== "all" && STATUS_GROUP[s.status] !== group) return false;
      if (dest !== "all" && s.destination !== dest) return false;
      if (new Date(departedAt(s)).getTime() < cutoff) return false;
      if (!qq) return true;
      return [s.id, s.awb, s.destination, s.consignee, s.reference, s.commodity, ...s.flights].join(" ").toLowerCase().replace(/[\s-]/g, "").includes(qq);
    });
    const val = (s: Shipment): string | number => {
      switch (sort.key) {
        case "etd":
          return departedAt(s);
        case "eta":
          return eta(s)?.actual ?? eta(s)?.planned ?? "";
        case "status":
          return s.status;
        default:
          return s[sort.key];
      }
    };
    return [...list].sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sort.dir);
  }, [q, group, dest, period, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const totals = rows.reduce((a, s) => ({ pcs: a.pcs + s.pieces, kg: a.kg + s.chargeableWeight }), { pcs: 0, kg: 0 });
  const filtersOn = q || group !== "all" || dest !== "all" || period !== "all";

  const exportCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `airflo-shipments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const Th = ({ k, children, right }: { k?: SortKey; children: React.ReactNode; right?: boolean }) => (
    <th className={cx("whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500", right && "text-right")}>
      {k ? (
        <button
          onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? ((-s.dir) as 1 | -1) : -1 }))}
          className={cx("inline-flex items-center gap-1 uppercase tracking-wide hover:text-slate-900", sort.key === k && "text-slate-900")}
        >
          {children}
          {sort.key === k && (sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
        </button>
      ) : (
        children
      )}
    </th>
  );

  const select = "h-9 rounded-lg bg-white px-3 text-sm text-slate-700 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <main className={PAGE}>
      <PageHeader
        title={t("shipments")}
        subtitle={`${ALL_SHIPMENTS.length} shipments · active and completed over the last months`}
        actions={
          <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
            <Download className="h-3.5 w-3.5" /> Export CSV ({rows.length})
          </button>
        }
      />

      {/* Filters */}
      <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search shipment, AWB, consignee, reference, flight…"
              className="h-9 w-full rounded-lg bg-slate-50 pl-9 pr-3 text-sm outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="hidden h-4 w-4 text-slate-400 lg:block" />
            <select
              value={dest}
              onChange={(e) => {
                setDest(e.target.value);
                setPage(1);
              }}
              className={select}
              aria-label="Destination"
            >
              <option value="all">All destinations</option>
              {destinations.map((d) => (
                <option key={d} value={d}>
                  {d} · {AIRPORTS[d].city}
                </option>
              ))}
            </select>
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setPage(1);
              }}
              className={select}
              aria-label="Period"
            >
              {PERIODS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
            {filtersOn && (
              <button
                onClick={() => {
                  setQ("");
                  setGroup("all");
                  setDest("all");
                  setPeriod("all");
                  setPage(1);
                }}
                className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {GROUPS.map((g) => {
            const n = ALL_SHIPMENTS.filter((s) => g.key === "all" || STATUS_GROUP[s.status] === g.key).length;
            return (
              <button
                key={g.key}
                onClick={() => {
                  setGroup(g.key);
                  setPage(1);
                }}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                  group === g.key ? "bg-blue-600 text-white ring-blue-600" : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300",
                )}
              >
                {g.label} <span className={cx("rounded-full px-1.5 text-[10px]", group === g.key ? "bg-white/20" : "bg-slate-100")}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/60">
              <tr>
                <Th k="id">{t("shipment")}</Th>
                <Th>{t("awb")}</Th>
                <Th k="destination">{t("route")}</Th>
                <Th>{t("consignee")}</Th>
                <Th k="pieces" right>
                  {t("pcs")}
                </Th>
                <Th right>Actual kg</Th>
                <Th k="chargeableWeight" right>
                  Chargeable kg
                </Th>
                <Th k="etd">ETD / ATD</Th>
                <Th k="eta">ETA / ATA</Th>
                <Th k="status">Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-sm text-slate-500">
                    {t("no_results")}
                  </td>
                </tr>
              )}
              {visible.map((s) => {
                const d = etd(s);
                const a = eta(s);
                return (
                  <tr key={s.id} onClick={() => router.push(`/shipments/${s.id}`)} className="cursor-pointer transition hover:bg-blue-50/40">
                    <td className="px-4 py-3">
                      <Link href={`/shipments/${s.id}`} className="font-semibold text-slate-900 hover:text-blue-600" onClick={(e) => e.stopPropagation()}>
                        {s.id}
                      </Link>
                      <div className="text-[11px] text-slate-400">{s.reference}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.awb}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">
                        {s.origin} <span className="text-slate-300">→</span> {s.via && <span className="text-slate-400">{s.via} → </span>}
                        {s.destination}
                      </div>
                      <div className="text-[11px] text-slate-400">{s.flights.join(" · ")}</div>
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-600">{s.consignee.split(", ")[0]}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{s.pieces}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{s.actualWeight.toLocaleString("en-GB")}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">{s.chargeableWeight.toLocaleString("en-GB")}</td>
                    <td className="px-4 py-3">
                      <div className="whitespace-nowrap text-slate-700">{formatTime(d?.actual ?? d?.planned, s.origin)}</div>
                      <DelayChip m={d} t={t} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="whitespace-nowrap text-slate-700">{formatTime(a?.actual ?? a?.planned, s.destination)}</div>
                      {a?.actual ? <DelayChip m={a} t={t} /> : <span className="text-[10px] font-medium text-slate-400">{t("eta")}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={s.status} t={t} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row">
          <span>
            {rows.length} shipments · {totals.pcs.toLocaleString("en-GB")} pcs · {totals.kg.toLocaleString("en-GB")} kg chargeable
          </span>
          <div className="flex items-center gap-1">
            <button disabled={current === 1} onClick={() => setPage(current - 1)} className="grid h-8 w-8 place-items-center rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40" aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 font-medium text-slate-700">
              {current} / {pages}
            </span>
            <button disabled={current === pages} onClick={() => setPage(current + 1)} className="grid h-8 w-8 place-items-center rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40" aria-label="Next page">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
