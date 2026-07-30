"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useWebAuth } from "./WebAuthProvider";

const navItems = [
  { href: "/", label: "Home", glyph: "⌂" },
  { href: "/search", label: "Search", glyph: "⌕" },
  { href: "/bookings", label: "Bookings", glyph: "☰" },
  { href: "/register", label: "Register", glyph: "+" },
  { href: "/login", label: "Login", glyph: "→" },
];

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

  return (
    <main className="min-h-screen bg-[#f6f6f7] text-[#2d3348]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-[#e3e7f2] bg-[#eef1fb] p-5 shadow-[0_16px_44px_rgba(31,41,55,0.08)]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2b5df3] text-sm font-bold text-white shadow-[0_12px_24px_rgba(43,93,243,0.26)]">
                BR
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8d96aa]">
                  BlueRock Web
                </p>
                <p className="text-lg font-extrabold text-[#0f2b71]">
                  Rental discovery platform
                </p>
              </div>
            </div>

            <nav className="mt-6 space-y-2">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-[18px] border px-4 py-3 text-sm font-bold transition ${
                      isActive
                        ? "border-[#b8c6f6] bg-white text-[#2b5df3] shadow-[0_10px_22px_rgba(43,93,243,0.12)]"
                        : "border-transparent bg-transparent text-[#556176] hover:border-[#d9dff0] hover:bg-white/80"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl text-base ${
                        isActive
                          ? "bg-[#ebf1ff] text-[#2b5df3]"
                          : "bg-white/75 text-[#7a8398]"
                      }`}
                    >
                      {item.glyph}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {status === "signedIn" && profile ? (
              <div className="mt-6 rounded-[22px] border border-[#d9dff0] bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ebf1ff] text-xs font-extrabold text-[#2b5df3]">
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
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-[#0f2b71]">
                      {profile.name || profile.email}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8d96aa]">
                      {profile.role}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="mt-4 w-full rounded-full border border-[#d9dff0] bg-[#f7f8fc] px-4 py-3 text-xs font-bold text-[#4e576b]"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-6 rounded-[22px] border border-[#d9dff0] bg-white p-4">
                <p className="text-sm font-extrabold text-[#0f2b71]">Ready to continue?</p>
                <p className="mt-1 text-sm text-[#667089]">
                  Sign in with the same mobile demo accounts.
                </p>
                <Link
                  href="/login"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#2b5df3] px-4 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(43,93,243,0.18)]"
                >
                  Open Login
                </Link>
              </div>
            )}
          </aside>

          <div className="min-w-0">
            {(heading || subheading) ? (
              <section className="rounded-[28px] border border-[#e3e7f2] bg-white px-6 py-7 shadow-[0_16px_40px_rgba(31,41,55,0.05)]">
                {heading ? (
                  <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#0f2b71]">
                    {heading}
                  </h1>
                ) : null}
                {subheading ? (
                  <p className="mt-2 max-w-2xl text-[15px] text-[#667089]">{subheading}</p>
                ) : null}
              </section>
            ) : null}

            <div className={heading || subheading ? "mt-6" : ""}>{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
