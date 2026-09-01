"use client";

import type { WebBooking, OwnerBooking } from "@/types/models";
import { apiFetch } from "@/api/client";

function normalizeBooking(raw: Record<string, unknown>, fallbackImage?: string): WebBooking {
  const listing = (raw?.listing ?? {}) as Record<string, unknown>;
  return {
    id: String(raw?.id ?? ""),
    listingId: String(raw?.listingId ?? listing?.id ?? ""),
    listingTitle: String(listing?.title ?? ""),
    location: String(listing?.location ?? ""),
    image: fallbackImage ?? "",
    currency: listing?.currency === "USD" ? "USD" : "NGN",
    startDate: String(raw?.startDate ?? "").slice(0, 10),
    endDate: String(raw?.endDate ?? "").slice(0, 10),
    nights: Number(raw?.nights ?? 0),
    pricePerNight: Number(listing?.pricePerNight ?? 0),
    subtotal: Number(raw?.subtotal ?? 0),
    serviceFee: Number(raw?.serviceFee ?? 0),
    total: Number(raw?.total ?? 0),
    status:
      raw?.status === "PENDING" ||
      raw?.status === "CONFIRMED" ||
      raw?.status === "REJECTED" ||
      raw?.status === "CANCELLED" ||
      raw?.status === "COMPLETED"
        ? raw.status
        : "PENDING",
    paymentStatus:
      raw?.paymentStatus === "PAID" ||
      raw?.paymentStatus === "REFUND_PENDING" ||
      raw?.paymentStatus === "REFUNDED"
        ? raw.paymentStatus
        : "UNPAID",
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
  };
}

function normalizeOwnerBooking(raw: Record<string, unknown>): OwnerBooking {
  const listing = (raw?.listing ?? {}) as Record<string, unknown>;
  const renter = (raw?.renter ?? {}) as Record<string, unknown>;
  return {
    id: String(raw?.id ?? ""),
    listingId: String(raw?.listingId ?? listing?.id ?? ""),
    startDate: String(raw?.startDate ?? "").slice(0, 10),
    endDate: String(raw?.endDate ?? "").slice(0, 10),
    nights: Number(raw?.nights ?? 0),
    subtotal: Number(raw?.subtotal ?? 0),
    serviceFee: Number(raw?.serviceFee ?? 0),
    total: Number(raw?.total ?? 0),
    status:
      raw?.status === "PENDING" ||
      raw?.status === "CONFIRMED" ||
      raw?.status === "REJECTED" ||
      raw?.status === "CANCELLED" ||
      raw?.status === "COMPLETED"
        ? raw.status
        : "PENDING",
    paymentStatus:
      raw?.paymentStatus === "PAID" ||
      raw?.paymentStatus === "REFUND_PENDING" ||
      raw?.paymentStatus === "REFUNDED"
        ? raw.paymentStatus
        : "UNPAID",
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
    listing: {
      id: String(listing?.id ?? ""),
      title: String(listing?.title ?? ""),
      location: String(listing?.location ?? ""),
      currency: listing?.currency === "USD" ? "USD" : "NGN",
      pricePerNight: Number(listing?.pricePerNight ?? 0),
    },
    renter: {
      id: String(renter?.id ?? ""),
      email: String(renter?.email ?? ""),
      name: renter?.name ? String(renter.name) : null,
      phone: renter?.phone ? String(renter.phone) : null,
    },
  };
}

export async function fetchMyBookings(accessToken: string | null): Promise<WebBooking[]> {
  const raw = await apiFetch("/bookings/me", { accessToken });
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => normalizeBooking(r as Record<string, unknown>));
}

export async function fetchOwnerBookings(accessToken: string | null): Promise<OwnerBooking[]> {
  const raw = await apiFetch("/bookings/owner", { accessToken });
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => normalizeOwnerBooking(r as Record<string, unknown>));
}

export async function createBookingOnApi(params: {
  accessToken: string | null;
  listingId: string;
  startDate: string;
  endDate: string;
}): Promise<WebBooking> {
  const raw = await apiFetch("/bookings", {
    accessToken: params.accessToken,
    method: "POST",
    body: JSON.stringify({
      listingId: params.listingId,
      startDate: params.startDate,
      endDate: params.endDate,
    }),
  });
  return normalizeBooking(raw as Record<string, unknown>);
}

export async function decideOwnerBooking(params: {
  accessToken: string | null;
  bookingId: string;
  decision: "ACCEPT" | "REJECT";
}): Promise<OwnerBooking> {
  const raw = await apiFetch(`/bookings/${params.bookingId}/decision`, {
    accessToken: params.accessToken,
    method: "PATCH",
    body: JSON.stringify({ decision: params.decision }),
  });
  return normalizeOwnerBooking(raw as Record<string, unknown>);
}

/**
 * Cancels a booking. If it was already PAID, the backend flips it to
 * REFUND_PENDING and the RefundsProcessorJob cron (or its Vercel Cron
 * equivalent) picks it up and actually moves the money back — there is no
 * separate "refund" endpoint, cancellation is how a refund is requested.
 */
export async function cancelBooking(params: {
  accessToken: string | null;
  bookingId: string;
}): Promise<WebBooking> {
  const raw = await apiFetch(`/bookings/${params.bookingId}/cancel`, {
    accessToken: params.accessToken,
    method: "POST",
  });
  return normalizeBooking(raw as Record<string, unknown>);
}
