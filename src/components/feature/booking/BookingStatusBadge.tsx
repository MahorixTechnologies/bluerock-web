"use client";

import { getBookingStatusMeta, getPaymentStatusMeta } from "@/constants/booking-status";
import type { BookingStatus, PaymentStatus } from "@/types/models";

export function BookingStatusBadge({
  status,
  paymentStatus,
}: {
  status: BookingStatus;
  paymentStatus: PaymentStatus;
}) {
  const statusMeta = getBookingStatusMeta(status);
  const paymentMeta = getPaymentStatusMeta(paymentStatus);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${statusMeta.badgeClass}`}
      >
        {statusMeta.label}
      </span>
      <span
        className={`inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${paymentMeta.badgeClass}`}
      >
        {paymentMeta.label}
      </span>
    </div>
  );
}
