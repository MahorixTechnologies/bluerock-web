"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { formatBookingDatesCompact } from "@/constants/booking-status";
import type { WebBooking } from "@/types/models";
import { formatMoney } from "@/utils";

import { BookingStatusBadge } from "./BookingStatusBadge";

function formatLongDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function BookingDetailCard({
  booking,
  onPay,
  showPay = true,
}: {
  booking: WebBooking;
  onPay?: (id: string) => void;
  showPay?: boolean;
}) {
  const router = useRouter();
  const needsPay =
    booking.paymentStatus === "UNPAID" &&
    booking.status !== "REJECTED" &&
    booking.status !== "CANCELLED" &&
    showPay;

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
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
          <BookingStatusBadge
            status={booking.status}
            paymentStatus={booking.paymentStatus}
          />
          <span className="rounded-full bg-[rgba(16,185,129,1)] px-3.5 py-1.5 text-[11px] font-black text-white shadow-[0_6px_16px_rgba(16,185,129,0.35)]">
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
          <p className="mt-1 text-xs font-semibold text-white/70">
            {booking.nights} {booking.nights === 1 ? "night" : "nights"} · {formatBookingDatesCompact(booking.startDate, booking.endDate)}
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
              Check-in
            </p>
            <p className="mt-2 text-sm font-black text-[#111827] tabular-nums">
              {formatLongDate(booking.startDate)}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
              Check-out
            </p>
            <p className="mt-2 text-sm font-black text-[#111827] tabular-nums">
              {formatLongDate(booking.endDate)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af] mb-4">
            Price Breakdown
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#4b5563]">
                {formatMoney(booking.pricePerNight, booking.currency)} / night × {booking.nights} nights
              </p>
              <p className="text-sm font-bold text-[#111827] tabular-nums">
                {formatMoney(booking.subtotal, booking.currency)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#4b5563]">Subtotal</p>
              <p className="text-sm font-bold text-[#111827] tabular-nums">
                {formatMoney(booking.subtotal, booking.currency)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#4b5563]">Service fee (10%)</p>
              <p className="text-sm font-bold text-[#111827] tabular-nums">
                {formatMoney(booking.serviceFee, booking.currency)}
              </p>
            </div>
            <div className="border-t border-[var(--border)] pt-3 flex items-center justify-between">
              <p className="text-sm font-black text-[#111827]">Total</p>
              <p className="text-lg font-black tracking-tight text-[rgba(16,185,129,1)] tabular-nums">
                {formatMoney(booking.total, booking.currency)}
              </p>
            </div>
          </div>
        </div>

        {needsPay ? (
          onPay ? (
            <button
              type="button"
              onClick={() => {
                onPay(booking.id);
                router.push(`/bookings/${booking.id}/pay`);
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[rgba(16,185,129,1)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(16,185,129,0.32)] transition hover:bg-[rgba(5,150,105,1)]"
            >
              Pay total of {formatMoney(booking.total, booking.currency)} <span>→</span>
            </button>
          ) : (
            <Link
              href={`/bookings/${booking.id}/pay`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[rgba(16,185,129,1)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(16,185,129,0.32)] transition hover:bg-[rgba(5,150,105,1)]"
            >
              Pay total of {formatMoney(booking.total, booking.currency)} <span>→</span>
            </Link>
          )
        ) : null}
      </div>
    </article>
  );
}
