"use client";

import type { WebBooking } from "@/types/models";
import { formatMoney } from "@/utils";
import { getReceiptData } from "@/api/payments";

export function ReceiptCard({ booking }: { booking: WebBooking }) {
  const receipt = getReceiptData(booking);

  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--success)]/20 bg-gradient-to-br from-[var(--success-bg)] via-white to-[var(--success-bg)] shadow-[0_20px_60px_rgba(22,163,74,0.12)]">
      <div className="bg-white p-7">
        <div className="flex flex-col items-center gap-3 border-b border-dashed border-[var(--success)]/20 pb-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--success)]">
            BLUEROCK · Official Receipt
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[var(--success)] to-[#15803d] px-4 py-1.5 font-mono text-[11px] font-black tracking-wider text-white shadow-[0_4px_12px_rgba(22,163,74,0.3)]">
              RECEIPT NO: {receipt.reference}
            </span>
            <span className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-3.5 py-1.5 text-[11px] font-bold text-[var(--success)]">
              Issue date: {receipt.issueDate}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-2)]">
              Accommodation
            </p>
            <p className="mt-1.5 text-sm font-black text-[var(--text)]">
              {receipt.title}
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
              📍 {booking.location}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-2)]">
              Stay details
            </p>
            <p className="mt-1.5 text-sm font-black text-[var(--text)]">
              {receipt.stayDates}
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
              {receipt.nights} night{receipt.nights === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-2xl border border-[var(--success)]/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--success)]/8">
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.18em] text-[var(--success)]">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.18em] text-[var(--success)]">
                  Qty / Unit
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.18em] text-[var(--success)]">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--success)]/10 bg-white">
              <tr>
                <td className="px-4 py-4 align-top">
                  <p className="text-sm font-bold text-[var(--text)]">
                    {receipt.title}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-[var(--muted)]">
                    {receipt.stayDates}
                  </p>
                </td>
                <td className="px-4 py-4 text-right align-top text-sm font-semibold tabular-nums text-[#374151]">
                  {booking.nights} × {formatMoney(booking.pricePerNight, booking.currency)}
                </td>
                <td className="px-4 py-4 text-right align-top text-sm font-bold tabular-nums text-[var(--text)]">
                  {formatMoney(booking.subtotal, booking.currency)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top">
                  <p className="text-sm font-bold text-[var(--text)]">Service fee</p>
                  <p className="mt-0.5 text-xs font-semibold text-[var(--muted)]">
                    Platform processing (10%)
                  </p>
                </td>
                <td className="px-4 py-3 text-right align-top text-sm font-semibold tabular-nums text-[#374151]">
                  1
                </td>
                <td className="px-4 py-3 text-right align-top text-sm font-bold tabular-nums text-[var(--text)]">
                  {formatMoney(booking.serviceFee, booking.currency)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={2}
                  className="border-t border-dashed border-[var(--success)]/20 px-4 py-3 text-right text-sm font-semibold text-[var(--muted)]"
                >
                  Subtotal
                </td>
                <td className="border-t border-dashed border-[var(--success)]/20 px-4 py-3 text-right text-sm font-bold tabular-nums text-[#374151]">
                  {formatMoney(receipt.subtotal, booking.currency)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-2.5 text-right text-sm font-semibold text-[var(--muted)]"
                >
                  Service fee
                </td>
                <td className="px-4 py-2.5 text-right text-sm font-bold tabular-nums text-[#374151]">
                  {formatMoney(receipt.serviceFee, booking.currency)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-2.5 text-right text-sm font-semibold text-[var(--muted-2)]"
                >
                  Taxes
                </td>
                <td className="px-4 py-2.5 text-right text-sm font-bold tabular-nums text-[var(--muted-2)]">
                  {formatMoney(0, booking.currency)}
                </td>
              </tr>
              <tr className="bg-[var(--success)]/8">
                <td
                  colSpan={2}
                  className="border-t-2 border-[var(--success)]/25 px-4 py-4 text-right text-base font-black text-[var(--success)]"
                >
                  TOTAL
                </td>
                <td className="border-t-2 border-[var(--success)]/25 px-4 py-4 text-right text-xl font-black tracking-tight tabular-nums text-[var(--success)]">
                  {formatMoney(receipt.total, booking.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--success)]/15 bg-[var(--success)]/[0.04] p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-2)]">
                Paid via
              </p>
              <div className="mt-1.5 flex items-center gap-3">
                <span className="inline-flex h-8 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1A3CC8] to-[var(--primary)] text-[10px] font-black italic tracking-wide text-white shadow-sm">
                  VISA
                </span>
                <p className="text-sm font-black tabular-nums text-[var(--text)]">
                  Visa •• {receipt.paymentMethodLast4}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-2)]">
                Paid at
              </p>
              <p className="mt-1.5 text-sm font-black text-[var(--text)]">
                {receipt.paidAt}
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-dashed border-[var(--success)]/20 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-2)]">
              Paid to
            </p>
            <p className="mt-1.5 text-sm font-black text-[var(--success)]">
              BlueRock Host · {receipt.hostName}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[var(--success)] via-[#22c55e] to-[var(--success)] px-7 py-4 text-white shadow-inner">
        <div className="flex items-center justify-center gap-2 text-center">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 backdrop-blur">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 text-white"
            >
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <p className="text-[13px] font-black tracking-tight">
            This reservation has been paid in full.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 bg-white px-7 py-5">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[#f9fafb] px-4 py-2.5 text-xs font-bold text-[#4b5563] transition hover:border-[var(--success)]/25 hover:bg-[var(--success-bg)] hover:text-[var(--success)]"
        >
          📄 Download Receipt
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[#f9fafb] px-4 py-2.5 text-xs font-bold text-[#4b5563] transition hover:border-[var(--success)]/25 hover:bg-[var(--success-bg)] hover:text-[var(--success)]"
        >
          🖨️ Print
        </button>
      </div>
    </div>
  );
}
