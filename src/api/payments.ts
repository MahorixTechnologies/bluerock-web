import type { Currency, Receipt, WebBooking } from "@/types/models";
import { formatMoney } from "@/utils";
import { apiFetch } from "@/api/client";
import type { PaymentProvider } from "@/components/feature/payment/PaymentMethodCard";

const RECEIPTS_KEY = "bluerock.web.receipts.v1";

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
  | "REFUND_PENDING"
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

export type InitiatePaymentResult = {
  authorizationUrl: string;
  reference: string;
};

/**
 * Kicks off a real Paystack/Flutterwave transaction. `callbackUrl` should
 * point at `/payments/callback` with `purpose`/`targetId` query params so
 * that page knows what to verify and where to send the user next.
 */
export async function initiatePayment(params: {
  accessToken: string | null;
  purpose: "BOOKING" | "FEATURED_LISTING";
  targetId: string;
  provider: PaymentProvider;
  callbackUrl: string;
}): Promise<InitiatePaymentResult | null> {
  try {
    return (await apiFetch("/payments/initiate", {
      accessToken: params.accessToken,
      method: "POST",
      body: JSON.stringify({
        purpose: params.purpose,
        targetId: params.targetId,
        provider: params.provider,
        callbackUrl: params.callbackUrl,
      }),
    })) as InitiatePaymentResult;
  } catch {
    return null;
  }
}

export type VerifyPaymentResult = {
  success: boolean;
  alreadyProcessed?: boolean;
};

/**
 * Independently confirms a transaction with the provider via the backend —
 * this is what actually flips the booking/listing state, not anything the
 * client claims happened.
 */
export async function verifyPayment(params: {
  accessToken: string | null;
  reference: string;
  providerTransactionId?: string;
}): Promise<VerifyPaymentResult | null> {
  try {
    return (await apiFetch("/payments/verify", {
      accessToken: params.accessToken,
      method: "POST",
      body: JSON.stringify({
        reference: params.reference,
        providerTransactionId: params.providerTransactionId,
      }),
    })) as VerifyPaymentResult;
  } catch {
    return null;
  }
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

/**
 * There's no dedicated receipt-generation endpoint — once a real payment is
 * verified, this builds a display-only receipt from the booking's own
 * (now-real) totals and stores it locally, same as the rest of this app's
 * receipt viewing already worked before real payments existed.
 */
export function recordReceiptForPaidBooking(booking: WebBooking): Receipt {
  const receipt = buildSyntheticReceipt(booking);
  const receipts = getStoredReceipts();
  if (!receipts.some((r) => r.bookingId === receipt.bookingId)) {
    saveStoredReceipts([receipt, ...receipts]);
  }
  return receipt;
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
