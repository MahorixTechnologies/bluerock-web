"use client";

import type { WebBooking } from "@/lib/models";
import { formatMoney } from "@/lib/utils";
import { formatBookingDatesCompact } from "@/lib/booking-status";
import { getPaymentSummary } from "@/lib/payments";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

export function PaymentSummaryCard({
  booking,
  onPay,
  actionLabel,
  busy = false,
}: {
  booking: WebBooking;
  onPay?: () => void;
  actionLabel?: string;
  busy?: boolean;
}) {
  const summary = getPaymentSummary(booking);
  const nightsLine = booking.nights * booking.pricePerNight;
  const showPayButton =
    onPay &&
    (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
    booking.paymentStatus === "UNPAID";

  return (
    <div className="overflow-hidden rounded-[28px] border border-[rgba(16,185,129,0.15)] bg-white shadow-[0_10px_40px_rgba(16,185,129,0.08)]">
      <div
        className="relative p-6"
        style={{
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 50%, rgba(5,150,105,0.06) 100%)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#059669]/70">
              Payment summary
            </p>
            <h3 className="mt-1.5 text-lg font-black tracking-tight text-[#064e3b]">
              {booking.listingTitle}
            </h3>
          </div>
          <PaymentStatusBadge status={summary.status} compact />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-[rgba(16,185,129,0.25)] bg-white px-3 py-1 font-mono text-[11px] font-black tracking-wider text-[#059669] shadow-sm">
            {summary.reference}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-[#065f46]">
            📅 {formatBookingDatesCompact(booking.startDate, booking.endDate)}
          </span>
          <span className="inline-flex items-center rounded-full bg-[rgba(16,185,129,0.15)] px-3 py-1 text-xs font-black text-[#059669]">
            {booking.nights} night{booking.nights === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#6b7280]">
            {booking.nights} × {formatMoney(booking.pricePerNight, booking.currency)}/night
          </span>
          <span className="font-bold tabular-nums text-[#374151]">
            {formatMoney(nightsLine, booking.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#6b7280]">Subtotal</span>
          <span className="font-bold tabular-nums text-[#374151]">
            {formatMoney(booking.subtotal, booking.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#6b7280]">
            Service fee <span className="text-[10px] font-black text-[#059669]/70">(10%)</span>
          </span>
          <span className="font-bold tabular-nums text-[#374151]">
            {formatMoney(booking.serviceFee, booking.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#9ca3af]">Taxes</span>
          <span className="font-bold tabular-nums text-[#9ca3af]">
            {formatMoney(0, booking.currency)}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between border-t border-dashed border-[rgba(16,185,129,0.2)] pt-4">
          <span className="text-base font-black text-[#064e3b]">Grand total</span>
          <span className="text-[26px] font-black tracking-tight tabular-nums text-[#059669]">
            {formatMoney(booking.total, booking.currency)}
          </span>
        </div>
      </div>

      {showPayButton && (
        <div className="px-6 pb-6">
          <button
            type="button"
            disabled={busy}
            onClick={onPay}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#059669] to-[#047857] px-5 py-4 text-[15px] font-black text-white shadow-[0_10px_28px_rgba(5,150,105,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(5,150,105,0.45)] disabled:cursor-not-allowed disabled:from-[#a7f3d0]/70 disabled:to-[#a7f3d0]/70 disabled:text-white/80 disabled:shadow-none disabled:hover:translate-y-0"
          >
            {busy ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Processing...
              </>
            ) : (
              <>
                <span className="transition-transform group-hover:scale-110">✓</span>
                {actionLabel ?? `Pay ${formatMoney(booking.total, booking.currency)}`}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
