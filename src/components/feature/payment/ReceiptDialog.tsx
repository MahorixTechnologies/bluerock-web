"use client";

import { useEffect, useState } from "react";

import type { Receipt, WebBooking } from "@/types/models";
import { formatMoney } from "@/utils";

function formatDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatFullDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

export function ReceiptDialog({
  open,
  onClose,
  receipt,
  booking,
}: {
  open: boolean;
  onClose: () => void;
  receipt: Receipt | null;
  booking: WebBooking | null;
}) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedNum, setCopiedNum] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopiedRef(false);
      setCopiedNum(false);
    }
  }, [open]);

  if (!open || !receipt || !booking) return null;

  const confirmedReceipt = receipt;
  const confirmedBooking = booking;

  async function handleCopyRef() {
    await copyToClipboard(confirmedReceipt.number);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 1500);
  }

  async function handleCopyTxn() {
    await copyToClipboard(confirmedReceipt.transactionId);
    setCopiedNum(true);
    setTimeout(() => setCopiedNum(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 backdrop-blur-md bg-[#061525]/60 overflow-y-auto">
      <div className="relative w-full max-w-[640px] my-auto">
        <div
          className="relative w-full rounded-[28px] border border-[#e5e7eb] bg-white shadow-[0_24px_60px_rgba(10,42,140,0.2)]"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[var(--panel-soft)] hover:text-[#111827]"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="p-8">
            <div className="flex flex-col items-center gap-2 pb-6 border-b border-dashed border-[#e5e7eb]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b7280]">
                Official Receipt
              </p>
              <div className="flex items-center gap-2">
                <h2 className="text-[22px] font-black tracking-tight text-[#0A2A8C]">
                  {receipt.number}
                </h2>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#1E5BFF]/20 bg-[#EDF3FF] px-2 py-1 text-[10px] font-bold text-[#1E5BFF] transition hover:bg-[#E5EEFF]"
                >
                  {copiedRef ? "✓" : "📋"}
                </button>
              </div>
              <p className="text-xs font-semibold text-[#6b7280]">
                Issued: {formatFullDate(receipt.issuedAt)}
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
                  From
                </p>
                <p className="mt-1.5 text-sm font-black text-[#111827]">
                  BlueRock Platform
                </p>
                <p className="text-xs font-semibold text-[#6b7280]">
                  receipts@bluerock.example
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
                  To
                </p>
                <p className="mt-1.5 text-sm font-black text-[#111827]">
                  {receipt.payer}
                </p>
                <p className="text-xs font-semibold text-[#6b7280]">
                  BlueRock Guest
                </p>
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-[var(--border)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F0F5FF]">
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#0A2A8C]/70">
                      Service
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#0A2A8C]/70">
                      Qty
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#0A2A8C]/70">
                      Rate
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#0A2A8C]/70">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {receipt.lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-4 align-top">
                        <p className="text-sm font-bold text-[#111827]">
                          {booking.listingTitle}
                        </p>
                        <p className="text-xs font-semibold text-[#6b7280] mt-0.5">
                          {formatDisplayDate(booking.startDate)} — {formatDisplayDate(booking.endDate)}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-semibold tabular-nums text-[#374151]">
                        {booking.nights}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-semibold tabular-nums text-[#374151]">
                        {formatMoney(booking.pricePerNight, booking.currency)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-bold tabular-nums text-[#111827]">
                        {formatMoney(item.amount, booking.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white">
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-right text-sm font-semibold text-[#6b7280] border-t border-[var(--border)]"
                    >
                      Subtotal
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-[#374151] border-t border-[var(--border)]">
                      {formatMoney(receipt.subtotal, booking.currency)}
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-right text-sm font-semibold text-[#6b7280] border-t border-[var(--border)]"
                    >
                      Service Fee (10%)
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-[#374151] border-t border-[var(--border)]">
                      {formatMoney(receipt.serviceFee, booking.currency)}
                    </td>
                  </tr>
                  <tr className="bg-[#EDF3FF]">
                    <td
                      colSpan={3}
                      className="px-4 py-4 text-right text-base font-black text-[#0A2A8C] border-t-2 border-[#1E5BFF]/20"
                    >
                      Total
                    </td>
                    <td className="px-4 py-4 text-right text-xl font-black tracking-tight tabular-nums text-[#1E5BFF] border-t-2 border-[#1E5BFF]/20">
                      {formatMoney(receipt.total, booking.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-6 flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
                  Transaction Reference
                </p>
                <p className="mt-1 font-mono text-sm font-black text-[#111827] break-all">
                  {receipt.transactionId}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyTxn}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[11px] font-bold text-[#1E5BFF] transition hover:border-[#1E5BFF]/30 hover:bg-[#EDF3FF]"
              >
                {copiedNum ? "✓ Copied" : "📋 Copy"}
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  /* PDF download placeholder */
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-2.5 text-xs font-bold text-[#4b5563] transition hover:border-[#1E5BFF]/25 hover:bg-[#EDF3FF] hover:text-[#1E5BFF]"
              >
                📄 Download PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-xs font-bold text-[#374151] transition hover:border-[#9ca3af]/50 hover:bg-[var(--panel-soft)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
