"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { useWebAuth } from "@/providers/WebAuthProvider";
import { BookingStatusBadge } from "@/components/feature/booking";
import {
  PaymentMethodCard,
  PaymentSummaryCard,
  ReceiptCard,
} from "@/components/feature/payment";
import { fetchMyBookings } from "@/api/bookings";
import { initiatePayment } from "@/api/payments";
import type { PaymentProvider } from "@/components/feature/payment/PaymentMethodCard";
import type { WebBooking } from "@/types/models";
import { formatBookingDatesCompact } from "@/constants/booking-status";
import { formatMoney, initialsFor } from "@/utils";

export default function BookingsPayPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const { accessToken } = useWebAuth();
  const [booking, setBooking] = useState<WebBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState<PaymentProvider>("PAYSTACK");
  const [toast, setToast] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      setLoading(true);
      try {
        const all = await fetchMyBookings(accessToken);
        if (cancelled) return;
        setBooking(all.find((b) => b.id === id) ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, id]);

  async function handlePay() {
    if (!booking || busy) return;
    setBusy(true);
    setToast(null);
    try {
      const callbackUrl = `${window.location.origin}/payments/callback?purpose=BOOKING&targetId=${booking.id}`;
      const result = await initiatePayment({
        accessToken,
        purpose: "BOOKING",
        targetId: booking.id,
        provider,
        callbackUrl,
      });
      if (!result) {
        setToast({
          kind: "error",
          text: "We couldn't start the payment. Please try again.",
        });
        return;
      }
      window.location.href = result.authorizationUrl;
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
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            <p className="text-sm font-semibold text-[var(--muted)]">
              Preparing your payment…
            </p>
          </div>
        </section>
      ) : !booking ? (
        <section className="rounded-3xl border border-[rgba(239,68,68,0.25)] bg-white p-10 shadow-[var(--shadow-card)] text-center">
          <p className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--danger-soft)] text-2xl text-[var(--danger)]">
            ❓
          </p>
          <h2 className="mt-5 text-[22px] font-black tracking-tight text-[var(--text)]">
            Booking not found
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            We couldn&apos;t locate this booking. It may have been removed or
            the link is invalid.
          </p>
          <Link
            href="/bookings"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[var(--primary-600)]"
          >
            ← Back to Bookings
          </Link>
        </section>
      ) : (
        <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-[1fr_440px] items-start">
          <div className="order-2 lg:order-1 space-y-6">
            <section className="rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] overflow-hidden">
              <div className="relative h-[220px] w-full">
                {booking.image ? (
                  <Image
                    src={booking.image}
                    alt={booking.listingTitle}
                    fill
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-[220px] w-full bg-gradient-to-br from-[#e5e7eb] via-[#f3f4f6] to-[#e5e7eb]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#061525]/70 via-[#061525]/10 to-transparent" />
                <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-600)] text-base font-black text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)]">
                      {initialsFor(booking.listingTitle)}
                    </div>
                    <BookingStatusBadge
                      status={booking.status}
                      paymentStatus={booking.paymentStatus}
                    />
                  </div>
                  <span className="rounded-full bg-[var(--primary)] px-3.5 py-1.5 text-[11px] font-black text-white shadow-[0_6px_16px_rgba(30,91,255,0.35)]">
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
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-2)]">
                    Check-in
                  </p>
                  <p className="mt-1.5 text-sm font-black text-[var(--text)]">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(booking.startDate))}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-2)]">
                    Check-out
                  </p>
                  <p className="mt-1.5 text-sm font-black text-[var(--text)]">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(booking.endDate))}
                  </p>
                </div>
              </div>
            </section>

            <PaymentMethodCard selected={provider} onChange={setProvider} />

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
                    ? "border-[var(--success)]/25 bg-[var(--success)]/8"
                    : "border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)]"
                }`}
              >
                <p
                  className={`text-sm font-bold ${
                    toast.kind === "success" ? "text-[var(--success)]" : "text-[var(--danger)]"
                  }`}
                >
                  {toast.kind === "success" ? "✓ " : "⚠ "}
                  {toast.text}
                </p>
              </div>
            ) : null}

            <PaymentSummaryCard
              booking={booking}
              onPay={() => void handlePay()}
              busy={busy}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
