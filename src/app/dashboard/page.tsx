"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Clock, Download, MapPin } from "lucide-react";
import { PAGE } from "@/components/AppShell";
import { DocPreview, Details, Documents, Notifications, ShipmentHero, ShipmentList, StatTiles, StatusPill, Timeline, cx } from "@/components/shipment";
import { SHIPMENTS, SITES, STATUS_GROUP, arrivalAt, formatTime, relative, supplierName, type Doc, type StatusGroup } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function Dashboard() {
  const { t, profile } = useStore();
  const [group, setGroup] = useState<StatusGroup>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("5006");
  const [preview, setPreview] = useState<Doc | null>(null);

  const counts = useMemo(() => {
    const c = { all: SHIPMENTS.length, booked: 0, transit: 0, arrived: 0, exception: 0 };
    SHIPMENTS.forEach((s) => c[STATUS_GROUP[s.status]]++);
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/[\s-]/g, "");
    return SHIPMENTS.filter((s) => {
      if (group !== "all" && STATUS_GROUP[s.status] !== group) return false;
      if (!q) return true;
      return [s.id, s.awb, s.origin, s.destination, s.consignee, s.reference, ...s.flights].join(" ").toLowerCase().replace(/[\s-]/g, "").includes(q);
    });
  }, [group, query]);

  const selected = SHIPMENTS.find((s) => s.id === selectedId) ?? SHIPMENTS[0];
  const upcoming = useMemo(() => SHIPMENTS.filter((s) => s.status !== "arrived").sort((a, b) => +new Date(arrivalAt(a)) - +new Date(arrivalAt(b))).slice(0, 4), []);

  return (
    <main className={PAGE}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">{profile.company}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
            {t("welcome")}, {profile.firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {t("last_sync")}
          </span>
          <Link href="/shipments" className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> {t("export")}
          </Link>
        </div>
      </div>

      <StatTiles counts={counts} group={group} setGroup={setGroup} t={t} />

      {/* Next arrivals — what a consignee cares about first */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-900">{t("next_arrivals")}</h2>
          <span className="text-xs text-slate-500">Local time at your site</span>
        </div>
        <div className="scroll-thin -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 xl:grid-cols-4">
          {upcoming.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedId(s.id);
                document.getElementById("detail")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={cx(
                "min-w-[260px] snap-start rounded-2xl bg-white p-4 text-left ring-1 transition hover:shadow-md sm:min-w-0",
                selectedId === s.id ? "ring-2 ring-blue-600" : "ring-slate-200",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                  <MapPin className="h-3.5 w-3.5" /> {SITES[s.destination].name}
                </span>
                <StatusPill status={s.status} t={t} />
              </div>
              <div className="mt-3 text-xl font-semibold tracking-tight text-slate-900">{formatTime(arrivalAt(s), s.destination)}</div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" /> {t("lands")} {relative(arrivalAt(s))}
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-800">#{s.id}</span> · {supplierName(s.shipper)}
                <div className="mt-0.5">
                  {s.pieces} pcs · {s.chargeableWeight} kg · {s.flights.join(" → ")}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="space-y-3">
          <ShipmentList
            items={filtered}
            selectedId={selected.id}
            onSelect={(id) => {
              setSelectedId(id);
              if (window.innerWidth < 1024) document.getElementById("detail")?.scrollIntoView({ behavior: "smooth" });
            }}
            t={t}
            query={query}
            setQuery={setQuery}
          />
          <Link href="/shipments" className="flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-semibold text-blue-600 ring-1 ring-slate-200 hover:bg-slate-50">
            {t("view_all")} {t("shipments").toLowerCase()} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <section id="detail" className="min-w-0 scroll-mt-28 space-y-6">
          <ShipmentHero s={selected} t={t} />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <Timeline s={selected} t={t} />
            <div className="space-y-6">
              <Details s={selected} t={t} />
              <Documents s={selected} t={t} onView={setPreview} />
            </div>
          </div>
          <Notifications s={selected} t={t} />
        </section>
      </div>

      {preview && <DocPreview doc={preview} s={selected} onClose={() => setPreview(null)} />}
    </main>
  );
}
