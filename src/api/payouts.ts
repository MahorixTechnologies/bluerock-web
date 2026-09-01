"use client";

import { apiFetch } from "@/api/client";
import type { Currency } from "@/types/models";

export type PayoutStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED";

export type Payout = {
  id: string;
  bookingId: string | null;
  amount: number;
  currency: Currency;
  status: PayoutStatus;
  provider: "PAYSTACK" | "FLUTTERWAVE";
  reference: string;
  createdAt: string;
  paidAt: string | null;
};

function normalizePayout(raw: Record<string, unknown>): Payout {
  return {
    id: String(raw?.id ?? ""),
    bookingId: raw?.bookingId ? String(raw.bookingId) : null,
    amount: Number(raw?.amount ?? 0),
    currency: raw?.currency === "USD" ? "USD" : "NGN",
    status:
      raw?.status === "PROCESSING" || raw?.status === "PAID" || raw?.status === "FAILED"
        ? raw.status
        : "PENDING",
    provider: raw?.provider === "FLUTTERWAVE" ? "FLUTTERWAVE" : "PAYSTACK",
    reference: String(raw?.reference ?? ""),
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
    paidAt: raw?.paidAt ? String(raw.paidAt) : null,
  };
}

/** LANDLORD sees only their own payouts. */
export async function fetchOwnerPayouts(accessToken: string | null): Promise<Payout[]> {
  const raw = await apiFetch("/payouts", { accessToken });
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => normalizePayout(r as Record<string, unknown>));
}

export type PayoutAccount = {
  provider: "PAYSTACK" | "FLUTTERWAVE";
  bankCode: string;
  accountNumber: string;
  accountName: string;
  verified: boolean;
};

function normalizePayoutAccount(raw: Record<string, unknown>): PayoutAccount {
  return {
    provider: raw?.provider === "FLUTTERWAVE" ? "FLUTTERWAVE" : "PAYSTACK",
    bankCode: String(raw?.bankCode ?? ""),
    accountNumber: String(raw?.accountNumber ?? ""),
    accountName: String(raw?.accountName ?? ""),
    verified: Boolean(raw?.verified),
  };
}

/** The signed-in landlord's own payout account, or null if never set up. */
export async function fetchOwnerPayoutAccount(
  accessToken: string | null,
): Promise<PayoutAccount | null> {
  const raw = await apiFetch("/payouts/account", { accessToken });
  if (!raw || typeof raw !== "object") return null;
  return normalizePayoutAccount(raw as Record<string, unknown>);
}

export async function setupPayoutAccount(params: {
  accessToken: string | null;
  provider: "PAYSTACK" | "FLUTTERWAVE";
  bankCode: string;
  accountNumber: string;
  accountName: string;
}): Promise<PayoutAccount> {
  const raw = await apiFetch("/payouts/setup", {
    accessToken: params.accessToken,
    method: "POST",
    body: JSON.stringify({
      provider: params.provider,
      bankCode: params.bankCode,
      accountNumber: params.accountNumber,
      accountName: params.accountName,
    }),
  });
  return normalizePayoutAccount(raw as Record<string, unknown>);
}
