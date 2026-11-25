"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE } from "@/components/AppShell";
import { DocPreview, Details, Documents, Notifications, ShipmentHero, Timeline } from "@/components/shipment";
import { ALL_SHIPMENTS, type Doc } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function ShipmentView({ id }: { id: string }) {
  const { t } = useStore();
  const [preview, setPreview] = useState<Doc | null>(null);
  const idx = ALL_SHIPMENTS.findIndex((s) => s.id === id);
  const s = ALL_SHIPMENTS[idx];
  const prev = ALL_SHIPMENTS[idx - 1];
  const next = ALL_SHIPMENTS[idx + 1];

  return (
    <main className={PAGE}>
      <div className="flex items-center justify-between gap-3">
        <Link href="/shipments" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> {t("shipments")}
        </Link>
        <div className="flex items-center gap-1">
          {prev && (
            <Link href={`/shipments/${prev.id}`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-white">
              <ChevronLeft className="h-3.5 w-3.5" /> {prev.id}
            </Link>
          )}
          {next && (
            <Link href={`/shipments/${next.id}`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-white">
              {next.id} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-6">
        <ShipmentHero s={s} t={t} />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <Timeline s={s} t={t} />
          <div className="space-y-6">
            <Details s={s} t={t} />
            <Documents s={s} t={t} onView={setPreview} />
          </div>
        </div>
        <Notifications s={s} t={t} />
      </div>

      {preview && <DocPreview doc={preview} s={s} onClose={() => setPreview(null)} />}
    </main>
  );
}
