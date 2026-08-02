"use client";

import { getBookingStatusMeta } from "@/lib/booking-status";
import type { OwnerBooking } from "@/lib/models";
import { formatMoney, initialsFor } from "@/lib/utils";

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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white shadow-[0_4px_12px_rgba(16,185,129,0.22)]"
          style={{ background: "linear-gradient(135deg,#10b981,#34d399)" }}
        >
          {initialsFor(guestName)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#111827]">{guestName}</p>
          <p className="mt-0.5 truncate text-xs text-[#6b7280]">
            {booking.renter.email} · {booking.id.slice(0, 8)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <p className="truncate text-sm font-semibold text-[#111827]">
          {booking.listing.title}
        </p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9ca3af]">
          Check-in → Check-out
        </p>
        <p className="mt-1 text-sm font-bold tabular-nums text-[#111827]">
          {booking.startDate}{" "}
          <span className="mx-1 text-[rgba(16,185,129,1)]">→</span> {booking.endDate}
        </p>
      </div>
      <p className="text-sm font-black tabular-nums text-[rgba(16,185,129,1)]">
        {booking.nights}N
      </p>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase whitespace-nowrap ${st.badgeClass}`}
      >
        {st.label}
      </span>
      <p className="text-sm font-black tabular-nums text-[#111827]">
        {formatMoney(booking.total, booking.listing.currency)}
        <span className="ml-1 text-[10px] font-bold text-[#9ca3af]">
          {booking.paymentStatus}
        </span>
      </p>
      <p className="truncate text-xs font-semibold text-[#6b7280]">
        {booking.renter.phone || "—"}
      </p>
      <div className="flex items-center justify-end gap-2">
        {booking.status === "PENDING" ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecide(booking.id, "ACCEPT")}
              className="h-9 rounded-lg bg-[rgba(16,185,129,0.12)] px-3 text-xs font-bold text-[#10b981] transition hover:brightness-95 disabled:opacity-60"
            >
              {busy ? "…" : "Approve"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecide(booking.id, "REJECT")}
              className="h-9 rounded-lg bg-[rgba(239,68,68,0.12)] px-3 text-xs font-bold text-[#ef4444] transition hover:brightness-95 disabled:opacity-60"
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
                    ? "bg-[rgba(16,185,129,1)] text-white shadow-[0_6px_16px_rgba(16,185,129,0.32)]"
                    : "border border-[var(--border)] bg-white text-[#374151] hover:bg-[var(--panel-soft)]"
                }`}
              >
                {tab}
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                    active
                      ? "bg-white/15 text-white"
                      : "bg-[var(--panel-soft)] text-[#6b7280]"
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
        <div className="grid grid-cols-[1.2fr_1.4fr_1.1fr_0.6fr_0.7fr_1fr_0.9fr_0.9fr] items-center gap-4 border-b border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 sm:px-6">
          {["Guest", "Property", "Stay", "Nts", "Status", "Payout", "Contact", "Actions"].map(
            (header) => (
              <p
                key={header}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b7280]"
              >
                {header}
              </p>
            ),
          )}
        </div>
        {loading && !bookings.length ? (
          <div className="px-6 py-10 text-sm font-semibold text-[#6b7280]">
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
            <p className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(16,185,129,0.12)] text-xl text-[#10b981]">
              📭
            </p>
            <h3 className="mt-4 text-[18px] font-black tracking-tight text-[#111827]">
              No {filter.toLowerCase()} bookings
            </h3>
            <p className="mt-2 text-sm text-[#6b7280]">
              New guest requests will appear here once renters book your properties.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
