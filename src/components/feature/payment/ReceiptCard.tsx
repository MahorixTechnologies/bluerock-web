"use client";

import type { WebBooking } from "@/types/models";
import { formatMoney } from "@/utils";
import { getReceiptData } from "@/api/payments";

export function ReceiptCard({ booking }: { booking: WebBooking }) {
  const receipt = getReceiptData(booking);

  return (
    <div className="overflow-hidden rounded-3xl border border-[rgba(16,185,129,0.18)] bg-gradient-to-br from-[#ecfdf5] via-white to-[#f0fdfa] shadow-[0_20px_60px_rgba(16,185,129,0.12)]">
      <div className="bg-white p-7">
        <div className="flex flex-col items-center gap-3 border-b border-dashed border-[rgba(16,185,129,0.2)] pb-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#065f46]">
            BLUEROCK · Official Receipt
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#059669] to-[#047857] px-4 py-1.5 font-mono text-[11px] font-black tracking-wider text-white shadow-[0_4px_12px_rgba(5,150,105,0.3)]">
              RECEIPT NO: {receipt.reference}
            </span>
            <span className="inline-flex items-center rounded-full bg-[rgba(16,185,129,0.1)] px-3.5 py-1.5 text-[11px] font-bold text-[#047857]">
              Issue date: {receipt.issueDate}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
              Accommodation
            </p>
            <p className="mt-1.5 text-sm font-black text-[#111827]">
              {receipt.title}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#6b7280]">
              📍 {booking.location}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
              Stay details
            </p>
            <p className="mt-1.5 text-sm font-black text-[#111827]">
              {receipt.stayDates}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#6b7280]">
              {receipt.nights} night{receipt.nights === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-2xl border border-[rgba(16,185,129,0.15)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[rgba(16,185,129,0.08)]">
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.18em] text-[#065f46]">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.18em] text-[#065f46]">
                  Qty / Unit
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.18em] text-[#065f46]">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(16,185,129,0.1)] bg-white">
              <tr>
                <td className="px-4 py-4 align-top">
                  <p className="text-sm font-bold text-[#111827]">
                    {receipt.title}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-[#6b7280]">
                    {receipt.stayDates}
                  </p>
                </td>
                <td className="px-4 py-4 text-right align-top text-sm font-semibold tabular-nums text-[#374151]">
                  {booking.nights} × {formatMoney(booking.pricePerNight, booking.currency)}
                </td>
                <td className="px-4 py-4 text-right align-top text-sm font-bold tabular-nums text-[#111827]">
                  {formatMoney(booking.subtotal, booking.currency)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top">
                  <p className="text-sm font-bold text-[#111827]">Service fee</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#6b7280]">
                    Platform processing (10%)
                  </p>
                </td>
                <td className="px-4 py-3 text-right align-top text-sm font-semibold tabular-nums text-[#374151]">
                  1
                </td>
                <td className="px-4 py-3 text-right align-top text-sm font-bold tabular-nums text-[#111827]">
                  {formatMoney(booking.serviceFee, booking.currency)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={2}
                  className="border-t border-dashed border-[rgba(16,185,129,0.2)] px-4 py-3 text-right text-sm font-semibold text-[#6b7280]"
                >
                  Subtotal
                </td>
                <td className="border-t border-dashed border-[rgba(16,185,129,0.2)] px-4 py-3 text-right text-sm font-bold tabular-nums text-[#374151]">
                  {formatMoney(receipt.subtotal, booking.currency)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-2.5 text-right text-sm font-semibold text-[#6b7280]"
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
                  className="px-4 py-2.5 text-right text-sm font-semibold text-[#9ca3af]"
                >
                  Taxes
                </td>
                <td className="px-4 py-2.5 text-right text-sm font-bold tabular-nums text-[#9ca3af]">
                  {formatMoney(0, booking.currency)}
                </td>
              </tr>
              <tr className="bg-[rgba(16,185,129,0.08)]">
                <td
                  colSpan={2}
                  className="border-t-2 border-[rgba(16,185,129,0.25)] px-4 py-4 text-right text-base font-black text-[#064e3b]"
                >
                  TOTAL
                </td>
                <td className="border-t-2 border-[rgba(16,185,129,0.25)] px-4 py-4 text-right text-xl font-black tracking-tight tabular-nums text-[#059669]">
                  {formatMoney(receipt.total, booking.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 rounded-2xl border border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.04)] p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
                Paid via
              </p>
              <div className="mt-1.5 flex items-center gap-3">
                <span className="inline-flex h-8 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1A3CC8] to-[#1E5BFF] text-[10px] font-black italic tracking-wide text-white shadow-sm">
                  VISA
                </span>
                <p className="text-sm font-black tabular-nums text-[#111827]">
                  Visa •• {receipt.paymentMethodLast4}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
                Paid at
              </p>
              <p className="mt-1.5 text-sm font-black text-[#111827]">
                {receipt.paidAt}
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-dashed border-[rgba(16,185,129,0.2)] pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
              Paid to
            </p>
            <p className="mt-1.5 text-sm font-black text-[#065f46]">
              BlueRock Host · {receipt.hostName}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#059669] via-[#10b981] to-[#059669] px-7 py-4 text-white shadow-inner">
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
          className="inline-flex items-center gap-2 rounded-xl border border-[rgba(17,24,39,0.08)] bg-[#f9fafb] px-4 py-2.5 text-xs font-bold text-[#4b5563] transition hover:border-[rgba(16,185,129,0.25)] hover:bg-[#ecfdf5] hover:text-[#047857]"
        >
          📄 Download Receipt
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-[rgba(17,24,39,0.08)] bg-[#f9fafb] px-4 py-2.5 text-xs font-bold text-[#4b5563] transition hover:border-[rgba(16,185,129,0.25)] hover:bg-[#ecfdf5] hover:text-[#047857]"
        >
          🖨️ Print
        </button>
      </div>
    </div>
  );
}
