"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BellRing, CheckCheck, Mail, MessageCircle, Monitor, Moon, Plus, Settings2, X, Circle } from "lucide-react";
import { NOTIF_ICON, NOTIF_TONE, PAGE, PageHeader, timeAgo } from "@/components/AppShell";
import { cx } from "@/components/shipment";
import { NOW, formatTime } from "@/lib/data";
import { NOTIFICATIONS, useStore, type Channels, type Notification, type NotifyEvent } from "@/lib/store";

const FILTERS: { key: string; label: string; match: (n: Notification) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "exceptions", label: "Delays & offloads", match: (n) => n.severity === "warning" },
  { key: "departures", label: "Departures", match: (n) => n.type === "departed" || n.type === "loaded" || n.type === "pickup" },
  { key: "arrivals", label: "Arrivals", match: (n) => n.type === "arrived" || n.type === "transit" },
  { key: "documents", label: "Documents", match: (n) => n.type === "document" },
];

const EVENTS: { key: NotifyEvent; label: string; desc: string }[] = [
  { key: "pickup", label: "Pick-up confirmed", desc: "When the truck has collected your freight" },
  { key: "departure", label: "Flight departure", desc: "Loaded on aircraft and actual departure time" },
  { key: "arrival", label: "Arrival at destination", desc: "Actual landing time, incl. transit hubs" },
  { key: "exception", label: "Delays & offloads", desc: "ETA changes, offloads and rebookings" },
  { key: "documents", label: "New documents", desc: "AWB, invoices and proof of delivery" },
];

function dayBucket(iso: string) {
  const d = Math.floor((NOW.getTime() - new Date(iso).getTime()) / 86400000);
  const sameDay = new Date(iso).toDateString() === NOW.toDateString();
  if (sameDay) return "Today";
  if (d <= 1) return "Yesterday";
  if (d <= 7) return "This week";
  return "Earlier";
}

export default function NotificationsPage() {
  const { t, readIds, markRead, markUnread, unreadCount, profile, saveProfile } = useStore();
  const [filter, setFilter] = useState("all");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [tab, setTab] = useState<"inbox" | "settings">("inbox");
  const [newRecipient, setNewRecipient] = useState("");
  const [saved, setSaved] = useState(false);
  const [limit, setLimit] = useState(20);

  const list = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    return NOTIFICATIONS.filter((n) => f.match(n) && (!onlyUnread || !readIds.has(n.id)));
  }, [filter, onlyUnread, readIds]);

  const groups = useMemo(() => {
    const g: Record<string, Notification[]> = {};
    list.slice(0, limit).forEach((n) => (g[dayBucket(n.at)] ??= []).push(n));
    return Object.entries(g);
  }, [list, limit]);

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const setChannel = (ev: NotifyEvent, ch: keyof Channels) => {
    saveProfile({ ...profile, notify: { ...profile.notify, [ev]: { ...profile.notify[ev], [ch]: !profile.notify[ev][ch] } } });
    flash();
  };

  const chip = (on: boolean) =>
    cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition", on ? "bg-blue-600 text-white ring-blue-600" : "bg-white text-slate-500 ring-slate-200 hover:ring-slate-300");

  return (
    <main className={PAGE}>
      <PageHeader
        title={t("nav_notifications")}
        subtitle="Every shipment update in one feed — the same updates are sent to your email and WhatsApp automatically."
        actions={
          <div className="flex rounded-lg bg-white p-0.5 ring-1 ring-slate-200">
            {(["inbox", "settings"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={cx("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold", tab === k ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}
              >
                {k === "inbox" ? <BellRing className="h-3.5 w-3.5" /> : <Settings2 className="h-3.5 w-3.5" />}
                {k === "inbox" ? `Inbox${unreadCount ? ` (${unreadCount})` : ""}` : "Preferences"}
              </button>
            ))}
          </div>
        }
      />

      {tab === "inbox" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {FILTERS.map((f) => {
                  const n = NOTIFICATIONS.filter(f.match).length;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={cx(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                        filter === f.key ? "bg-blue-600 text-white ring-blue-600" : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300",
                      )}
                    >
                      {f.label} <span className={cx("rounded-full px-1.5 text-[10px]", filter === f.key ? "bg-white/20" : "bg-slate-100")}>{n}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                  <input type="checkbox" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} className="h-3.5 w-3.5 accent-blue-600" />
                  {t("unread")}
                </label>
                <button
                  onClick={() => markRead(NOTIFICATIONS.map((n) => n.id))}
                  disabled={unreadCount === 0}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-300"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> {t("mark_all_read")}
                </button>
              </div>
            </div>

            {groups.length === 0 && <div className="px-4 py-16 text-center text-sm text-slate-500">You&apos;re all caught up.</div>}
            {groups.map(([label, items]) => (
              <section key={label}>
                <div className="bg-slate-50/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
                <ul className="divide-y divide-slate-100">
                  {items.map((n) => {
                    const I = NOTIF_ICON[n.type];
                    const unread = !readIds.has(n.id);
                    return (
                      <li key={n.id} className={cx("group relative flex gap-3 px-4 py-3.5 transition hover:bg-slate-50", unread && "bg-blue-50/40")}>
                        <span className={cx("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full", NOTIF_TONE[n.severity])}>
                          <I className="h-4 w-4" />
                        </span>
                        <Link href={`/shipments/${n.shipmentId}`} onClick={() => markRead([n.id])} className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2">
                            <span className={cx("text-sm", unread ? "font-semibold text-slate-900" : "font-medium text-slate-700")}>{n.title}</span>
                            <span className="font-mono text-[11px] text-slate-400">{n.awb}</span>
                          </div>
                          <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>
                          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
                            <span>
                              {timeAgo(n.at)} · {formatTime(n.at, "AMS")} CET
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Monitor className="h-3 w-3" /> <Mail className="h-3 w-3" /> <MessageCircle className="h-3 w-3" /> sent
                            </span>
                          </div>
                        </Link>
                        <button
                          onClick={() => (unread ? markRead([n.id]) : markUnread(n.id))}
                          className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-white hover:text-blue-600"
                          title={unread ? "Mark as read" : "Mark as unread"}
                          aria-label={unread ? "Mark as read" : "Mark as unread"}
                        >
                          {unread ? <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> : <Circle className="h-3 w-3" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            {list.length > limit && (
              <button onClick={() => setLimit(limit + 20)} className="block w-full border-t border-slate-100 py-3 text-center text-xs font-semibold text-blue-600 hover:bg-slate-50">
                Show older updates ({list.length - limit} more)
              </button>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white">
              <BellRing className="h-6 w-6 opacity-80" />
              <div className="mt-3 text-3xl font-semibold">{NOTIFICATIONS.length}</div>
              <div className="text-sm text-blue-100">updates sent automatically in the last 10 days</div>
              <div className="mt-4 rounded-xl bg-white/10 p-3 text-xs text-blue-50">No more calling or emailing for status — every milestone is pushed to you the moment it happens.</div>
            </div>
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">Delivery channels</h3>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" /> Email
                  </span>
                  <span className="truncate pl-3 text-xs font-medium text-slate-800">{profile.email}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-slate-600">
                    <MessageCircle className="h-4 w-4 text-slate-400" /> WhatsApp
                  </span>
                  <span className="text-xs font-medium text-slate-800">{profile.whatsapp}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-slate-600">
                    <Moon className="h-4 w-4 text-slate-400" /> Quiet hours
                  </span>
                  <span className="text-xs font-medium text-slate-800">{profile.quietHours ? "22:00–07:00" : "Off"}</span>
                </li>
              </ul>
              <button onClick={() => setTab("settings")} className="mt-4 w-full rounded-lg py-2 text-xs font-semibold text-blue-600 ring-1 ring-slate-200 hover:bg-slate-50">
                Manage preferences
              </button>
            </div>
          </aside>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl bg-white ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900">What should we notify you about?</h3>
                <p className="text-xs text-slate-500">Applies to all your shipments. Changes save automatically.</p>
              </div>
              {saved && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Saved</span>}
            </div>
            <ul className="divide-y divide-slate-100">
              {EVENTS.map((ev) => (
                <li key={ev.key} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{ev.label}</div>
                    <div className="text-xs text-slate-500">{ev.desc}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setChannel(ev.key, "portal")} className={chip(profile.notify[ev.key].portal)} aria-pressed={profile.notify[ev.key].portal}>
                      <Monitor className="h-3 w-3" /> Portal
                    </button>
                    <button onClick={() => setChannel(ev.key, "email")} className={chip(profile.notify[ev.key].email)} aria-pressed={profile.notify[ev.key].email}>
                      <Mail className="h-3 w-3" /> Email
                    </button>
                    <button onClick={() => setChannel(ev.key, "whatsapp")} className={chip(profile.notify[ev.key].whatsapp)} aria-pressed={profile.notify[ev.key].whatsapp}>
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">Summary email</h3>
              <p className="text-xs text-slate-500">A digest of all shipment activity.</p>
              <div className="mt-3 flex rounded-lg bg-slate-100 p-0.5">
                {(["off", "daily", "weekly"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      saveProfile({ ...profile, digest: d });
                      flash();
                    }}
                    className={cx("flex-1 rounded-md py-1.5 text-xs font-semibold capitalize", profile.digest === d ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <label className="mt-4 flex cursor-pointer items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-medium text-slate-800">Quiet hours</span>
                  <span className="block text-xs text-slate-500">No WhatsApp messages 22:00–07:00 (exceptions still come through)</span>
                </span>
                <button
                  role="switch"
                  aria-checked={profile.quietHours}
                  onClick={() => {
                    saveProfile({ ...profile, quietHours: !profile.quietHours });
                    flash();
                  }}
                  className={cx("relative h-6 w-11 shrink-0 rounded-full transition", profile.quietHours ? "bg-blue-600" : "bg-slate-300")}
                >
                  <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", profile.quietHours ? "left-[22px]" : "left-0.5")} />
                </button>
              </label>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">Also send updates to</h3>
              <p className="text-xs text-slate-500">Colleagues, your warehouse or your customer.</p>
              <ul className="mt-3 space-y-2">
                {profile.extraRecipients.map((r) => (
                  <li key={r} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <span className="truncate">{r}</span>
                    <button
                      onClick={() => {
                        saveProfile({ ...profile, extraRecipients: profile.extraRecipients.filter((x) => x !== r) });
                        flash();
                      }}
                      className="text-slate-400 hover:text-rose-600"
                      aria-label={`Remove ${r}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const v = newRecipient.trim();
                  if (!v || profile.extraRecipients.includes(v)) return;
                  saveProfile({ ...profile, extraRecipients: [...profile.extraRecipients, v] });
                  setNewRecipient("");
                  flash();
                }}
              >
                <input
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="email or +31 phone number"
                  className="h-9 min-w-0 flex-1 rounded-lg bg-slate-50 px-3 text-sm outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
                <button className="inline-flex h-9 items-center gap-1 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
