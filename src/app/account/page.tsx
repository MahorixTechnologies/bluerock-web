"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardRouter } from "@/components/feature/home/DashboardRouter";
import { useWebAuth } from "@/providers/WebAuthProvider";
import { BookingStatusBadge } from "@/components/feature/booking/BookingStatusBadge";
import { fetchMyBookings } from "@/api/bookings";
import { updateMe, fetchMe } from "@/api/users";
import type { WebBooking, WebUserProfile } from "@/types/models";
import { formatBookingDatesCompact } from "@/constants/booking-status";
import { formatMoney, initialsFor } from "@/utils";

function RolePill({ role }: { role: WebUserProfile["role"] }) {
  const map = {
    RENTER: { label: "Guest", className: "bg-[rgba(22,163,74,0.12)] text-[#16a34a]" },
    LANDLORD: { label: "Host", className: "bg-[rgba(22,163,74,0.12)] text-[#16a34a]" },
    ADMIN: { label: "Admin", className: "bg-[rgba(22,163,74,0.12)] text-[#16a34a]" },
  };
  const meta = map[role];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(22,163,74,0.12)] px-3 py-1.5 text-[11px] font-bold text-[#16a34a]">
        ✅ Email verified
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(234,179,8,0.12)] px-3 py-1.5 text-[11px] font-bold text-[#ca8a04]">
        ⚠ Not verified yet
      </span>
      <button
        type="button"
        className="inline-flex items-center rounded-full border border-[#ca8a04]/30 bg-[rgba(234,179,8,0.08)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ca8a04] transition hover:bg-[rgba(234,179,8,0.16)]"
      >
        Resend
      </button>
    </div>
  );
}

function SidebarMenuItem({
  glyph,
  label,
  href,
  active,
  onClick,
}: {
  glyph: string;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base transition ${
          active
            ? "bg-[#16a34a]/15 text-[#16a34a]"
            : "bg-[#111827]/5 text-[#6b7280]"
        }`}
      >
        {glyph}
      </span>
      <span className="truncate">{label}</span>
    </>
  );

  const baseClasses = `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
    active
      ? "bg-[rgba(22,163,74,0.10)] text-[#16a34a]"
      : "text-[#4b5563] hover:bg-[#111827]/5 hover:text-[#111827]"
  }`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`w-full text-left ${baseClasses}`}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href ?? "#"} className={baseClasses}>
      {content}
    </Link>
  );
}

function ProfilePage() {
  const router = useRouter();
  const { profile, accessToken, logout, refreshUserProfile, status } = useWebAuth();
  const [loadedProfile, setLoadedProfile] = useState<WebUserProfile | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [bookings, setBookings] = useState<WebBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const effectiveProfile = loadedProfile ?? profile;
  const role = effectiveProfile?.role ?? "RENTER";
  const isLandlord = role === "LANDLORD";

  useEffect(() => {
    if (status !== "signedIn" || !accessToken) return;
    void (async () => {
      const fresh = await fetchMe(accessToken);
      if (fresh) {
        setLoadedProfile(fresh);
        refreshUserProfile(fresh);
      }
    })();
  }, [accessToken, status, refreshUserProfile]);

  useEffect(() => {
    if (effectiveProfile) {
      setDraftName(effectiveProfile.name ?? "");
      setDraftPhone(effectiveProfile.phone ?? "");
    }
  }, [effectiveProfile?.email]);

  useEffect(() => {
    if (status !== "signedIn" || !accessToken) return;
    setLoadingBookings(true);
    void (async () => {
      try {
        const result = await fetchMyBookings(accessToken);
        setBookings(result);
      } finally {
        setLoadingBookings(false);
      }
    })();
  }, [accessToken, status]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !effectiveProfile) return;
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateMe(accessToken, {
        name: draftName.trim() || undefined,
        phone: draftPhone.trim() || undefined,
      });
      if (!updated) {
        throw new Error("Failed to update profile. Please try again.");
      }
      setLoadedProfile(updated);
      refreshUserProfile({ name: updated.name, phone: updated.phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    await logout();
    router.push("/login");
  }

  const recentBookings = bookings.slice(0, 3);

  if (!effectiveProfile) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit rounded-3xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)]">
        <nav className="space-y-1">
          <SidebarMenuItem glyph="👤" label="Profile" href="/account" active />
          <SidebarMenuItem glyph="🔐" label="Security" href="/account/security" />
          <SidebarMenuItem glyph="☰" label="My Bookings" href="/bookings" />
          {isLandlord ? (
            <>
              <SidebarMenuItem glyph="🏢" label="My Listings" href="/host/listings" />
              <SidebarMenuItem glyph="👥" label="Guest Bookings" href="/host/bookings" />
            </>
          ) : null}
        </nav>
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <SidebarMenuItem
            glyph="↪"
            label="Sign out"
            onClick={() => void handleSignOut()}
          />
        </div>
      </aside>

      <div className="space-y-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between gap-4 p-6 pb-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#16a34a]">
                Profile info
              </p>
              <h2 className="mt-2 text-[22px] font-black tracking-tight text-[#111827]">
                Your profile
              </h2>
              <p className="mt-1 text-sm text-[#6b7280]">
                Manage the information shown on your bookings.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-6 pt-4">
            <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#0d4f3b] text-2xl font-black text-white shadow-md">
                  {initialsFor(effectiveProfile.name || effectiveProfile.email)}
                </div>
                <div className="mt-4 text-center lg:text-left">
                  <p className="font-black text-xl text-[#111827]">
                    {effectiveProfile.name || effectiveProfile.email.split("@")[0]}
                  </p>
                  <div className="mt-2">
                    <RolePill role={effectiveProfile.role} />
                  </div>
                  <div className="mt-3">
                    <VerifiedBadge verified={effectiveProfile.emailVerified} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {saved ? (
                  <div className="flex items-start gap-3 rounded-xl border border-[#16a34a]/20 bg-[rgba(22,163,74,0.10)] px-4 py-3 text-[#15803d]">
                    <span className="text-base">✓</span>
                    <span className="text-sm font-bold">Profile updated</span>
                  </div>
                ) : null}
                {error ? (
                  <div className="flex items-start gap-3 rounded-xl border border-[#ef4444]/15 bg-[#fef2f2] px-4 py-3 text-[#991b1b]">
                    <span className="text-base">⚠</span>
                    <span className="text-sm font-semibold">{error}</span>
                  </div>
                ) : null}

                <div>
                  <label className="block">
                    <span className="text-sm font-bold text-[#374151]">Name</span>
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Your full name"
                      className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 text-sm text-[#111827] outline-none transition-all duration-200 focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-bold text-[#374151]">Email</span>
                    <input
                      type="email"
                      value={effectiveProfile.email}
                      disabled
                      className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 text-sm text-[#6b7280] outline-none opacity-80"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-bold text-[#374151]">Phone</span>
                    <input
                      type="tel"
                      value={draftPhone}
                      onChange={(e) => setDraftPhone(e.target.value)}
                      placeholder="+1 555 123 4567"
                      className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 text-sm text-[#111827] outline-none transition-all duration-200 focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10"
                    />
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#16a34a] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(22,163,74,0.35)] transition hover:bg-[#15803d] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Saving…
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-4 p-6 pb-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9ca3af]">
                Bookings
              </p>
              <h2 className="mt-2 text-[20px] font-black tracking-tight text-[#111827]">
                Recent bookings
              </h2>
            </div>
            <Link
              href="/bookings"
              className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-[#16a34a] transition hover:bg-[rgba(22,163,74,0.08)]"
            >
              View all →
            </Link>
          </div>
          <div className="p-6 pt-1">
            {loadingBookings && !recentBookings.length ? (
              <p className="py-6 text-center text-sm font-semibold text-[#6b7280]">
                Loading bookings…
              </p>
            ) : recentBookings.length ? (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4 transition hover:border-[#16a34a]/30 hover:bg-[rgba(22,163,74,0.04)]"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                      {booking.image ? (
                        <img
                          src={booking.image}
                          alt={booking.listingTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#16a34a]/15 text-lg">
                          🏠
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-[#111827]">
                        {booking.listingTitle}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-[#6b7280]">
                        {formatBookingDatesCompact(booking.startDate, booking.endDate)}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="font-black text-[#111827]">
                        {formatMoney(booking.total, booking.currency)}
                      </p>
                    </div>
                    <div className="hidden shrink-0 md:block">
                      <BookingStatusBadge
                        status={booking.status}
                        paymentStatus={booking.paymentStatus}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel-soft)] p-8 text-center">
                <p className="text-sm font-semibold text-[#6b7280]">
                  No trips yet —{" "}
                  <Link
                    href="/search"
                    className="font-bold text-[#16a34a] transition hover:text-[#15803d]"
                  >
                    Browse stays →
                  </Link>
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
          <div className="p-6 pb-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9ca3af]">
              Account
            </p>
            <h2 className="mt-2 text-[20px] font-black tracking-tight text-[#111827]">
              Session &amp; Security
            </h2>
          </div>
          <div className="p-6 pt-0">
            <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)]">
              <div className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-bold text-[#374151]">Email status</p>
                  <p className="mt-0.5 text-xs text-[#6b7280]">{effectiveProfile.email}</p>
                </div>
                {effectiveProfile.emailVerified ? (
                  <span className="inline-flex items-center rounded-full bg-[rgba(22,163,74,0.12)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#16a34a]">
                    ✅ Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-[rgba(234,179,8,0.12)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#ca8a04]">
                    ⚠ Pending
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-bold text-[#374151]">Password</p>
                  <p className="mt-0.5 text-xs text-[#6b7280]">
                    Last changed{" "}
                    <span className="inline-flex items-center rounded-full bg-[#111827]/5 px-2 py-0.5 text-[10px] font-bold text-[#6b7280]">
                      unknown (demo)
                    </span>
                  </p>
                </div>
                <Link
                  href="/account/security"
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-[#16a34a] transition hover:bg-[rgba(22,163,74,0.08)]"
                >
                  Update →
                </Link>
              </div>

              <div className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-bold text-[#374151]">Signed-in session</p>
                  <p className="mt-0.5 text-xs text-[#6b7280]">
                    Joined{" "}
                    <span className="inline-flex items-center rounded-full bg-[#111827]/5 px-2 py-0.5 text-[10px] font-bold text-[#6b7280]">
                      Active session
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#ef4444]/25 bg-[#fef2f2] px-4 py-2 text-sm font-bold text-[#ef4444] transition hover:border-[#ef4444]/50 hover:bg-[#fee2e2]"
                >
                  ↪ Sign out
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PublicAccountState() {
  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-gradient-to-br from-[#EDF3FF] via-white to-[#F0F5FF] px-8 py-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#16a34a]/70">
            Account Center
          </p>
          <h2 className="mt-4 max-w-md text-[30px] font-black tracking-tight text-[#111827]">
            Log in to manage your profile
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#6b7280]">
            Sign in to view your bookings, update personal details, and manage security settings.
            Use the demo renter or landlord accounts from the mobile app to explore.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#16a34a] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(22,163,74,0.35)] transition hover:bg-[#15803d] hover:-translate-y-0.5"
          >
            Go to Login →
          </Link>
        </div>
        <div className="grid gap-4 bg-[var(--panel-soft)] p-8 sm:grid-cols-3 lg:grid-cols-1">
          {[
            {
              label: "Profile",
              value: "Edit & manage",
              icon: "👤",
              iconBg: "rgba(22,163,74,0.12)",
              iconColor: "#16a34a",
            },
            {
              label: "Bookings",
              value: "View stays",
              icon: "📅",
              iconBg: "rgba(99,102,241,0.12)",
              iconColor: "#6366f1",
            },
            {
              label: "Security",
              value: "Protected",
              icon: "🔐",
              iconBg: "rgba(234,179,8,0.12)",
              iconColor: "#d97706",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-[20px] font-black tracking-tight text-[#111827]">
                    {stat.value}
                  </p>
                </div>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-300 group-hover:scale-105"
                  style={{ background: stat.iconBg, color: stat.iconColor }}
                >
                  {stat.icon}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AccountPage() {
  return (
    <AppShell heading="Account" subheading="Manage your profile and booking settings">
      <DashboardRouter
        public={<PublicAccountState />}
        renter={<ProfilePage />}
        landlord={<ProfilePage />}
        admin={<ProfilePage />}
      />
    </AppShell>
  );
}
