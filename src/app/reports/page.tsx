"use client";

import { useMemo, useState } from "react";
import { BarChart3, Clock, Download, Package, PlaneLanding, PlaneTakeoff, Scale, Table2, TriangleAlert } from "lucide-react";
import { PAGE, PageHeader } from "@/components/AppShell";
import { cx } from "@/components/shipment";
import { ALL_SHIPMENTS, NOW, SITES, SUPPLIERS, delayMinutes, departedAt, eta, etd, supplierName, type Shipment } from "@/lib/data";
import { useStore } from "@/lib/store";

/* ---------------- metrics ---------------- */

const ON_TIME_MIN = 15;
const completed = ALL_SHIPMENTS.filter((s) => eta(s)?.actual && etd(s)?.actual);

const monthKey = (iso: string) => iso.slice(0, 7);
const monthLabel = (key: string) => new Date(`${key}-01T00:00:00Z`).toLocaleString("en-GB", { month: "short", timeZone: "UTC" });
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
const transitHours = (s: Shipment) => (new Date(eta(s)!.actual!).getTime() - new Date(etd(s)!.actual!).getTime()) / 3600000;

function summarize(list: Shipment[]) {
  const done = list.filter((s) => eta(s)?.actual && etd(s)?.actual);
  const onTimeDep = done.filter((s) => (delayMinutes(etd(s)) ?? 0) <= ON_TIME_MIN).length;
  const onTimeArr = done.filter((s) => (delayMinutes(eta(s)) ?? 0) <= ON_TIME_MIN).length;
  return {
    count: list.length,
    kg: list.reduce((a, s) => a + s.chargeableWeight, 0),
    pcs: list.reduce((a, s) => a + s.pieces, 0),
    onTimeDep: pct(onTimeDep, done.length),
    onTimeArr: pct(onTimeArr, done.length),
    avgTransit: done.length ? done.reduce((a, s) => a + transitHours(s), 0) / done.length : 0,
    exceptions: list.filter((s) => s.milestones.some((m) => m.key === "offload")).length,
  };
}

/* ---------------- chart primitives ---------------- */

type Datum = { label: string; value: number; display: string; sub?: string };

function Tooltip({ x, y, title, lines }: { x: string; y: string; title: string; lines: string[] }) {
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg"
      style={{ left: x, top: `calc(${y} - 8px)` }}
    >
      <div className="font-semibold">{title}</div>
      {lines.map((l) => (
        <div key={l} className="text-slate-300">
          {l}
        </div>
      ))}
    </div>
  );
}

function ColumnChart({ data, unit }: { data: Datum[]; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 520;
  const H = 220;
  const pad = { l: 44, r: 8, t: 12, b: 28 };
  const max = Math.max(...data.map((d) => d.value)) * 1.1 || 1;
  const step = (W - pad.l - pad.r) / data.length;
  const bw = Math.min(56, step * 0.55);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Column chart in ${unit}`}>
        {ticks.map((tv) => (
          <g key={tv}>
            <line x1={pad.l} x2={W - pad.r} y1={y(tv)} y2={y(tv)} stroke="#eef2f7" />
            <text x={pad.l - 8} y={y(tv) + 3} textAnchor="end" fontSize={10} fill="#94a3b8">
              {tv >= 1000 ? `${(tv / 1000).toFixed(tv >= 10000 ? 0 : 1)}k` : Math.round(tv)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx0 = pad.l + step * i + step / 2;
          const top = y(d.value);
          const h = H - pad.b - top;
          return (
            <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={cx0 - step / 2} y={pad.t} width={step} height={H - pad.t - pad.b} fill="transparent" />
              <path
                d={`M${cx0 - bw / 2},${H - pad.b} V${top + 4} Q${cx0 - bw / 2},${top} ${cx0 - bw / 2 + 4},${top} H${cx0 + bw / 2 - 4} Q${cx0 + bw / 2},${top} ${cx0 + bw / 2},${top + 4} V${H - pad.b} Z`}
                fill={hover === null || hover === i ? "#2563eb" : "#93b4f5"}
                style={{ transition: "fill .15s" }}
                opacity={h > 0 ? 1 : 0}
              />
              <text x={cx0} y={H - 10} textAnchor="middle" fontSize={11} fill="#64748b">
                {d.label}
              </text>
            </g>
          );
        })}
        <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="#cbd5e1" />
      </svg>
      {hover !== null && (
        <Tooltip
          x={`${((pad.l + step * hover + step / 2) / W) * 100}%`}
          y={`${(y(data[hover].value) / H) * 100}%`}
          title={data[hover].label}
          lines={[data[hover].display, ...(data[hover].sub ? [data[hover].sub!] : [])]}
        />
      )}
    </div>
  );
}

function LineChart({ data, target }: { data: Datum[]; target: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 520;
  const H = 220;
  const pad = { l: 40, r: 16, t: 12, b: 28 };
  const min = Math.min(50, Math.floor(Math.min(...data.map((d) => d.value)) / 10) * 10);
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - (v - min) / (100 - min));
  const x = (i: number) => pad.l + ((W - pad.l - pad.r) * (i + 0.5)) / data.length;
  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="On-time arrival percentage per month">
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].filter((v) => v >= min).map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#eef2f7" />
            <text x={pad.l - 8} y={y(v) + 3} textAnchor="end" fontSize={10} fill="#94a3b8">
              {v}%
            </text>
          </g>
        ))}
        <line x1={pad.l} x2={W - pad.r} y1={y(target)} y2={y(target)} stroke="#64748b" strokeDasharray="4 4" />
        <text x={W - pad.r} y={y(target) - 5} textAnchor="end" fontSize={10} fill="#64748b">
          Target {target}%
        </text>
        <path d={`${path} L${x(data.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`} fill="#2563eb" opacity={0.06} />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth={2} strokeLinejoin="round" />
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#cbd5e1" />}
        {data.map((d, i) => (
          <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={x(i) - (W - pad.l - pad.r) / data.length / 2} y={pad.t} width={(W - pad.l - pad.r) / data.length} height={H - pad.t - pad.b} fill="transparent" />
            <circle cx={x(i)} cy={y(d.value)} r={hover === i ? 6 : 4.5} fill="#2563eb" stroke="#fff" strokeWidth={2} />
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize={11} fill="#64748b">
              {d.label}
            </text>
          </g>
        ))}
        {/* direct label on latest point */}
        <text x={x(data.length - 1)} y={y(data[data.length - 1].value) - 12} textAnchor="middle" fontSize={11} fontWeight={600} fill="#0f172a">
          {data[data.length - 1].value}%
        </text>
      </svg>
      {hover !== null && <Tooltip x={`${(x(hover) / W) * 100}%`} y={`${(y(data[hover].value) / H) * 100}%`} title={data[hover].label} lines={[data[hover].display, ...(data[hover].sub ? [data[hover].sub!] : [])]} />}
    </div>
  );
}

function BarList({ data }: { data: Datum[] }) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label} className="group" title={`${d.label}: ${d.display}`}>
          <div className="mb-1 flex items-baseline justify-between text-xs">
            <span className="font-medium text-slate-700">{d.label}</span>
            <span className="tabular-nums text-slate-500">
              {d.display}
              {d.sub && <span className="ml-1.5 text-slate-400">· {d.sub}</span>}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600 transition-all group-hover:bg-blue-700" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ChartCard({ title, subtitle, children, table }: { title: string; subtitle?: string; children: React.ReactNode; table: Datum[] }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          <button onClick={() => setShowTable(false)} className={cx("grid h-7 w-7 place-items-center rounded-md", !showTable ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")} aria-label="Chart view">
            <BarChart3 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setShowTable(true)} className={cx("grid h-7 w-7 place-items-center rounded-md", showTable ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")} aria-label="Table view">
            <Table2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {showTable ? (
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {table.map((d) => (
              <tr key={d.label}>
                <td className="py-2 text-slate-600">{d.label}</td>
                <td className="py-2 text-right font-medium tabular-nums text-slate-900">{d.display}</td>
                {d.sub !== undefined && <td className="py-2 pl-4 text-right text-xs text-slate-500">{d.sub}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        children
      )}
    </div>
  );
}

/* ---------------- page ---------------- */

const PERIODS = [
  { key: "30", label: "Last 30 days", days: 30 },
  { key: "90", label: "Last 90 days", days: 90 },
  { key: "all", label: "All time", days: 9999 },
];

export default function ReportsPage() {
  const { t } = useStore();
  const [period, setPeriod] = useState("90");
  const [dest, setDest] = useState("all");

  const list = useMemo(() => {
    const days = PERIODS.find((p) => p.key === period)!.days;
    const cutoff = NOW.getTime() - days * 86400000;
    return ALL_SHIPMENTS.filter((s) => new Date(departedAt(s)).getTime() >= cutoff && new Date(departedAt(s)).getTime() <= NOW.getTime() && (dest === "all" || s.destination === dest));
  }, [period, dest]);

  const k = summarize(list);
  const months = useMemo(() => {
    const keys = [...new Set(list.map((s) => monthKey(departedAt(s))))].sort();
    return keys.map((key) => {
      const ms = list.filter((s) => monthKey(departedAt(s)) === key);
      return { key, label: monthLabel(key), ...summarize(ms) };
    });
  }, [list]);

  const suppliers = useMemo(
    () =>
      SUPPLIERS.map((sp) => ({ sp, ...summarize(list.filter((s) => s.shipper === sp)) }))
        .filter((x) => x.count > 0)
        .sort((a, b) => b.kg - a.kg),
    [list],
  );

  const lanes = useMemo(() => {
    const keys = [...new Set(list.map((s) => s.destination))];
    return keys
      .map((d) => ({ dest: d, ...summarize(list.filter((s) => s.destination === d)) }))
      .sort((a, b) => b.kg - a.kg);
  }, [list]);

  const delayBuckets = useMemo(() => {
    const done = list.filter((s) => eta(s)?.actual);
    const b = [
      { label: "Early or on time (≤15 min)", test: (d: number) => d <= 15 },
      { label: "15–60 min late", test: (d: number) => d > 15 && d <= 60 },
      { label: "1–3 hours late", test: (d: number) => d > 60 && d <= 180 },
      { label: "More than 3 hours late", test: (d: number) => d > 180 },
    ];
    return b.map((x) => {
      const n = done.filter((s) => x.test(delayMinutes(eta(s)) ?? 0)).length;
      return { label: x.label, value: n, display: `${n} shipments`, sub: `${pct(n, done.length)}%` };
    });
  }, [list]);

  const tiles = [
    { label: "Shipments", value: k.count.toString(), icon: Package, sub: `${k.pcs.toLocaleString("en-GB")} pieces` },
    { label: "Chargeable weight", value: `${(k.kg / 1000).toFixed(1)} t`, icon: Scale, sub: `${Math.round(k.kg / Math.max(1, k.count))} kg avg / shipment` },
    { label: "On-time departure", value: `${k.onTimeDep}%`, icon: PlaneTakeoff, sub: `within ${ON_TIME_MIN} min of ETD` },
    { label: "On-time arrival", value: `${k.onTimeArr}%`, icon: PlaneLanding, sub: `within ${ON_TIME_MIN} min of ETA` },
    { label: "Avg. flight time", value: `${k.avgTransit.toFixed(1)} h`, icon: Clock, sub: "ATD → ATA, incl. transit" },
    { label: "Offloads / rebookings", value: k.exceptions.toString(), icon: TriangleAlert, sub: `${pct(k.exceptions, k.count)}% of shipments` },
  ];

  const exportCsv = () => {
    const head = "Destination,Shipments,Chargeable kg,On-time departure %,On-time arrival %,Avg flight time h,Offloads";
    const rows = lanes.map((l) => [l.dest, l.count, l.kg, l.onTimeDep, l.onTimeArr, l.avgTransit.toFixed(1), l.exceptions].join(","));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([[head, ...rows].join("\n")], { type: "text/csv" }));
    a.download = "airflo-lane-report.csv";
    a.click();
  };

  const select = "h-9 rounded-lg bg-white px-3 text-sm text-slate-700 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <main className={PAGE}>
      <PageHeader
        title={t("nav_reports")}
        subtitle="Your inbound air freight via Airflo — volumes per site and supplier, punctuality and exceptions."
        actions={
          <>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className={select} aria-label="Period">
              {PERIODS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
            <select value={dest} onChange={(e) => setDest(e.target.value)} className={select} aria-label="Receiving site">
              <option value="all">All sites</option>
              {Object.values(SITES).map((st) => (
                <option key={st.code} value={st.code}>
                  {st.name} ({st.code})
                </option>
              ))}
            </select>
            <button onClick={exportCsv} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map(({ label, value, icon: I, sub }) => (
          <div key={label} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <I className="h-4 w-4 text-slate-400" /> {label}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
            <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">No shipments in this selection.</div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Inbound weight per month"
              subtitle="Kilograms shipped, by month of departure"
              table={months.map((m) => ({ label: m.label, value: m.kg, display: `${m.kg.toLocaleString("en-GB")} kg`, sub: `${m.count} shipments` }))}
            >
              <ColumnChart unit="kg" data={months.map((m) => ({ label: m.label, value: m.kg, display: `${m.kg.toLocaleString("en-GB")} kg`, sub: `${m.count} shipments` }))} />
            </ChartCard>
            <ChartCard
              title="On-time arrival"
              subtitle={`Share of shipments landing within ${ON_TIME_MIN} min of ETA`}
              table={months.map((m) => ({ label: m.label, value: m.onTimeArr, display: `${m.onTimeArr}%`, sub: `${m.count} shipments` }))}
            >
              <LineChart target={90} data={months.map((m) => ({ label: m.label, value: m.onTimeArr, display: `${m.onTimeArr}% on time`, sub: `${m.count} shipments` }))} />
            </ChartCard>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ChartCard
              title="Volume by site"
              subtitle="Chargeable weight received per site"
              table={lanes.map((l) => ({ label: `${SITES[l.dest].name} (${l.dest})`, value: l.kg, display: `${l.kg.toLocaleString("en-GB")} kg`, sub: `${l.count} shipments` }))}
            >
              <BarList data={lanes.map((l) => ({ label: `${SITES[l.dest].name} (${l.dest})`, value: l.kg, display: `${l.kg.toLocaleString("en-GB")} kg`, sub: `${l.count} shp` }))} />
            </ChartCard>
            <ChartCard
              title="Volume by supplier"
              subtitle="Chargeable weight shipped by each supplier"
              table={suppliers.map((x) => ({ label: supplierName(x.sp), value: x.kg, display: `${x.kg.toLocaleString("en-GB")} kg`, sub: `${x.count} shipments` }))}
            >
              <BarList data={suppliers.map((x) => ({ label: supplierName(x.sp), value: x.kg, display: `${x.kg.toLocaleString("en-GB")} kg`, sub: `${x.count} shp` }))} />
            </ChartCard>
            <ChartCard title="Arrival punctuality" subtitle="Completed shipments by arrival delay vs. ETA" table={delayBuckets}>
              <BarList data={delayBuckets} />
            </ChartCard>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <div className="border-b border-slate-100 p-5">
              <h3 className="text-[15px] font-semibold text-slate-900">Lane performance</h3>
              <p className="text-xs text-slate-500">Airflo Amsterdam (AMS) to each of your sites</p>
            </div>
            <div className="scroll-thin overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Lane</th>
                    <th className="px-5 py-3 text-right">Shipments</th>
                    <th className="px-5 py-3 text-right">Chargeable kg</th>
                    <th className="px-5 py-3 text-right">On-time dep.</th>
                    <th className="px-5 py-3 text-right">On-time arr.</th>
                    <th className="px-5 py-3 text-right">Avg flight time</th>
                    <th className="px-5 py-3 text-right">Offloads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lanes.map((l) => (
                    <tr key={l.dest} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        AMS → {l.dest} <span className="font-normal text-slate-400">{SITES[l.dest].name}</span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{l.count}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{l.kg.toLocaleString("en-GB")}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{l.onTimeDep}%</td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                            l.onTimeArr >= 90 ? "bg-emerald-50 text-emerald-700" : l.onTimeArr >= 75 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700",
                          )}
                        >
                          {l.onTimeArr >= 90 ? "●" : l.onTimeArr >= 75 ? "▲" : "■"} {l.onTimeArr}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{l.avgTransit.toFixed(1)} h</td>
                      <td className="px-5 py-3 text-right tabular-nums">{l.exceptions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Based on {completed.length} completed shipments in the sample data. On time = within {ON_TIME_MIN} minutes of the planned time.
          </p>
        </>
      )}
    </main>
  );
}
