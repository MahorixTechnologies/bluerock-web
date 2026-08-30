"use client";

import { getBookingStatusMeta } from "@/constants/booking-status";
import type { OwnerBooking } from "@/types/models";
import { formatMoney, initialsFor } from "@/utils";

type HostBookingQueueProps = {
  bookings: OwnerBooking[];
  loading: boolean;
  onDecide: (id: string, decision: "ACCEPT" | "REJECT") => Promise<void>;
  busyId: string | null;
  filter: string;
  setFilter: (f: string) => void;
  filterCounts: Record<string, number>;
};

function Row({
  booking,
  onDecide,
  busy,
}: {
  booking: OwnerBooking;
  onDecide: (id: string, decision: "ACCEPT" | "REJECT") => Promise<void>;
  busy: boolean;
}) {
  const guestName = booking.renter.name || booking.renter.email;
  const st = getBookingStatusMeta(booking.status);
  return (
    <div className="grid grid-cols-[1.2fr_1.4fr_1.1fr_0.6fr_0.7fr_1fr_0.9fr_0.9fr] items-center gap-4 border-b border-[var(--border)] px-4 py-4 last:border-b-0 sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white shadow-[0_4px_12px_rgba(30,91,255,0.22)]"
          style={{ background: "linear-gradient(135deg,var(--primary),#7CA8FF)" }}
        >
          {initialsFor(guestName)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--text)]">{guestName}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
            {booking.renter.email} · {booking.id.slice(0, 8)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--text)]">
          {booking.listing.title}
        </p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-2)]">
          Check-in → Check-out
        </p>
        <p className="mt-1 text-sm font-bold tabular-nums text-[var(--text)]">
          {booking.startDate}{" "}
          <span className="mx-1 text-[var(--primary)]">→</span> {booking.endDate}
        </p>
      </div>
      <p className="text-sm font-black tabular-nums text-[var(--primary)]">
        {booking.nights}N
      </p>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase whitespace-nowrap ${st.badgeClass}`}
      >
        {st.label}
      </span>
      <p className="text-sm font-black tabular-nums text-[var(--text)]">
        {formatMoney(booking.total, booking.listing.currency)}
        <span className="ml-1 text-[10px] font-bold text-[var(--muted-2)]">
          {booking.paymentStatus}
        </span>
      </p>
      <p className="truncate text-xs font-semibold text-[var(--muted)]">
        {booking.renter.phone || "—"}
      </p>
      <div className="flex items-center justify-end gap-2">
        {booking.status === "PENDING" ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecide(booking.id, "ACCEPT")}
              className="h-9 rounded-lg bg-[var(--primary-soft)] px-3 text-xs font-bold text-[var(--primary)] transition hover:brightness-95 disabled:opacity-60"
            >
              {busy ? "…" : "Approve"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecide(booking.id, "REJECT")}
              className="h-9 rounded-lg bg-[var(--danger-soft)] px-3 text-xs font-bold text-[var(--danger)] transition hover:brightness-95 disabled:opacity-60"
            >
              {busy ? "…" : "Reject"}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function HostBookingQueue({
  bookings,
  loading,
  onDecide,
  busyId,
  filter,
  setFilter,
  filterCounts,
}: HostBookingQueueProps) {
  const visible = bookings.filter((b) => {
    if (filter === "All") return true;
    return b.status === filter.toUpperCase();
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {Object.keys(filterCounts).map((tab) => {
            const active = tab === filter;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  active
                    ? "bg-[var(--primary)] text-white shadow-[0_6px_16px_rgba(30,91,255,0.32)]"
                    : "border border-[var(--border)] bg-white text-[#374151] hover:bg-[var(--panel-soft)]"
                }`}
              >
                {tab}
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                    active
                      ? "bg-white/15 text-white"
                      : "bg-[var(--panel-soft)] text-[var(--muted)]"
                  }`}
                >
                  {filterCounts[tab]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            <div className="grid grid-cols-[1.2fr_1.4fr_1.1fr_0.6fr_0.7fr_1fr_0.9fr_0.9fr] items-center gap-4 border-b border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 sm:px-6">
              {["Guest", "Property", "Stay", "Nts", "Status", "Payout", "Contact", "Actions"].map(
                (header) => (
                  <p
                    key={header}
                    className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]"
                  >
                    {header}
                  </p>
                ),
              )}
            </div>
            {loading && !bookings.length ? (
              <div className="px-6 py-10 text-sm font-semibold text-[var(--muted)]">
                Loading guest bookings…
              </div>
            ) : visible.length ? (
              visible.map((booking) => (
                <Row
                  key={booking.id}
                  booking={booking}
                  onDecide={onDecide}
                  busy={busyId === booking.id}
                />
              ))
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl text-[var(--primary)]">
                  📭
                </p>
                <h3 className="mt-4 text-[18px] font-black tracking-tight text-[var(--text)]">
                  No {filter.toLowerCase()} bookings
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  New guest requests will appear here once renters book your properties.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
