"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardRouter } from "@/components/feature/home/DashboardRouter";
import {
  EmptyBookingsState,
  HostBookingQueue,
} from "@/components/feature/booking";
import { useWebAuth } from "@/providers/WebAuthProvider";
import { decideOwnerBooking, fetchOwnerBookings } from "@/api/bookings";
import type { OwnerBooking } from "@/types/models";
import { formatMoney } from "@/utils";

type FilterKey = "All" | "Confirmed" | "Pending" | "Completed" | "Cancelled" | "Rejected";

function Tile({ label, value, tint, icon }: { label: string; value: string; tint: string; icon: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">{label}</p>
          <p className="mt-2 text-[24px] font-black tracking-tight text-[#111827]">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl text-base" style={{ background: `color-mix(in srgb, ${tint} 12%, transparent)`, color: tint }}>{icon}</span>
      </div>
    </div>
  );
}

export function HostBookingsPage() {
  const { accessToken } = useWebAuth();
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("All");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBookings(await fetchOwnerBookings(accessToken));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
    const pending = bookings.filter((b) => b.status === "PENDING").length;
    const completed = bookings.filter((b) => b.status === "COMPLETED").length;
    const rejected = bookings.filter((b) => b.status === "REJECTED").length;
    const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;
    const revenue = bookings
      .filter((b) => b.status === "COMPLETED" || b.status === "CONFIRMED")
      .reduce((s, b) => s + b.total, 0);
    const currency = bookings.find((b) => b.status === "COMPLETED" || b.status === "CONFIRMED")
      ?.listing.currency ?? "USD";
    return { total, confirmed, pending, completed, rejected, cancelled, revenue, currency };
  }, [bookings]);

  const filterCounts: Record<FilterKey, number> = {
    All: bookings.length,
    Confirmed: summary.confirmed,
    Pending: summary.pending,
    Completed: summary.completed,
    Cancelled: summary.cancelled,
    Rejected: summary.rejected,
  };

  async function handleDecide(id: string, decision: "ACCEPT" | "REJECT") {
    setBusyId(id);
    try {
      const updated = await decideOwnerBooking({ accessToken, bookingId: id, decision });
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b;
          if (updated) return updated;
          return {
            ...b,
            status: decision === "ACCEPT" ? "CONFIRMED" : "REJECTED",
          };
        }),
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppShell heading="Guest Bookings" subheading="Approve stays and track check-ins across your listings">
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <Tile label="Total Bookings" value={String(summary.total)} tint="#1E5BFF" icon="📋" />
          <Tile label="Upcoming" value={String(summary.confirmed + summary.pending)} tint="#1E5BFF" icon="📅" />
          <Tile label="Pending Approval" value={String(summary.pending)} tint="#ca8a04" icon="⏱" />
          <Tile label="Completed" value={String(summary.completed)} tint="#10b981" icon="✓" />
          <Tile label="Payout Earning" value={formatMoney(summary.revenue, summary.currency)} tint="#1E5BFF" icon="💵" />
        </section>

        {!bookings.length && !loading ? (
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
            <EmptyBookingsState mode="landlord" />
          </div>
        ) : (
          <HostBookingQueue
            bookings={bookings}
            loading={loading}
            filter={filter}
            setFilter={(f) => setFilter(f as FilterKey)}
            filterCounts={filterCounts}
            busyId={busyId}
            onDecide={handleDecide}
          />
        )}
      </div>
    </AppShell>
  );
}

function RenterRedirect() {
  return (
    <AppShell heading="Guest Bookings" subheading="This section is for hosts only">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <p className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(30,91,255,0.12)] text-2xl text-[#1E5BFF]">📅</p>
        <h2 className="mt-4 text-[22px] font-black tracking-tight text-[#111827]">Looking for your own reservations?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6b7280]">As a guest you can view upcoming and past trips on the Bookings page.</p>
        <Link href="/bookings" className="mt-5 inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-[#1E5BFF] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[#1849D6]">Open My Bookings →</Link>
      </div>
    </AppShell>
  );
}

export default function HostBookingsRoute() {
  return (
    <DashboardRouter
      landlord={<HostBookingsPage />}
      renter={<RenterRedirect />}
      public={<RenterRedirect />}
    />
  );
}
