"use client";

import { useEffect, useState } from "react";

import type { PaymentIntent, WebBooking } from "@/lib/models";
import { formatMoney } from "@/lib/utils";

function formatDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

async function copyToClipboard(text: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* noop */
  }
}

export function PaymentIntentDialog({
  open,
  onClose,
  booking,
  intent,
  onConfirm,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  booking: WebBooking;
  intent: PaymentIntent | null;
  onConfirm: () => void;
  busy: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  if (!open || !intent) return null;

  const nightsLabel = `${booking.nights} night${booking.nights === 1 ? "" : "s"}`;
  const nightsSubtotal = booking.nights * booking.pricePerNight;

  async function handleCopyCard() {
    await copyToClipboard("4242424242424242");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 backdrop-blur-md bg-[#061525]/60">
      <div
        className="relative w-full max-w-[540px] rounded-[28px] border border-white bg-white shadow-[0_24px_60px_rgba(10,42,140,0.25)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[var(--panel-soft)] hover:text-[#111827]"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="p-7">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0A2A8C]/60">
              Payment Intent
            </p>
            <h2 className="mt-2 text-[22px] font-black tracking-tight text-[#111827]">
              Confirm your payment
            </h2>
          </div>

          <div className="mt-6 rounded-2xl border border-[#1E5BFF]/12 bg-[#EDF3FF] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0A2A8C]/50">
                  Property
                </p>
                <h3 className="mt-1 text-lg font-black tracking-tight text-[#111827]">
                  {booking.listingTitle}
                </h3>
                <p className="mt-1 text-sm font-medium text-[#4b5563]">
                  📍 {booking.location}
                </p>
              </div>
              <span className="rounded-xl bg-white px-3 py-2 text-xs font-black text-[#1E5BFF] shadow-sm">
                {nightsLabel}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-bold text-[#374151]">
                {formatDisplayDate(booking.startDate)}
              </span>
              <span className="text-[#9ca3af]">→</span>
              <span className="font-bold text-[#374151]">
                {formatDisplayDate(booking.endDate)}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#6b7280]">
                {booking.nights} × {formatMoney(booking.pricePerNight, booking.currency)}
              </span>
              <span className="font-bold tabular-nums text-[#374151]">
                {formatMoney(nightsSubtotal, booking.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#6b7280]">Service fee (10%)</span>
              <span className="font-bold tabular-nums text-[#374151]">
                {formatMoney(booking.serviceFee, booking.currency)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-[var(--border)] pt-3">
              <span className="text-base font-black text-[#111827]">Total</span>
              <span className="text-[22px] font-black tracking-tight tabular-nums text-[#1E5BFF]">
                {formatMoney(booking.total, booking.currency)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b7280]">
              Payment Method
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[#1E5BFF]/30 bg-[#F0F5FF] p-4 shadow-[0_0_0_3px_rgba(30,91,255,0.08)]">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#1A3CC8] to-[#1E5BFF] text-white shadow-[0_4px_12px_rgba(30,91,255,0.3)]">
                  <span className="text-[13px] font-black tracking-wide italic">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-black text-[#111827]">Credit Card</p>
                  <p className="text-xs font-semibold text-[#6b7280] tabular-nums">
                    •••• •••• •••• 4242
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyCard}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[11px] font-bold text-[#1E5BFF] transition hover:border-[#1E5BFF]/30 hover:bg-[#EDF3FF]"
              >
                {copied ? "✓ Copied" : "📋 Copy"}
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#0A2A8C] to-[#1442C4] px-5 py-4 text-[15px] font-black text-white shadow-[0_8px_24px_rgba(10,42,140,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(10,42,140,0.45)] disabled:cursor-not-allowed disabled:from-[#BFD4FF]/60 disabled:to-[#BFD4FF]/60 disabled:shadow-none disabled:hover:translate-y-0"
          >
            {busy ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Processing payment...
              </>
            ) : (
              <>
                <span>✓</span> Confirm &amp; Pay {formatMoney(booking.total, booking.currency)}
              </>
            )}
          </button>

          <div className="mt-5 grid gap-2.5 text-center">
            <p className="text-xs font-bold text-[#0F2F99]">
              🔒 Secured by BlueRock Payments
            </p>
            <p className="text-xs font-semibold text-[#6b7280]">
              Receipt emailed after confirmation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
