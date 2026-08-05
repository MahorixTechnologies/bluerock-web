"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useWebAuth } from "@/providers/WebAuthProvider";

import type { UserRole } from "@/types/models";

function initialsFor(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "??";
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

type NavItemDef = { href: string; label: string; glyph: string };

const renterMainNav: NavItemDef[] = [
  { href: "/", label: "Home", glyph: "⌂" },
  { href: "/search", label: "Search", glyph: "⌕" },
  { href: "/bookings", label: "Bookings", glyph: "☰" },
];

const landlordMainNav: NavItemDef[] = [
  { href: "/", label: "Dashboard", glyph: "◈" },
  { href: "/host/listings", label: "My Listings", glyph: "🏢" },
  { href: "/host/bookings", label: "Guest Bookings", glyph: "👥" },
  { href: "/host/payouts", label: "Payouts", glyph: "💰" },
];

const publicMainNav: NavItemDef[] = [
  { href: "/", label: "Home", glyph: "⌂" },
  { href: "/search", label: "Search", glyph: "⌕" },
];

const hostNavLabel: Record<NonNullable<UserRole> | "PUBLIC", string> = {
  RENTER: "Renter",
  LANDLORD: "Host",
  ADMIN: "Admin",
  PUBLIC: "Browse",
};

function navForRole(role: UserRole | null): NavItemDef[] {
  if (role === "LANDLORD") return landlordMainNav;
  if (role === "RENTER" || role === "ADMIN") return renterMainNav;
  return publicMainNav;
}

const otherNav: NavItemDef[] = [
  { href: "/register", label: "Register", glyph: "+" },
];

const signedOutAccountNav: NavItemDef[] = [
  { href: "/login", label: "Login", glyph: "→" },
  { href: "/register", label: "Register", glyph: "+" },
];

const signedInAccountNav: NavItemDef[] = [
  { href: "/account", label: "Account", glyph: "◉" },
  { href: "/account/security", label: "Security", glyph: "🔒" },
  { href: "/bookings", label: "Bookings", glyph: "📅" },
];

function NavItem({
  item,
  active,
}: {
  item: NavItemDef;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-[#1442C4] text-white shadow-inner"
          : "text-white/80 hover:bg-[#0F37A8]/70 hover:text-white"
      }`}
    >
      {active ? (
        <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-[#7CA8FF]" />
      ) : null}
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base transition ${
          active
            ? "bg-[#7CA8FF]/15 text-[#7CA8FF]"
            : "bg-white/8 text-white/70 group-hover:bg-white/12 group-hover:text-white"
        }`}
      >
        {item.glyph}
      </span>
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function NavSection({
  title,
  items,
  activeFn,
  badge,
}: {
  title?: string;
  items: NavItemDef[];
  activeFn: (href: string) => boolean;
  badge?: { label: string; value: string | number };
}) {
  return (
    <div>
      {title ? (
        <p className="px-3 pb-2 pt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
          {title}
        </p>
      ) : null}
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.href} className="relative">
            <NavItem item={item} active={activeFn(item.href)} />
            {badge && item.label === badge.label ? (
              <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-[#ef4444] px-2 py-0.5 text-[10px] font-bold text-white">
                {badge.value}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppShell({
  children,
  heading,
  subheading,
}: {
  children: ReactNode;
  heading?: string;
  subheading?: string;
}) {
  const pathname = usePathname();
  const { profile, status, logout } = useWebAuth();

  const role = status === "signedIn" ? profile?.role ?? null : null;
  const mainNav = navForRole(role);
  const navLabel = hostNavLabel[status === "signedIn" ? (profile?.role ?? "ADMIN") : "PUBLIC"];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 p-4 lg:p-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-48px)] shrink-0 overflow-hidden rounded-3xl bg-[#0A2A8C] shadow-[0_20px_60px_rgba(10,42,140,0.35)] lg:flex lg:w-[272px] lg:flex-col">
          <div className="flex flex-1 flex-col overflow-y-auto p-5">
            <div className="flex items-center gap-3 px-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7CA8FF]/15 text-xl font-black text-[#7CA8FF]">
                ◈
              </span>
              <div>
                <p className="text-lg font-black tracking-tight text-white">BlueRock</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">
                  Rental Platform
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/8 px-3 py-3 text-white/70 transition hover:bg-white/12">
              <span className="text-base">⌕</span>
              <div className="flex flex-1 items-center justify-between">
                <span className="text-sm font-medium">Search</span>
                <span className="flex items-center gap-0.5 rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] font-bold text-white/60">
                  ⌘F
                </span>
              </div>
            </div>

            <NavSection title={`${navLabel} Menu`} items={mainNav} activeFn={isActive} />
            {status !== "signedIn" ? (
              <NavSection title="Other" items={otherNav} activeFn={isActive} />
            ) : null}
            <NavSection
              title="Account"
              items={status === "signedIn" ? signedInAccountNav : signedOutAccountNav}
              activeFn={isActive}
            />
          </div>

          <div className="border-t border-white/8 p-4">
            {status === "signedIn" && profile ? (
              <div>
                <div className="rounded-2xl bg-white/6 p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7CA8FF]/20 text-xs font-black text-[#7CA8FF]">
                      {profile.name.trim()
                        ? profile.name
                            .trim()
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()
                        : profile.email.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">
                        {profile.name || profile.email}
                      </p>
                      <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
                        {profile.role}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Logout"
                      onClick={() => void logout()}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      ↪
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white/6 p-4">
                <p className="text-sm font-bold text-white">Ready to continue?</p>
                <p className="mt-1 text-xs leading-5 text-white/60">
                  Sign in with demo accounts for full access.
                </p>
                <Link
                  href="/login"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#1E5BFF] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[#1849D6]"
                >
                  Open Login
                </Link>
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="sticky top-6 z-20 flex items-center justify-between gap-4 rounded-3xl border border-[var(--border)] bg-white/80 px-5 py-4 backdrop-blur-md shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0A2A8C]/8 text-[#0A2A8C] transition hover:bg-[#0A2A8C]/12 lg:hidden"
              >
                ←
              </Link>
              <div>
                <h1 className="text-[20px] font-black tracking-tight text-[#111827]">
                  {heading || "Dashboard"}
                </h1>
                {subheading ? (
                  <p className="mt-0.5 text-sm text-[#6b7280]">{subheading}</p>
                ) : status === "signedIn" && profile ? (
                  <p className="mt-0.5 text-sm text-[#6b7280]">
                    Welcome back{" "}
                    {profile.name
                      ? profile.name.split(" ")[0]
                      : profile.email.split("@")[0]}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                {status === "signedIn" && profile ? (
                  <>
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow"
                          style={{
                            background:
                              i === 1
                                ? "linear-gradient(135deg,#f97316,#ea580c)"
                                : i === 2
                                ? "linear-gradient(135deg,#8b5cf6,#6366f1)"
                                : "linear-gradient(135deg,#06b6d4,#0891b2)",
                          }}
                        >
                          {String.fromCharCode(64 + i)}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      aria-label="Add"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[#6b7280] transition hover:bg-[var(--panel-soft)]"
                    >
                      +
                    </button>
                  </>
                ) : null}
              </div>
              <div className="h-8 w-px bg-[var(--border)] hidden sm:block" />
              <button
                type="button"
                aria-label="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[#6b7280] transition hover:bg-[var(--panel-soft)]"
              >
                ⏰
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ef4444]" />
              </button>
              {status === "signedIn" && profile ? (
                <Link
                  href="/account"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white pl-1 pr-3.5 py-1 transition hover:bg-[var(--panel-soft)]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#16a34a] to-[#0d4f3b] text-[11px] font-black text-white">
                    {initialsFor(profile.name || profile.email)}
                  </span>
                  <span className="text-sm font-semibold text-[#111827]">
                    {profile.name || profile.email}
                  </span>
                </Link>
              ) : null}
              <button
                type="button"
                aria-label="Export"
                className="hidden items-center gap-2 rounded-xl bg-[#0A2A8C] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(10,42,140,0.25)] transition hover:bg-[#07206E] sm:inline-flex"
              >
                Export <span className="text-[#7CA8FF]">⤓</span>
              </button>
            </div>
          </header>

          <div className="flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}
