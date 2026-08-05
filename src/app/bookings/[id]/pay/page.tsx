"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { useWebAuth } from "@/providers/WebAuthProvider";
import { BookingStatusBadge } from "@/components/feature/booking";
import { fetchMyBookings } from "@/api/bookings";
import {
  buildSyntheticReceipt,
  confirmPayment,
  createPaymentIntent,
  getReceiptForBooking,
} from "@/api/payments";
import type { Receipt, WebBooking } from "@/types/models";
import { formatBookingDatesCompact } from "@/constants/booking-status";
import { formatMoney, initialsFor } from "@/utils";

export function PaymentStatusBadge({
  paymentStatus,
}: {
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
}) {
  const map: Record<
    typeof paymentStatus,
    { label: string; className: string }
  > = {
    UNPAID: {
      label: "Unpaid",
      className: "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]",
    },
    PAID: {
      label: "Paid",
      className: "bg-[rgba(16,185,129,0.12)] text-[#10b981]",
    },
    REFUNDED: {
      label: "Refunded",
      className: "bg-[rgba(107,114,128,0.12)] text-[#6b7280]",
    },
  };
  const m = map[paymentStatus];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${m.className}`}
    >
      {paymentStatus === "PAID" ? "✓ " : ""}
      {m.label}
    </span>
  );
}

export function PaymentMethodCard() {
  const cards = [
    {
      id: "visa-4242",
      brand: "Visa",
      last4: "4242",
      exp: "12/28",
      name: "Demo Card",
      default: true,
    },
    {
      id: "mastercard-5555",
      brand: "Mastercard",
      last4: "5555",
      exp: "08/27",
      name: "Backup Card",
      default: false,
    },
  ];
  const [selected, setSelected] = useState(cards[0].id);

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] overflow-hidden">
      <div className="bg-gradient-to-br from-[rgba(30,91,255,0.06)] to-white px-6 py-5 border-b border-[var(--border)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1E5BFF]/70">
          Payment method
        </p>
        <h2 className="mt-1.5 text-[18px] font-black tracking-tight text-[#111827]">
          Select a card
        </h2>
      </div>
      <div className="p-5 space-y-3">
        {cards.map((c) => {
          const isSelected = selected === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c.id)}
              className={`w-full text-left rounded-2xl border p-4 transition ${
                isSelected
                  ? "border-[rgba(16,185,129,0.5)] bg-[rgba(16,185,129,0.05)] shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
                  : "border-[var(--border)] bg-white hover:border-[rgba(30,91,255,0.25)] hover:bg-[var(--panel-soft)]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-black ${
                    c.brand === "Visa"
                      ? "bg-[#1A1F71] text-white"
                      : "bg-gradient-to-br from-[#EB001B] to-[#F79E1B] text-white"
                  }`}
                >
                  {c.brand === "Visa" ? "VISA" : "MC"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-[#111827] tabular-nums">
                    •••• •••• •••• {c.last4}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-[#6b7280]">
                    {c.name} · Exp {c.exp}
                  </p>
                </div>
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    isSelected
                      ? "border-[#10b981] bg-[#10b981]"
                      : "border-[#d1d5db] bg-white"
                  }`}
                >
                  {isSelected ? (
                    <span className="text-[11px] font-black text-white">✓</span>
                  ) : null}
                </div>
              </div>
              {c.default ? (
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-[#1E5BFF]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#1E5BFF]">
                    Default
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(16,185,129,0.1)] px-2.5 py-0.5 text-[10px] font-bold text-[#059669]">
                    🔒 3D Secure
                  </span>
                </div>
              ) : null}
            </button>
          );
        })}
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3.5 text-xs font-bold text-[#1E5BFF] transition hover:border-[#1E5BFF]/40 hover:bg-white"
        >
          + Add new card
        </button>
      </div>
    </section>
  );
}

export function ReceiptCard({ booking }: { booking: WebBooking }) {
  const receipt: Receipt =
    getReceiptForBooking(booking.id) ?? buildSyntheticReceipt(booking);

  function fmtShort(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] overflow-hidden">
      <div className="bg-gradient-to-br from-[rgba(16,185,129,0.08)] to-white px-6 py-5 border-b border-[var(--border)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#059669]/70">
              Payment receipt
            </p>
            <h2 className="mt-1.5 text-[18px] font-black tracking-tight text-[#111827]">
              Receipt #{receipt.number}
            </h2>
          </div>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(16,185,129,0.12)] text-xl">
            🧾
          </span>
        </div>
        <p className="mt-3 text-xs font-semibold text-[#6b7280]">
          Issued {fmtShort(receipt.issuedAt)}
        </p>
      </div>
      <div className="p-6 space-y-5">
        <div className="rounded-2xl bg-[var(--panel-soft)] p-4 space-y-3">
          {receipt.lineItems.map((li, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <p className="font-semibold text-[#4b5563]">{li.label}</p>
              <p className="font-bold tabular-nums text-[#111827] shrink-0">
                {formatMoney(li.amount, receipt.currency)}
              </p>
            </div>
          ))}
          <div className="h-px bg-[var(--border)]" />
          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold text-[#6b7280]">Subtotal</p>
            <p className="font-bold tabular-nums text-[#374151]">
              {formatMoney(receipt.subtotal, receipt.currency)}
            </p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold text-[#6b7280]">Service fee</p>
            <p className="font-bold tabular-nums text-[#374151]">
              {formatMoney(receipt.serviceFee, receipt.currency)}
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            <p className="text-sm font-black text-[#111827]">Total paid</p>
            <p className="text-[22px] font-black tracking-tight text-[#059669] tabular-nums">
              {formatMoney(receipt.total, receipt.currency)}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9ca3af]">
              Payer
            </p>
            <p className="mt-1.5 text-sm font-bold text-[#111827]">
              {receipt.payer}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9ca3af]">
              Transaction
            </p>
            <p className="mt-1.5 text-sm font-mono font-bold text-[#111827] truncate">
              {receipt.transactionId.slice(0, 20)}…
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[rgba(16,185,129,0.08)] px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#059669]/80">
              Payment status
            </p>
            <p className="mt-0.5 text-sm font-black text-[#059669]">
              ✓ Successful
            </p>
          </div>
          <p className="text-xs font-bold text-[#059669]/80">
            Recipient: {receipt.recipient}
          </p>
        </div>
      </div>
    </section>
  );
}

export function PaymentSummaryCard({
  booking,
  onPay,
  busy,
}: {
  booking: WebBooking;
  onPay?: () => Promise<void>;
  busy?: boolean;
}) {
  const router = useRouter();
  const [agree, setAgree] = useState(false);
  const cannotPay =
    booking.status === "CANCELLED" || booking.status === "REJECTED";
  const isPaid =
    booking.paymentStatus === "PAID" || booking.paymentStatus === "REFUNDED";

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] overflow-hidden">
      <div className="bg-gradient-to-br from-[rgba(16,185,129,0.08)] to-white px-6 py-6 border-b border-[var(--border)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#059669]/70">
          Payment details
        </p>
        <h2 className="mt-2 text-[20px] font-black tracking-tight text-[#111827]">
          {isPaid ? "Payment complete" : "Complete your booking"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">
          {isPaid
            ? "Your reservation has been paid successfully. A receipt is available below."
            : cannotPay
              ? "This booking cannot be paid at this time."
              : "Mark this reservation as paid below to confirm with the host."}
        </p>
      </div>

      <div className="p-6 space-y-5">
        <div className="rounded-3xl bg-[var(--panel-soft)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9ca3af]">
              Booking Total
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-[40px] font-black tracking-tight text-[#059669] tabular-nums leading-none">
              {formatMoney(booking.total, booking.currency)}
            </p>
          </div>
          <div className="grid gap-2 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[#6b7280]">
                {booking.nights} {booking.nights === 1 ? "night" : "nights"} ×{" "}
                {formatMoney(booking.pricePerNight, booking.currency)}
              </span>
              <span className="font-semibold tabular-nums text-[#374151]">
                {formatMoney(booking.subtotal, booking.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[#6b7280]">Service fee</span>
              <span className="font-semibold tabular-nums text-[#374151]">
                {formatMoney(booking.serviceFee, booking.currency)}
              </span>
            </div>
          </div>
        </div>

        {cannotPay ? (
          <div className="rounded-2xl border border-[rgba(107,114,128,0.25)] bg-[var(--panel-soft)] px-4 py-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6b7280]">
              Cannot pay this booking now
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#4b5563]">
              This booking has been{" "}
              <span className="font-black text-[#ef4444]">
                {booking.status === "REJECTED" ? "rejected" : "cancelled"}
              </span>{" "}
              and is no longer eligible for payment.
              {booking.status === "REJECTED"
                ? " Please create a new reservation request for different dates."
                : " Reach out to the host if you need help re-booking."}
            </p>
          </div>
        ) : isPaid ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.08)] px-4 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10b981] text-base">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-black text-[#059669]">
                    Paid ✓
                  </p>
                  <p className="text-xs font-semibold text-[#059669]/80">
                    Booking confirmed and finalized
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs font-semibold leading-6 text-[#6b7280]">
              A payment receipt has been generated and stored. You can view it
              at any time from the booking details page.
            </p>
            <Link
              href={`/bookings/${booking.id}`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E5BFF] px-6 py-3.5 text-sm font-black text-white shadow-[0_10px_24px_rgba(30,91,255,0.32)] transition hover:bg-[#1849D6]"
            >
              View booking details →
            </Link>
          </div>
        ) : (
          <>
            <label className="flex items-start gap-3 cursor-pointer select-none rounded-2xl border border-[var(--border)] bg-white p-4 transition hover:border-[rgba(16,185,129,0.4)] hover:bg-[rgba(16,185,129,0.04)]">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 rounded-md border-2 border-[#d1d5db] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
              />
              <span className="text-sm font-semibold leading-6 text-[#374151]">
                I agree to BlueRock Terms of Service{" "}
                <span className="font-medium text-[#6b7280]">
                  (host cancellation applies)
                </span>
              </span>
            </label>

            <button
              type="button"
              disabled={!agree || !!busy}
              onClick={onPay}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#10b981] px-6 py-4 text-base font-black text-white shadow-[0_10px_24px_rgba(16,185,129,0.35)] transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {busy ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  ✓ Mark as PAID ·{" "}
                  {formatMoney(booking.total, booking.currency)}
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9ca3af]">
                🔒 Secure demo payment · No real charges
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

async function markBookingPaidWithPersistence(params: {
  accessToken: string | null;
  bookingId: string;
}) {
  const intents = await import("@/api/payments");
  const bookingsModule = await import("@/api/bookings");
  const allBookings = await bookingsModule.fetchMyBookings(params.accessToken);
  const target = allBookings.find((b) => b.id === params.bookingId);
  if (target) {
    const intent = intents.createPaymentIntent(target);
    try {
      intents.confirmPayment(intent.id);
    } catch {
      // ignore: localStorage may already be updated
    }
  }
  return bookingsModule.markBookingPaid(params);
}

export default function BookingsPayPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const router = useRouter();
  const { accessToken } = useWebAuth();
  const [booking, setBooking] = useState<WebBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const all = await fetchMyBookings(accessToken);
        if (cancelled) return;
        setBooking(all.find((b) => b.id === id) ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [accessToken, id]);

  async function handlePay() {
    if (!booking || busy) return;
    setBusy(true);
    setToast(null);
    try {
      const intent = createPaymentIntent(booking);
      try {
        confirmPayment(intent.id);
      } catch {
        // already persisted
      }
      const { markBookingPaid } = await import("@/api/bookings");
      const updated = await markBookingPaid({
        accessToken,
        bookingId: booking.id,
      });
      if (updated) {
        setBooking(updated);
      }
      setToast({ kind: "success", text: "Payment successful ✓" });
      setTimeout(() => {
        router.push(`/bookings/${booking.id}`);
      }, 1400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setToast({ kind: "error", text: msg });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      heading="Pay reservation"
      subheading="Review and confirm your booking payment"
    >
      {loading ? (
        <section className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1E5BFF] border-t-transparent" />
            <p className="text-sm font-semibold text-[#6b7280]">
              Preparing your payment…
            </p>
          </div>
        </section>
      ) : !booking ? (
        <section className="rounded-3xl border border-[rgba(239,68,68,0.25)] bg-white p-10 shadow-[var(--shadow-card)] text-center">
          <p className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(239,68,68,0.12)] text-2xl text-[#ef4444]">
            ❓
          </p>
          <h2 className="mt-5 text-[22px] font-black tracking-tight text-[#111827]">
            Booking not found
          </h2>
          <p className="mt-2 text-sm text-[#6b7280]">
            We couldn&apos;t locate this booking. It may have been removed or
            the link is invalid.
          </p>
          <Link
            href="/bookings"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1E5BFF] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[#1849D6]"
          >
            ← Back to Bookings
          </Link>
        </section>
      ) : (
        <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-[1fr_440px] items-start">
          <div className="order-2 lg:order-1 space-y-6">
            <section className="rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] overflow-hidden">
              <div className="relative">
                {booking.image ? (
                  <img
                    src={booking.image}
                    alt={booking.listingTitle}
                    className="h-[220px] w-full object-cover"
                  />
                ) : (
                  <div className="h-[220px] w-full bg-gradient-to-br from-[#e5e7eb] via-[#f3f4f6] to-[#e5e7eb]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#061525]/70 via-[#061525]/10 to-transparent" />
                <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] text-base font-black text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)]">
                      {initialsFor(booking.listingTitle)}
                    </div>
                    <BookingStatusBadge
                      status={booking.status}
                      paymentStatus={booking.paymentStatus}
                    />
                  </div>
                  <span className="rounded-full bg-[#10b981] px-3.5 py-1.5 text-[11px] font-black text-white shadow-[0_6px_16px_rgba(16,185,129,0.35)]">
                    {formatMoney(booking.total, booking.currency)}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
                    Stay info
                  </p>
                  <h2 className="mt-2 text-[22px] font-black tracking-tight leading-tight">
                    {booking.listingTitle}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-white/80">
                    📍 {booking.location}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white/70">
                    {booking.nights}{" "}
                    {booking.nights === 1 ? "night" : "nights"} ·{" "}
                    {formatBookingDatesCompact(
                      booking.startDate,
                      booking.endDate,
                    )}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 p-5">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
                    Check-in
                  </p>
                  <p className="mt-1.5 text-sm font-black text-[#111827]">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(booking.startDate))}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
                    Check-out
                  </p>
                  <p className="mt-1.5 text-sm font-black text-[#111827]">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(booking.endDate))}
                  </p>
                </div>
              </div>
            </section>

            <PaymentMethodCard />

            {booking.paymentStatus === "PAID" ||
            booking.paymentStatus === "REFUNDED" ? (
              <ReceiptCard booking={booking} />
            ) : null}
          </div>

          <div className="order-1 lg:order-2 lg:sticky lg:top-[120px] space-y-4">
            {toast ? (
              <div
                className={`rounded-2xl border px-4 py-3 ${
                  toast.kind === "success"
                    ? "border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.08)]"
                    : "border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)]"
                }`}
              >
                <p
                  className={`text-sm font-bold ${
                    toast.kind === "success" ? "text-[#059669]" : "text-[#ef4444]"
                  }`}
                >
                  {toast.kind === "success" ? "✓ " : "⚠ "}
                  {toast.text}
                </p>
              </div>
            ) : null}

            <PaymentSummaryCard
              booking={booking}
              onPay={handlePay}
              busy={busy}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
