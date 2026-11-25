"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  ExternalLink,
  FileText,
  Globe,
  Headphones,
  LayoutDashboard,
  LogOut,
  Package,
  Pencil,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Search,
  TriangleAlert,
  Truck,
  BarChart3,
  PackageCheck,
  RefreshCw,
  Clock,
  Home,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { StoreProvider, useStore, NOTIFICATIONS, type NotificationType } from "@/lib/store";
import { findShipment, NOW } from "@/lib/data";
import type { Key } from "@/lib/i18n";

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

export const NOTIF_ICON: Record<NotificationType, typeof Bell> = {
  pickup: Truck,
  loaded: PackageCheck,
  departed: PlaneTakeoff,
  transit: RefreshCw,
  arrived: PlaneLanding,
  offload: TriangleAlert,
  document: FileText,
  eta: Clock,
};

export const NOTIF_TONE: Record<"info" | "success" | "warning", string> = {
  info: "bg-blue-50 text-blue-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
};

export function timeAgo(iso: string) {
  const mins = Math.round((NOW.getTime() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const NAV: { href: string; label: Key; icon: typeof Bell }[] = [
  { href: "/dashboard", label: "nav_track", icon: LayoutDashboard },
  { href: "/shipments", label: "nav_shipments", icon: Package },
  { href: "/documents", label: "nav_documents", icon: FileText },
  { href: "/reports", label: "nav_reports", icon: BarChart3 },
  { href: "/notifications", label: "nav_notifications", icon: Bell },
];

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOut: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOut();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, onOut]);
}

export function Logo({ sub = "Track & Trace", href = "/dashboard", light = false }: { sub?: string; href?: string; light?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/30">
        <Plane className="h-[18px] w-[18px] -rotate-45" />
      </div>
      <div className="leading-tight">
        <div className={cx("text-[15px] font-bold tracking-tight", light ? "text-white" : "text-slate-900")}>Airflo</div>
        <div className={cx("text-[10px] font-medium uppercase tracking-[0.14em]", light ? "text-blue-200" : "text-slate-400")}>{sub}</div>
      </div>
    </Link>
  );
}

function BellMenu() {
  const { t, readIds, markRead, unreadCount } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const latest = NOTIFICATIONS.slice(0, 6);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cx("relative grid h-9 w-9 place-items-center rounded-lg text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50", open && "bg-slate-100")}
        aria-label={t("nav_notifications")}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="text-sm font-semibold text-slate-900">
              {t("nav_notifications")}
              {unreadCount > 0 && <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">{unreadCount} new</span>}
            </div>
            <button onClick={() => markRead(NOTIFICATIONS.map((n) => n.id))} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              {t("mark_all_read")}
            </button>
          </div>
          <ul className="max-h-[400px] divide-y divide-slate-100 overflow-y-auto">
            {latest.map((n) => {
              const I = NOTIF_ICON[n.type];
              const unread = !readIds.has(n.id);
              return (
                <li key={n.id}>
                  <Link
                    href={`/shipments/${n.shipmentId}`}
                    onClick={() => {
                      markRead([n.id]);
                      setOpen(false);
                    }}
                    className={cx("flex gap-3 px-4 py-3 transition hover:bg-slate-50", unread && "bg-blue-50/40")}
                  >
                    <span className={cx("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full", NOTIF_TONE[n.severity])}>
                      <I className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cx("truncate text-sm", unread ? "font-semibold text-slate-900" : "font-medium text-slate-700")}>{n.title}</span>
                        <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(n.at)}</span>
                      </div>
                      <p className="line-clamp-2 text-xs text-slate-500">{n.body}</p>
                    </div>
                    {unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/notifications" onClick={() => setOpen(false)} className="block border-t border-slate-100 py-2.5 text-center text-xs font-semibold text-blue-600 hover:bg-slate-50">
            {t("view_all")}
          </Link>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { t, profile, signOut } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const initials = `${profile.firstName[0] ?? ""}${profile.lastName.split(" ").pop()?.[0] ?? ""}`.toUpperCase();
  const item = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50";
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 hover:bg-slate-100" aria-label="Account">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">{initials}</span>
        <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-200" onClick={() => setOpen(false)}>
          <div className="px-3 py-2">
            <div className="text-sm font-semibold text-slate-900">
              {profile.firstName} {profile.lastName}
            </div>
            <div className="truncate text-xs text-slate-500">{profile.email}</div>
            <div className="mt-1 truncate text-[11px] font-medium text-blue-600">{profile.company}</div>
          </div>
          <div className="my-1 h-px bg-slate-100" />
          <Link href="/profile" className={item}>
            <CircleUserRound className="h-4 w-4 text-slate-400" /> {t("nav_profile")}
          </Link>
          <Link href="/profile/edit" className={item}>
            <Pencil className="h-4 w-4 text-slate-400" /> {t("edit_profile")}
          </Link>
          <Link href="/track" className={item}>
            <ExternalLink className="h-4 w-4 text-slate-400" /> {t("public_tracking")}
          </Link>
          <Link href="/" className={item}>
            <Home className="h-4 w-4 text-slate-400" /> Airflo website
          </Link>
          <div className="my-1 h-px bg-slate-100" />
          <button
            onClick={() => {
              signOut();
              // Full navigation so the session guard doesn't race the redirect.
              window.location.assign("/login/?signedout=1");
            }}
            className={cx(item, "w-full")}
          >
            <LogOut className="h-4 w-4 text-slate-400" /> {t("sign_out")}
          </button>
        </div>
      )}
    </div>
  );
}

function PortalHeader() {
  const { t, lang, setLang } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [miss, setMiss] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 xl:flex">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cx(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive(href) ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {t(label)}
            </Link>
          ))}
        </nav>

        <form
          className="ml-auto hidden w-full max-w-xs items-center lg:flex"
          onSubmit={(e) => {
            e.preventDefault();
            const s = findShipment(q);
            if (s) {
              setMiss(false);
              setQ("");
              router.push(`/shipments/${s.id}`);
            } else setMiss(true);
          }}
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setMiss(false);
              }}
              placeholder={t("search_placeholder")}
              className={cx(
                "h-10 w-full rounded-xl border-0 bg-slate-100 pl-9 pr-20 text-sm text-slate-900 outline-none ring-1 transition placeholder:text-slate-400 focus:bg-white",
                miss ? "ring-rose-400" : "ring-transparent focus:ring-blue-500",
              )}
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">{t("track")}</button>
            {miss && <div className="absolute left-0 top-11 rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-700 ring-1 ring-rose-100">No shipment found for “{q}”</div>}
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            title="Language"
          >
            <Globe className="h-4 w-4" /> {lang.toUpperCase()}
          </button>
          <BellMenu />
          <UserMenu />
        </div>
      </div>

      {/* Compact nav for tablet / mobile */}
      <nav className="scroll-thin flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 xl:hidden">
        {NAV.map(({ href, label, icon: I }) => (
          <Link
            key={href}
            href={href}
            className={cx(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold",
              isActive(href) ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
            )}
          >
            <I className="h-3.5 w-3.5" /> {t(label)}
          </Link>
        ))}
      </nav>
    </header>
  );
}

const MARKETING_NAV = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/track", label: "Track a shipment" },
];

function PublicHeader() {
  const { session, ready } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo sub="Cargo visibility" href="/" />
        <nav className="hidden items-center gap-1 md:flex">
          {MARKETING_NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {ready && session ? (
            <Link href="/dashboard" className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700">
              Go to my portal
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:block">
                Log in
              </Link>
              <Link href="/request-access" className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                Request access
              </Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="grid h-9 w-9 place-items-center rounded-lg ring-1 ring-slate-200 md:hidden" aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-slate-100 px-4 py-2 md:hidden" onClick={() => setOpen(false)}>
          {[...MARKETING_NAV, { href: "/login", label: "Log in" }].map((n) => (
            <Link key={n.href} href={n.href} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const { t } = useStore();
  return (
    <footer className="mx-auto mt-6 flex w-full max-w-[1440px] flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
      <span>© 2026 Airflo · Air freight forwarding</span>
      <span className="inline-flex items-center gap-1.5">
        <Headphones className="h-3.5 w-3.5" /> {t("contact")}: export@airflo.example · +31 20 000 0000
      </span>
    </footer>
  );
}

const PUBLIC_ROUTES = ["/", "/track"];
const AUTH_ROUTES = ["/login", "/forgot-password", "/request-access"];

function Shell({ children }: { children: React.ReactNode }) {
  const raw = usePathname();
  const pathname = raw.length > 1 ? raw.replace(/\/$/, "") : raw;
  const router = useRouter();
  const { ready, session } = useStore();
  const isAuth = AUTH_ROUTES.includes(pathname);
  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isPortal = !isAuth && !isPublic;

  useEffect(() => {
    if (isPortal && ready && !session) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isPortal, ready, session, pathname, router]);

  if (isAuth) return <>{children}</>;

  if (isPortal && (!ready || !session)) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your session…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {isPublic ? <PublicHeader /> : <PortalHeader />}
      <div className="flex-1">{children}</div>
      {isPublic ? <MarketingFooter /> : <Footer />}
    </div>
  );
}

function MarketingFooter() {
  const cols = [
    { h: "Product", l: [["Features", "/#features"], ["How it works", "/#how-it-works"], ["Track a shipment", "/track"], ["Customer login", "/login"]] },
    { h: "Company", l: [["About Airflo", "/#"], ["Destinations", "/#destinations"], ["Careers", "/#"], ["Contact", "mailto:export@airflo.example"]] },
    { h: "Support", l: [["FAQ", "/#faq"], ["Request access", "/request-access"], ["Forgot password", "/forgot-password"], ["Export desk 24/7", "tel:+31200000000"]] },
  ];
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo sub="Cargo visibility" href="/" />
          <p className="mt-4 max-w-xs text-sm text-slate-500">Air freight forwarding from Amsterdam to the world — with real-time visibility on every shipment.</p>
          <p className="mt-4 text-xs text-slate-400">Schiphol Cargo · Amsterdam, Netherlands</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-900">{c.h}</div>
            <ul className="mt-3 space-y-2">
              {c.l.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-slate-500 hover:text-slate-900">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:px-6">
          <span>© 2026 Airflo B.V. · All rights reserved</span>
          <span className="flex gap-4">
            <Link href="/#">Privacy</Link>
            <Link href="/#">Terms</Link>
            <Link href="/#">Cookies</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Shell>{children}</Shell>
    </StoreProvider>
  );
}

/* Small shared page header used by inner pages */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export const PAGE = "mx-auto max-w-[1440px] px-4 pb-10 pt-6 sm:px-6 lg:px-8";
