"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PaymentIntentDialog } from "@/components/feature/payment/PaymentIntentDialog";
import { ReceiptDialog } from "@/components/feature/payment/ReceiptDialog";
import { useWebAuth } from "@/providers/WebAuthProvider";
import {
  BookingStatusBadge,
  EmptyBookingsState,
} from "@/components/feature/booking";
import { fetchMyBookings, getStoredBookings } from "@/api/bookings";
import type {
  BookingStatus,
  PaymentIntent,
  PaymentStatus,
  Receipt,
  WebBooking,
} from "@/types/models";
import {
  buildSyntheticReceipt,
  confirmPayment,
  createPaymentIntent,
  getReceiptForBooking,
  isRefundEligible,
  issueRefund,
} from "@/api/payments";
import { formatMoney } from "@/utils";

import { AppShell } from "@/components/layout/AppShell";

function formatDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function bookingStatusStyle(status: BookingStatus): {
  label: string;
  className: string;
} {
  const map: Record<BookingStatus, { label: string; className: string }> = {
    CONFIRMED: {
      label: "Confirmed",
      className: "bg-[rgba(22,163,74,0.12)] text-[#16a34a]",
    },
    COMPLETED: {
      label: "Completed",
      className: "bg-[rgba(107,114,128,0.12)] text-[#6b7280]",
    },
    PENDING: {
      label: "Pending",
      className: "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]",
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-[rgba(239,68,68,0.12)] text-[#ef4444]",
    },
    CANCELLED: {
      label: "Cancelled",
      className: "bg-[rgba(239,68,68,0.12)] text-[#ef4444]",
    },
  };
  return map[status];
}

function paymentStatusStyle(paymentStatus: PaymentStatus): {
  label: string;
  className: string;
} {
  const map: Record<PaymentStatus, { label: string; className: string }> = {
    UNPAID: {
      label: "Unpaid",
      className: "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]",
    },
    PAID: {
      label: "Paid",
      className: "bg-[rgba(22,163,74,0.12)] text-[#16a34a]",
    },
    REFUNDED: {
      label: "Refunded",
      className: "bg-[rgba(107,114,128,0.12)] text-[#6b7280]",
    },
  };
  return map[paymentStatus];
}

type MiniStat = {
  label: string;
  value: string;
  trend: number;
  direction: "up" | "down";
  delta: string;
  icon: string;
  iconBg: string;
  iconColor: string;
};

function MiniStatCard({ stat }: { stat: MiniStat }) {
  const badge =
    stat.direction === "up"
      ? "bg-[var(--trend-up-bg)] text-[var(--trend-up)]"
      : "bg-[var(--trend-down-bg)] text-[var(--trend-down)]";
  return (
    <div className="group rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">
            {stat.label}
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-[26px] font-black tracking-tight text-[#111827]">
              {stat.value}
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${badge}`}
            >
              {stat.direction === "up" ? "⦿" : "⊖"} {Math.abs(stat.trend)}%
            </span>
          </div>
        </div>
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-300 group-hover:scale-105"
          style={{ background: stat.iconBg, color: stat.iconColor }}
        >
          {stat.icon}
        </span>
      </div>
      <p className="mt-4 border-t border-[var(--border)] pt-3 text-xs font-semibold text-[#6b7280]">
        <span className={stat.direction === "up" ? "text-[#1E5BFF]" : "text-[#ec4899]"}>
          {stat.delta}
        </span>{" "}
        from last month
      </p>
    </div>
  );
}

type BookingCardProps = {
  booking: WebBooking;
  onPayNow: (booking: WebBooking) => void;
  paying: boolean;
  onViewReceipt: (booking: WebBooking) => void;
  onRequestRefund: (booking: WebBooking) => void;
  refunding: boolean;
};

function BookingCard({
  booking,
  onPayNow,
  paying,
  onViewReceipt,
  onRequestRefund,
  refunding,
}: BookingCardProps) {
  const needsPay =
    booking.paymentStatus === "UNPAID" &&
    booking.status !== "REJECTED" &&
    booking.status !== "CANCELLED";
  const refundEligible = isRefundEligible(booking);

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
    >
      <article>
        <div className="relative">
          <img
            src={booking.image}
            alt={booking.listingTitle}
            className="h-[220px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061525]/70 via-[#061525]/10 to-transparent" />
          <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-5">
            <BookingStatusBadge status={booking.status} paymentStatus={booking.paymentStatus} />
            <span className="rounded-full bg-[#0A2A8C] px-3.5 py-1.5 text-[11px] font-black text-white shadow-[0_6px_16px_rgba(10,42,140,0.35)]">
              {formatMoney(booking.total, booking.currency)}
            </span>
          </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
            Reserved Stay
          </p>
          <h2 className="mt-2 text-[22px] font-black tracking-tight leading-tight">
            {booking.listingTitle}
          </h2>
          <p className="mt-1 text-sm font-medium text-white/80">
            📍 {booking.location}
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
              Stay Window
            </p>
            <p className="mt-2 text-sm font-bold text-[#374151]">
              {formatDisplayDate(booking.startDate)}
            </p>
            <p className="text-sm text-[#6b7280]">
              → {formatDisplayDate(booking.endDate)}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
              Booking Value
            </p>
            <p className="mt-2 text-lg font-black tracking-tight text-[#111827]">
              {formatMoney(booking.total, booking.currency)}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#6b7280]">
              Fee:{" "}
              <span className="font-bold text-[#374151]">
                {formatMoney(booking.serviceFee, booking.currency)}
              </span>
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Subtotal",
              value: formatMoney(booking.subtotal, booking.currency),
            },
            {
              label: "Service Fee",
              value: formatMoney(booking.serviceFee, booking.currency),
            },
            {
              label: "Total",
              value: formatMoney(booking.total, booking.currency),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
                {item.label}
              </p>
              <p className="mt-1.5 text-sm font-black tabular-nums text-[#111827]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Nights", value: String(booking.nights) },
            {
              label: "Per Night",
              value: formatMoney(booking.pricePerNight, booking.currency),
            },
            { label: "Created", value: formatDisplayDate(booking.createdAt) },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-[var(--panel-soft)] px-4 py-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
                {item.label}
              </p>
              <p className="mt-1.5 text-sm font-black text-[#111827] tabular-nums">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <p className="text-xs font-semibold text-[#6b7280]">
            Booking ID:{" "}
            <span className="rounded-md bg-[var(--panel-soft)] px-2 py-1 font-mono font-black text-[#111827]">
              {booking.id}
            </span>
          </p>
          <div
            className="flex flex-wrap items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href={`/listing/${booking.listingId}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-xs font-bold text-[#1E5BFF] transition hover:border-[#1E5BFF]/40 hover:bg-[#1E5BFF]/5"
            >
              View Listing <span>→</span>
            </Link>
            {booking.paymentStatus === "PAID" ? (
              <Link
                href={`/bookings/${booking.id}/pay`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[rgba(16,185,129,0.12)] px-4 py-2 h-10 text-xs font-bold text-[#059669] transition hover:bg-[rgba(16,185,129,0.2)]"
              >
                ✓ Receipt
              </Link>
            ) : null}
            {needsPay ? (
              <Link
                href={`/bookings/${booking.id}/pay`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 h-10 text-white font-bold shadow-[0_6px_16px_rgba(5,150,105,0.32)] transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {paying ? "Processing..." : "Pay →"}
              </Link>
            ) : null}
            {refundEligible ? (
              <button
                type="button"
                disabled={refunding}
                onClick={() => onRequestRefund(booking)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#ef4444]/20 bg-[#fef2f2] px-4 py-2 text-xs font-bold text-[#ef4444] transition hover:bg-[#fee2e2] disabled:opacity-60"
              >
                {refunding ? "Processing..." : "↩ Request Refund"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
      </article>
    </Link>
  );
}

export function BookingsPage() {
  const { status, profile, accessToken } = useWebAuth();
  const [bookings, setBookings] = useState<WebBooking[]>([]);
  const [loading, setLoading] = useState(false);

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [payBooking, setPayBooking] = useState<WebBooking | null>(null);
  const [payIntent, setPayIntent] = useState<PaymentIntent | null>(null);

  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptBooking, setReceiptBooking] = useState<WebBooking | null>(null);
  const [receiptData, setReceiptData] = useState<Receipt | null>(null);

  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [refundConfirmOpen, setRefundConfirmOpen] = useState(false);
  const [refundBooking, setRefundBooking] = useState<WebBooking | null>(null);

  const loadBookings = useCallback(async () => {
    if (status !== "signedIn") return;
    setLoading(true);
    try {
      const remote = await fetchMyBookings(accessToken);
      if (remote && remote.length) {
        setBookings(remote);
        return;
      }
      const local = getStoredBookings();
      setBookings(local);
    } finally {
      setLoading(false);
    }
  }, [accessToken, status]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const totalPaid = bookings.reduce(
    (sum, booking) =>
      booking.paymentStatus === "PAID" ? sum + booking.total : sum,
    0,
  );
  const totalUnpaid = bookings.reduce(
    (sum, booking) =>
      booking.paymentStatus === "UNPAID" ? sum + booking.total : sum,
    0,
  );
  const totalSpent = totalPaid;
  const totalNights = bookings.reduce((sum, booking) => sum + booking.nights, 0);
  const upcomingCount = bookings.filter(
    (b) =>
      (b.status === "CONFIRMED" || b.status === "PENDING") &&
      b.endDate >= new Date().toISOString().slice(0, 10),
  ).length;
  const latestBooking = bookings[0] ?? null;
  const sharedCurrency = latestBooking?.currency ?? "NGN";

  if (status !== "signedIn") {
    return (
      <AppShell
        heading="Your bookings"
        subheading="Track your upcoming stays and travel activity"
      >
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="bg-gradient-to-br from-[#EDF3FF] via-white to-[#F0F5FF] px-8 py-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0A2A8C]/60">
                Booking Hub
              </p>
              <h2 className="mt-4 max-w-md text-[30px] font-black tracking-tight text-[#111827]">
                Log in to unlock your stays
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#6b7280]">
                Use the same renter or landlord demo accounts from the mobile app to view reservations,
                review totals, and continue your booking journey on web.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Live booking cards",
                  "Trip summaries",
                  "Cross-platform demo access",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#4b5563]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <Link
                href="/login"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0A2A8C] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(10,42,140,0.25)] transition hover:bg-[#07206E]"
              >
                Go to Login <span>→</span>
              </Link>
            </div>

            <div className="grid gap-4 bg-[var(--panel-soft)] p-8 sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  label: "Synced Access",
                  value: "Mobile + Web",
                  trend: 10.5,
                  direction: "up" as const,
                  delta: "+New",
                  icon: "\u21AA",
                  iconBg: "rgba(30,91,255,0.12)",
                  iconColor: "#1E5BFF",
                },
                {
                  label: "Demo-ready",
                  value: "3 accounts",
                  trend: 13.5,
                  direction: "up" as const,
                  delta: "+Ready",
                  icon: "\u{1F510}",
                  iconBg: "rgba(59,130,246,0.12)",
                  iconColor: "#3b82f6",
                },
                {
                  label: "Booking Flow",
                  value: "Live now",
                  trend: 25,
                  direction: "up" as const,
                  delta: "+Launched",
                  icon: "\u2728",
                  iconBg: "rgba(234,179,8,0.12)",
                  iconColor: "#d97706",
                },
              ].map((stat) => (
                <MiniStatCard key={stat.label} stat={stat} />
              ))}
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  const miniStats: MiniStat[] = [
    {
      label: "Upcoming",
      value: String(upcomingCount),
      trend: 10.5,
      direction: "up",
      delta: "+2",
      icon: "📅",
      iconBg: "rgba(30,91,255,0.12)",
      iconColor: "#1E5BFF",
    },
    {
      label: "Total Nights",
      value: String(totalNights),
      trend: 13.5,
      direction: "up",
      delta: "+4",
      icon: "🌙",
      iconBg: "rgba(99,102,241,0.12)",
      iconColor: "#6366f1",
    },
    {
      label: "Paid / Unpaid",
      value: `${formatMoney(totalPaid, sharedCurrency)} / ${formatMoney(totalUnpaid, sharedCurrency)}`,
      trend: 8.2,
      direction: "up",
      delta: `+${formatMoney(Math.round((totalPaid + totalUnpaid) * 0.08), sharedCurrency)}`,
      icon: "💳",
      iconBg: "rgba(16,185,129,0.12)",
      iconColor: "#10b981",
    },
  ];

  const upcomingBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status !== "COMPLETED" &&
          b.status !== "CANCELLED" &&
          b.status !== "REJECTED",
      ),
    [bookings],
  );
  const pastBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status === "COMPLETED" ||
          b.status === "CANCELLED" ||
          b.status === "REJECTED",
      ),
    [bookings],
  );
  const visibleBookings = [...upcomingBookings, ...pastBookings];

  function handlePayNow(booking: WebBooking) {
    const intent = createPaymentIntent(booking);
    setPayBooking(booking);
    setPayIntent(intent);
    setPaymentDialogOpen(true);
  }

  async function handleConfirmPayment() {
    if (!payIntent) return;
    setPaymentBusy(true);
    try {
      const { booking: updated } = confirmPayment(payIntent.id);
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b)),
      );
      setTimeout(() => {
        setPaymentDialogOpen(false);
        setPaymentBusy(false);
      }, 500);
    } catch {
      setPaymentBusy(false);
    }
  }

  function handleViewReceipt(booking: WebBooking) {
    const existing = getReceiptForBooking(booking.id);
    const receipt = existing ?? buildSyntheticReceipt(booking);
    setReceiptBooking(booking);
    setReceiptData(receipt);
    setReceiptDialogOpen(true);
  }

  function handleRequestRefund(booking: WebBooking) {
    setRefundBooking(booking);
    setRefundConfirmOpen(true);
  }

  async function handleConfirmRefund() {
    if (!refundBooking) return;
    setRefundingId(refundBooking.id);
    try {
      issueRefund(refundBooking.id, "Guest cancellation requested");
      await loadBookings();
    } finally {
      setRefundingId(null);
      setRefundConfirmOpen(false);
      setRefundBooking(null);
    }
  }

  return (
    <AppShell
      heading="Your bookings"
      subheading="Track upcoming stays, recent reservations, and travel activity"
    >
      {loading && !bookings.length ? (
        <section className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-card)]">
          <p className="text-sm font-semibold text-[#6b7280]">
            Loading your bookings…
          </p>
        </section>
      ) : null}

      {visibleBookings.length ? (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-3">
            {miniStats.map((stat) => (
              <MiniStatCard key={stat.label} stat={stat} />
            ))}
          </section>

          {latestBooking ? (
            <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[#EDF3FF] via-[#F0F5FF] to-white p-6 shadow-[var(--shadow-card)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0A2A8C]/60">
                    Latest Reservation
                  </p>
                  <h3 className="mt-2 text-[22px] font-black tracking-tight text-[#111827]">
                    {latestBooking.listingTitle}
                  </h3>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6b7280]">
                    <span>
                      {formatDisplayDate(latestBooking.startDate)} —{" "}
                      {formatDisplayDate(latestBooking.endDate)}
                    </span>
                    <span>•</span>
                    <span>
                      {latestBooking.nights}{" "}
                      {latestBooking.nights === 1 ? "night" : "nights"}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center">
                      <BookingStatusBadge status={latestBooking.status} paymentStatus={latestBooking.paymentStatus} />
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-bold text-[#4b5563] shadow-sm">
                    📍 {latestBooking.location}
                  </span>
                  <span className="rounded-full bg-[#1E5BFF]/10 px-4 py-2 text-xs font-black text-[#1E5BFF]">
                    💰 {formatMoney(latestBooking.total, latestBooking.currency)}
                  </span>
                </div>
              </div>
            </section>
          ) : null}

          {upcomingBookings.length ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1E5BFF]">
                  Upcoming / Pending
                </p>
                <p className="text-xs font-semibold text-[#6b7280]">
                  {upcomingBookings.length} reservation
                  {upcomingBookings.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                {upcomingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onPayNow={handlePayNow}
                    paying={payBooking?.id === booking.id && paymentBusy}
                    onViewReceipt={handleViewReceipt}
                    onRequestRefund={handleRequestRefund}
                    refunding={refundingId === booking.id}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {pastBookings.length ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b7280]">
                  Past Stays
                </p>
                <p className="text-xs font-semibold text-[#6b7280]">
                  {pastBookings.length} stay
                  {pastBookings.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                {pastBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onPayNow={handlePayNow}
                    paying={payBooking?.id === booking.id && paymentBusy}
                    onViewReceipt={handleViewReceipt}
                    onRequestRefund={handleRequestRefund}
                    refunding={refundingId === booking.id}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : loading ? null : (
        <EmptyBookingsState mode="renter" />
      )}

      <PaymentIntentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        booking={payBooking!}
        intent={payIntent}
        busy={paymentBusy}
        onConfirm={handleConfirmPayment}
      />

      <ReceiptDialog
        open={receiptDialogOpen}
        onClose={() => setReceiptDialogOpen(false)}
        receipt={receiptData}
        booking={receiptBooking}
      />

      {refundConfirmOpen && refundBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 backdrop-blur-md bg-[#061525]/60">
          <div className="relative w-full max-w-md rounded-[28px] border border-white bg-white shadow-[0_24px_60px_rgba(239,68,68,0.2)]">
            <div className="p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fef2f2] text-2xl">
                  ⚠️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ef4444]/70">
                    Refund Request
                  </p>
                  <h3 className="mt-1.5 text-[18px] font-black tracking-tight text-[#111827]">
                    Request refund for this booking?
                  </h3>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-[#ef4444]/15 bg-[#fef2f2] p-4">
                <p className="text-sm font-bold text-[#991b1b]">
                  {refundBooking.listingTitle}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#b91c1c]">
                  {formatDisplayDate(refundBooking.startDate)} —{" "}
                  {formatDisplayDate(refundBooking.endDate)}
                </p>
                <p className="mt-2 text-sm font-black text-[#7f1d1d] tabular-nums">
                  Refund amount: {formatMoney(refundBooking.total, refundBooking.currency)}
                </p>
                <div className="mt-3 rounded-xl border border-[#ef4444]/15 bg-white px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9ca3af]">
                    Reason
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#4b5563]">
                    Guest cancellation requested
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setRefundConfirmOpen(false);
                    setRefundBooking(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-xs font-bold text-[#374151] transition hover:bg-[var(--panel-soft)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={refundingId === refundBooking.id}
                  onClick={handleConfirmRefund}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#ef4444] px-4 py-2.5 text-xs font-bold text-white shadow-[0_6px_16px_rgba(239,68,68,0.32)] transition hover:bg-[#dc2626] disabled:opacity-60"
                >
                  {refundingId === refundBooking.id
                    ? "Processing..."
                    : "✓ Confirm Refund"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
