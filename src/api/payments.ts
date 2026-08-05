import type {
  Currency,
  PaymentIntent,
  Receipt,
  WebBooking,
} from "@/types/models";
import { formatMoney } from "@/utils";
import {
  getStoredBookings,
  markBookingPaid,
  saveStoredBookings,
} from "@/api/bookings";

const INTENTS_KEY = "bluerock.web.intents.v1";
const RECEIPTS_KEY = "bluerock.web.receipts.v1";

function getStoredIntents(): PaymentIntent[] {
  if (typeof window === "undefined") return [] as PaymentIntent[];
  try {
    const raw = window.localStorage.getItem(INTENTS_KEY);
    return raw ? (JSON.parse(raw) as PaymentIntent[]) : [];
  } catch {
    return [];
  }
}

function saveStoredIntents(intents: PaymentIntent[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INTENTS_KEY, JSON.stringify(intents));
}

function getStoredReceipts(): Receipt[] {
  if (typeof window === "undefined") return [] as Receipt[];
  try {
    const raw = window.localStorage.getItem(RECEIPTS_KEY);
    return raw ? (JSON.parse(raw) as Receipt[]) : [];
  } catch {
    return [];
  }
}

function saveStoredReceipts(receipts: Receipt[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
}

export type PaymentStatus =
  | "UNPAID"
  | "PAID"
  | "REFUNDED"
  | "PROCESSING"
  | "FAILED";

export type BookingPayment = {
  bookingId: string;
  subtotal: number;
  serviceFee: number;
  taxes?: number;
  total: number;
  status: PaymentStatus;
  reference?: string;
  paidAt?: string;
  currency: string;
};

export function getPaymentSummary(
  booking: Pick<
    WebBooking,
    | "id"
    | "subtotal"
    | "serviceFee"
    | "total"
    | "paymentStatus"
    | "currency"
    | "createdAt"
    | "nights"
    | "pricePerNight"
  >,
): BookingPayment {
  const status = booking.paymentStatus as PaymentStatus;
  const reference = `BLU-${booking.id.slice(0, 8).toUpperCase()}`;
  let paidAt: string | undefined;
  if (status === "PAID" || status === "REFUNDED") {
    paidAt = booking.createdAt ?? new Date().toISOString();
  }
  return {
    bookingId: booking.id,
    subtotal: booking.subtotal,
    serviceFee: booking.serviceFee,
    taxes: undefined,
    total: booking.total,
    status,
    reference,
    paidAt,
    currency: booking.currency,
  };
}

export async function markBookingPaidWithPersistence(params: {
  accessToken: string | null;
  bookingId: string;
}): Promise<WebBooking | null> {
  const updated = await markBookingPaid(params);
  if (updated) {
    const stored = getStoredBookings();
    const idx = stored.findIndex((b) => b.id === params.bookingId);
    if (idx >= 0) {
      const copy = [...stored];
      copy[idx] = {
        ...copy[idx],
        paymentStatus: "PAID",
        status: "CONFIRMED",
      };
      saveStoredBookings(copy);
    }
  }
  return updated;
}

function formatShortLocaleDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function formatDateCompact(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

export function getReceiptData(booking: WebBooking): {
  reference: string;
  issueDate: string;
  bookingId: string;
  title: string;
  stayDates: string;
  nights: number;
  lineItems: Array<{ label: string; amount: number }>;
  subtotal: number;
  serviceFee: number;
  taxes?: number;
  total: number;
  currency: string;
  status: string;
  hostName: string;
  paymentMethodLast4: string;
  paidAt: string;
} {
  const reference = `BLU-${booking.id.slice(0, 8).toUpperCase()}`;
  const paidAtIso = booking.createdAt ?? new Date().toISOString();
  const start = formatDateCompact(booking.startDate);
  const end = formatDateCompact(booking.endDate);
  const stayDates = `${start} – ${end}`;
  const lineItems: Array<{ label: string; amount: number }> = [
    {
      label: `${booking.nights} night${booking.nights === 1 ? "" : "s"} × ${formatMoney(booking.pricePerNight, booking.currency)}`,
      amount: booking.subtotal,
    },
    { label: "Service fee (10%)", amount: booking.serviceFee },
  ];

  const hostName =
    (booking as unknown as { host?: { name?: string } })?.host?.name ?? "Host";

  return {
    reference,
    issueDate: formatShortLocaleDate(paidAtIso),
    bookingId: booking.id,
    title: booking.listingTitle,
    stayDates,
    nights: booking.nights,
    lineItems,
    subtotal: booking.subtotal,
    serviceFee: booking.serviceFee,
    taxes: undefined,
    total: booking.total,
    currency: booking.currency,
    status: booking.paymentStatus,
    hostName,
    paymentMethodLast4: "4242",
    paidAt: formatShortLocaleDate(paidAtIso),
  };
}

export function createPaymentIntent(booking: WebBooking): PaymentIntent {
  const intent: PaymentIntent = {
    id: `pi_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    bookingId: booking.id,
    amount: booking.total,
    currency: booking.currency as Currency,
    status: "CREATED",
    clientSecret: `pi_secret_${Math.random().toString(36).slice(2, 20)}`,
    createdAt: new Date().toISOString(),
  };
  const all = getStoredIntents();
  saveStoredIntents([intent, ...all]);
  return intent;
}

export function confirmPayment(intentId: string): { booking: WebBooking } {
  const intents = getStoredIntents();
  const idx = intents.findIndex((i) => i.id === intentId);
  let intent = intents[idx];
  if (!intent) {
    intent = {
      id: intentId,
      bookingId: intentId,
      amount: 0,
      currency: "USD",
      status: "CAPTURED",
      createdAt: new Date().toISOString(),
    };
  }
  const captured: PaymentIntent = { ...intent, status: "CAPTURED" };
  if (idx >= 0) {
    const copy = [...intents];
    copy[idx] = captured;
    saveStoredIntents(copy);
  } else {
    saveStoredIntents([captured, ...intents]);
  }

  const bookings = getStoredBookings();
  const bIdx = bookings.findIndex((b) => b.id === captured.bookingId);
  let updatedBooking: WebBooking | undefined;
  if (bIdx >= 0) {
    const copy = [...bookings];
    updatedBooking = {
      ...copy[bIdx],
      paymentStatus: "PAID",
      status: "CONFIRMED",
    };
    copy[bIdx] = updatedBooking;
    saveStoredBookings(copy);
  } else {
    updatedBooking = bookings[0];
  }

  const receiptForBooking = buildSyntheticReceipt(updatedBooking ?? (bookings[0] as WebBooking));
  const receipts = getStoredReceipts();
  if (!receipts.some((r) => r.bookingId === receiptForBooking.bookingId)) {
    saveStoredReceipts([receiptForBooking, ...receipts]);
  }

  return { booking: updatedBooking ?? ({} as WebBooking) };
}

export function buildSyntheticReceipt(booking: WebBooking): Receipt {
  const number = `BLU-${booking.id.slice(0, 8).toUpperCase()}`;
  const issuedAt = booking.createdAt ?? new Date().toISOString();
  const hostName =
    (booking as unknown as { host?: { name?: string } })?.host?.name ??
    "BlueRock Host";
  return {
    id: `rcpt_${booking.id}`,
    bookingId: booking.id,
    transactionId: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    number,
    issuedAt,
    lineItems: [
      { label: booking.listingTitle, amount: booking.subtotal },
      { label: "Service fee (10%)", amount: booking.serviceFee },
    ],
    subtotal: booking.subtotal,
    serviceFee: booking.serviceFee,
    total: booking.total,
    currency: booking.currency as Currency,
    payer: "BlueRock Guest",
    recipient: hostName,
  };
}

export function getReceiptForBooking(bookingId: string): Receipt | null {
  const receipts = getStoredReceipts();
  return receipts.find((r) => r.bookingId === bookingId) ?? null;
}

export function isRefundEligible(booking: WebBooking): boolean {
  if (booking.paymentStatus !== "PAID") return false;
  if (booking.status === "CANCELLED" || booking.status === "REJECTED") return false;
  const start = new Date(booking.startDate).getTime();
  const now = Date.now();
  return start > now + 2 * 24 * 60 * 60 * 1000;
}

export function issueRefund(bookingId: string, reason: string): void {
  const bookings = getStoredBookings();
  const idx = bookings.findIndex((b) => b.id === bookingId);
  if (idx >= 0) {
    const copy = [...bookings];
    copy[idx] = {
      ...copy[idx],
      paymentStatus: "REFUNDED",
      status: "CANCELLED",
    };
    saveStoredBookings(copy);
  }
  void reason;
}
