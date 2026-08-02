import type {
  BookingStatus,
  PaymentStatus,
  WebBooking,
} from "./models";

type StatusMeta = {
  label: string;
  badgeClass: string;
  tint: string;
};

export function getBookingStatusMeta(status: BookingStatus): StatusMeta {
  switch (status) {
    case "CONFIRMED":
      return {
        label: "Confirmed",
        badgeClass: "bg-[rgba(16,185,129,0.12)] text-[#10b981]",
        tint: "#10b981",
      };
    case "COMPLETED":
      return {
        label: "Completed",
        badgeClass: "bg-[rgba(107,114,128,0.12)] text-[#6b7280]",
        tint: "#6b7280",
      };
    case "PENDING":
      return {
        label: "Pending",
        badgeClass: "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]",
        tint: "#ca8a04",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        badgeClass: "bg-[rgba(239,68,68,0.12)] text-[#ef4444]",
        tint: "#ef4444",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        badgeClass: "bg-[rgba(239,68,68,0.12)] text-[#ef4444]",
        tint: "#ef4444",
      };
  }
}

export function getPaymentStatusMeta(
  paymentStatus: PaymentStatus,
): { label: string; badgeClass: string } {
  switch (paymentStatus) {
    case "UNPAID":
      return {
        label: "Unpaid",
        badgeClass: "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]",
      };
    case "PAID":
      return {
        label: "Paid",
        badgeClass: "bg-[rgba(16,185,129,0.12)] text-[#10b981]",
      };
    case "REFUNDED":
      return {
        label: "Refunded",
        badgeClass: "bg-[rgba(107,114,128,0.12)] text-[#6b7280]",
      };
  }
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatBookingDatesCompact(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return `${start} – ${end}`;
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const sFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: sameMonth ? undefined : "numeric",
  }).format(s);
  const eFmt = new Intl.DateTimeFormat("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: "numeric",
  }).format(e);
  return `${sFmt} – ${eFmt}`;
}

type TimelineEvent = {
  key: string;
  label: string;
  title: string;
  date: string | null;
  done: boolean;
};

export function getTimelineEvents(
  booking: Pick<
    WebBooking,
    "status" | "paymentStatus" | "startDate" | "endDate" | "createdAt"
  >,
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const { status, paymentStatus, startDate, endDate, createdAt } = booking;

  const isCancelled = status === "CANCELLED" || status === "REJECTED";

  events.push({
    key: "requested",
    label: "Booking requested",
    title: "Your reservation request was sent to the host",
    date: createdAt ? formatShortDate(createdAt) : null,
    done: true,
  });

  if (isCancelled) {
    events.push({
      key: "cancelled",
      label: status === "CANCELLED" ? "Booking cancelled" : "Booking rejected",
      title:
        status === "CANCELLED"
          ? "This reservation was cancelled by the guest or host"
          : "Unfortunately the host was unable to approve this request",
      date: null,
      done: true,
    });
    return events;
  }

  const confirmed = status === "CONFIRMED" || status === "COMPLETED";
  events.push({
    key: "confirmed",
    label: "Host approved",
    title: confirmed
      ? "Host has accepted your request"
      : "Awaiting host review and approval",
    date: confirmed ? formatShortDate(createdAt) : null,
    done: confirmed,
  });

  const paid = paymentStatus === "PAID" || paymentStatus === "REFUNDED";
  events.push({
    key: "payment",
    label: "Payment confirmed",
    title: paid ? "Payment has been processed successfully" : "Complete payment to lock in your stay",
    date: paid ? formatShortDate(createdAt) : null,
    done: paid,
  });

  const now = new Date().toISOString().slice(0, 10);
  const started = startDate <= now;
  const ended = endDate < now;
  const completed = status === "COMPLETED";

  events.push({
    key: "stay",
    label: completed ? "Stay completed" : started ? "Enjoy your stay" : "Upcoming stay",
    title: completed
      ? "Trip finished — thanks for staying!"
      : started
        ? "Check-in day has arrived"
        : `Scheduled for ${formatBookingDatesCompact(startDate, endDate)}`,
    date: started ? (completed ? formatShortDate(endDate) : formatShortDate(startDate)) : null,
    done: completed,
  });

  return events;
}
