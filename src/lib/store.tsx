"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dict, type Key, type Lang } from "@/lib/i18n";
import { ALL_SHIPMENTS, AIRPORTS, NOW, formatTime, type MilestoneKey, type Shipment } from "@/lib/data";

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export type NotifyEvent = "pickup" | "departure" | "arrival" | "exception" | "documents";
export type Channels = { email: boolean; whatsapp: boolean; portal: boolean };

export type Profile = {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone: string;
  whatsapp: string;
  language: Lang;
  timezone: string;
  company: string;
  accountNo: string;
  vat: string;
  eori: string;
  street: string;
  postcode: string;
  city: string;
  country: string;
  billingEmail: string;
  notify: Record<NotifyEvent, Channels>;
  digest: "off" | "daily" | "weekly";
  quietHours: boolean;
  extraRecipients: string[];
};

export const DEFAULT_PROFILE: Profile = {
  firstName: "Sanne",
  lastName: "de Vries",
  role: "Logistics Manager",
  email: "sanne.devries@nordhaven.example",
  phone: "+31 10 555 0142",
  whatsapp: "+31 6 5555 0142",
  language: "en",
  timezone: "Europe/Amsterdam",
  company: "Nordhaven Industrial Parts B.V.",
  accountNo: "AF-100284",
  vat: "NL 8123.45.678.B01",
  eori: "NL812345678",
  street: "Waalhaven Oostzijde 88",
  postcode: "3087 BM",
  city: "Rotterdam",
  country: "Netherlands",
  billingEmail: "accounts@nordhaven.example",
  notify: {
    pickup: { email: true, whatsapp: false, portal: true },
    departure: { email: true, whatsapp: true, portal: true },
    arrival: { email: true, whatsapp: true, portal: true },
    exception: { email: true, whatsapp: true, portal: true },
    documents: { email: false, whatsapp: false, portal: true },
  },
  digest: "daily",
  quietHours: true,
  extraRecipients: ["planning@nordhaven.example", "warehouse@nordhaven.example"],
};

/* ------------------------------------------------------------------ */
/* Notifications (derived from shipment events)                        */
/* ------------------------------------------------------------------ */

export type NotificationType = MilestoneKey | "document" | "eta";
export type Notification = {
  id: string;
  type: NotificationType;
  shipmentId: string;
  awb: string;
  title: string;
  body: string;
  at: string;
  severity: "info" | "success" | "warning";
};

function buildNotifications(): Notification[] {
  const since = NOW.getTime() - 10 * 24 * 3600000;
  const out: Notification[] = [];
  const route = (s: Shipment) => `${s.origin} → ${s.destination}`;
  for (const s of ALL_SHIPMENTS) {
    for (const m of s.milestones) {
      if (!m.actual) continue;
      const t = new Date(m.actual).getTime();
      if (t < since || t > NOW.getTime()) continue;
      const city = AIRPORTS[m.at].city;
      const time = formatTime(m.actual, m.at, { date: false });
      const map: Record<MilestoneKey, [string, string, Notification["severity"]]> = {
        pickup: [`Picked up · ${s.id}`, `Your shipment (${s.pieces} pcs) was collected at ${time}. Next: delivery to the airline at Amsterdam.`, "info"],
        loaded: [`Loaded on aircraft · ${s.id}`, `Freight is loaded on ${s.flights[0]} at ${city}.`, "info"],
        departed: [`Departed · ${s.flights[0]}`, `Shipment ${s.id} (${route(s)}) departed ${city} at ${time} local time.`, "info"],
        transit: [`At transit hub · ${s.id}`, `Arrived in ${city} at ${time}. Connecting to ${s.flights[1] ?? "next flight"}.`, "info"],
        arrived: [`Arrived · ${s.id}`, `${s.flights[s.flights.length - 1]} landed in ${city} at ${time} local time.`, "success"],
        offload: [`Rebooked · ${s.id}`, m.note ?? "Shipment was moved to another flight.", "warning"],
      };
      const [title, body, severity] = map[m.key];
      out.push({ id: `${s.id}-${m.key}`, type: m.key, shipmentId: s.id, awb: s.awb, title, body, at: m.actual, severity });
    }
    const docDate = new Date(s.documents[0]?.date ?? 0).getTime();
    if (s.documents.length && docDate >= since && docDate <= NOW.getTime()) {
      out.push({
        id: `${s.id}-docs`,
        type: "document",
        shipmentId: s.id,
        awb: s.awb,
        title: `Documents available · ${s.id}`,
        body: `${s.documents.map((d) => d.name).join(", ")} ${s.documents.length > 1 ? "are" : "is"} ready to view.`,
        at: s.documents[0].date,
        severity: "info",
      });
    }
  }
  // One ETA update for the live in-flight shipment
  out.push({
    id: "5006-eta",
    type: "eta",
    shipmentId: "5006",
    awb: "074-12345675",
    title: "ETA updated · 5006",
    body: "Live flight data shows KL 887 arriving in Hong Kong at 21:45 local time (14 min later than scheduled).",
    at: "2026-11-25T09:40:00Z",
    severity: "warning",
  });
  return out.sort((a, b) => +new Date(b.at) - +new Date(a.at));
}

export const NOTIFICATIONS = buildNotifications();

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

type Store = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
  profile: Profile;
  saveProfile: (p: Profile) => void;
  resetProfile: () => void;
  readIds: Set<string>;
  markRead: (ids: string[]) => void;
  markUnread: (id: string) => void;
  unreadCount: number;
};

const Ctx = createContext<Store | null>(null);

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
};

// Notifications older than 24h start out as read.
const initiallyRead = NOTIFICATIONS.filter((n) => NOW.getTime() - new Date(n.at).getTime() > 24 * 3600000).map((n) => n.id);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [readIds, setReadIds] = useState<Set<string>>(new Set(initiallyRead));

  useEffect(() => {
    setLangState(load<Lang>("airflo.lang", "en"));
    setProfile({ ...DEFAULT_PROFILE, ...load<Partial<Profile>>("airflo.profile", {}) });
    setReadIds(new Set(load<string[]>("airflo.read", initiallyRead)));
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    save("airflo.lang", l);
  }, []);

  const saveProfile = useCallback((p: Profile) => {
    setProfile(p);
    save("airflo.profile", p);
    setLangState(p.language);
    save("airflo.lang", p.language);
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    save("airflo.profile", {});
  }, []);

  const markRead = useCallback((ids: string[]) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      ids.forEach((i) => next.add(i));
      save("airflo.read", [...next]);
      return next;
    });
  }, []);

  const markUnread = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      save("airflo.read", [...next]);
      return next;
    });
  }, []);

  const value = useMemo<Store>(
    () => ({
      lang,
      setLang,
      t: (k: Key) => dict[lang][k] ?? dict.en[k] ?? k,
      profile,
      saveProfile,
      resetProfile,
      readIds,
      markRead,
      markUnread,
      unreadCount: NOTIFICATIONS.filter((n) => !readIds.has(n.id)).length,
    }),
    [lang, setLang, profile, saveProfile, resetProfile, readIds, markRead, markUnread],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside StoreProvider");
  return v;
}
