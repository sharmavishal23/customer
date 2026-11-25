"use client";

import Link from "next/link";
import { Building2, Globe, KeyRound, Mail, MapPin, MessageCircle, Monitor, Pencil, Phone, ShieldCheck, UserPlus, Users } from "lucide-react";
import { PAGE, PageHeader } from "@/components/AppShell";
import { cx } from "@/components/shipment";
import { useStore, type NotifyEvent } from "@/lib/store";

const TEAM = [
  { name: "Sanne de Vries", email: "sanne.devries@nordhaven.example", role: "Admin", last: "Active now" },
  { name: "Joost Bakker", email: "joost.bakker@nordhaven.example", role: "Member", last: "2 hours ago" },
  { name: "Lucía Herrera", email: "lucia.herrera@nordhaven.example", role: "Member", last: "Yesterday" },
  { name: "Warehouse Rotterdam", email: "warehouse@nordhaven.example", role: "Viewer", last: "3 days ago" },
];

const AIRFLO = [
  { name: "Mark Jansen", role: "Account manager", email: "m.jansen@airflo.example", phone: "+31 20 000 0101" },
  { name: "Export desk", role: "Operations · 24/7", email: "export@airflo.example", phone: "+31 20 000 0000" },
];

const EVENT_LABEL: Record<NotifyEvent, string> = {
  pickup: "Pick-up confirmed",
  departure: "Flight departure",
  arrival: "Arrival",
  exception: "Delays & offloads",
  documents: "New documents",
};

function Field({ label, value, icon: I }: { label: string; value: string; icon?: typeof Mail }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-800">
        {I && <I className="h-3.5 w-3.5 text-slate-400" />}
        {value}
      </dd>
    </div>
  );
}

const initials = (n: string) =>
  n
    .split(" ")
    .filter((p) => p[0] === p[0]?.toUpperCase())
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

export default function ProfilePage() {
  const { t, profile } = useStore();
  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <main className={PAGE}>
      <PageHeader
        title={t("nav_profile")}
        subtitle="Your account, company details and the people who can see your shipments."
        actions={
          <Link href="/profile/edit" className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
            <Pencil className="h-3.5 w-3.5" /> {t("edit_profile")}
          </Link>
        }
      />

      {/* Identity card */}
      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
        <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="-mt-10 flex items-end gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-slate-900 text-2xl font-semibold text-white ring-4 ring-white">
              {(profile.firstName[0] ?? "") + (profile.lastName.split(" ").pop()?.[0] ?? "")}
            </div>
            <div className="pb-1">
              <div className="text-xl font-semibold text-slate-900">{fullName}</div>
              <div className="text-sm text-slate-500">
                {profile.role} · {profile.company}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified customer
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">Account {profile.accountNo}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h3 className="text-[15px] font-semibold text-slate-900">Contact details</h3>
          <dl className="mt-4 space-y-4">
            <Field label="Email" value={profile.email} icon={Mail} />
            <Field label="Phone" value={profile.phone} icon={Phone} />
            <Field label="WhatsApp" value={profile.whatsapp} icon={MessageCircle} />
            <Field label="Language & time zone" value={`${profile.language === "es" ? "Español" : "English"} · ${profile.timezone}`} icon={Globe} />
          </dl>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h3 className="text-[15px] font-semibold text-slate-900">Company</h3>
          <dl className="mt-4 space-y-4">
            <Field label="Company name" value={profile.company} icon={Building2} />
            <Field label="Address" value={`${profile.street}, ${profile.postcode} ${profile.city}, ${profile.country}`} icon={MapPin} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="VAT number" value={profile.vat} />
              <Field label="EORI" value={profile.eori} />
            </div>
            <Field label="Billing email" value={profile.billingEmail} icon={Mail} />
          </dl>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-slate-900">Notifications</h3>
            <Link href="/notifications" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Manage
            </Link>
          </div>
          <ul className="mt-4 space-y-2.5">
            {(Object.keys(EVENT_LABEL) as NotifyEvent[]).map((k) => {
              const c = profile.notify[k];
              return (
                <li key={k} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{EVENT_LABEL[k]}</span>
                  <span className="flex gap-1">
                    {[
                      { on: c.portal, I: Monitor, l: "Portal" },
                      { on: c.email, I: Mail, l: "Email" },
                      { on: c.whatsapp, I: MessageCircle, l: "WhatsApp" },
                    ].map(({ on, I, l }) => (
                      <span key={l} title={`${l}: ${on ? "on" : "off"}`} className={cx("grid h-6 w-6 place-items-center rounded-md", on ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-300")}>
                        <I className="h-3.5 w-3.5" />
                      </span>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Digest: <span className="font-semibold capitalize text-slate-700">{profile.digest}</span> · Quiet hours:{" "}
            <span className="font-semibold text-slate-700">{profile.quietHours ? "on" : "off"}</span>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h3 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
                <Users className="h-4 w-4 text-slate-400" /> Team members
              </h3>
              <p className="text-xs text-slate-500">People at {profile.company} with portal access</p>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
              <UserPlus className="h-3.5 w-3.5" /> Invite
            </button>
          </div>
          <ul className="divide-y divide-slate-100">
            {TEAM.map((m, i) => (
              <li key={m.email} className="flex items-center gap-3 px-5 py-3">
                <span className={cx("grid h-9 w-9 place-items-center rounded-full text-xs font-semibold", i === 0 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600")}>
                  {initials(i === 0 ? `${profile.firstName} ${profile.lastName}` : m.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-800">
                    {i === 0 ? `${profile.firstName} ${profile.lastName}` : m.name} {i === 0 && <span className="text-xs text-slate-400">(you)</span>}
                  </div>
                  <div className="truncate text-xs text-slate-500">{i === 0 ? profile.email : m.email}</div>
                </div>
                <span className="hidden text-xs text-slate-400 sm:block">{m.last}</span>
                <span
                  className={cx(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    m.role === "Admin" ? "bg-blue-50 text-blue-700" : m.role === "Member" ? "bg-slate-100 text-slate-700" : "bg-amber-50 text-amber-700",
                  )}
                >
                  {m.role}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="text-[15px] font-semibold text-slate-900">Your Airflo contacts</h3>
            <ul className="mt-4 space-y-4">
              {AIRFLO.map((c) => (
                <li key={c.name} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">{initials(c.name)}</span>
                  <div className="min-w-0 text-sm">
                    <div className="font-medium text-slate-800">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.role}</div>
                    <div className="mt-1 text-xs text-slate-600">
                      {c.email} · {c.phone}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="text-[15px] font-semibold text-slate-900">Security</h3>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <KeyRound className="h-4 w-4 text-slate-400" /> Password
                </span>
                <span className="text-xs text-slate-500">Changed 3 months ago</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-slate-400" /> Two-factor login
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Enabled</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
