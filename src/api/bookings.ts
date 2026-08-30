"use client";

import type { Listing, WebBooking, OwnerBooking } from "@/types/models";
import { diffNights, parseDate } from "@/utils";
import { makeMockBookings, makeMockOwnerBookings } from "@/constants/mock-bookings";
import { apiFetch } from "@/api/client";

const STORAGE_KEY = "bluerock.web.bookings.v1";

export function getStoredBookings(): WebBooking[] {
  if (typeof window === "undefined") return [] as WebBooking[];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WebBooking[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredBookings(bookings: WebBooking[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

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
      raw?.paymentStatus === "PAID" || raw?.paymentStatus === "REFUNDED"
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
      raw?.paymentStatus === "PAID" || raw?.paymentStatus === "REFUNDED"
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
  try {
    const raw = await apiFetch("/bookings/me", { accessToken });
    if (!Array.isArray(raw)) return makeMockBookings();
    return raw.map((r) => normalizeBooking(r as Record<string, unknown>));
  } catch {
    return makeMockBookings();
  }
}

export async function fetchOwnerBookings(accessToken: string | null): Promise<OwnerBooking[]> {
  try {
    const raw = await apiFetch("/bookings/owner", { accessToken });
    if (!Array.isArray(raw)) return makeMockOwnerBookings();
    return raw.map((r) => normalizeOwnerBooking(r as Record<string, unknown>));
  } catch {
    return makeMockOwnerBookings();
  }
}

export async function createBookingOnApi(params: {
  accessToken: string | null;
  listingId: string;
  startDate: string;
  endDate: string;
}): Promise<WebBooking | null> {
  try {
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
  } catch {
    return null;
  }
}

export async function markBookingPaid(params: {
  accessToken: string | null;
  bookingId: string;
}): Promise<WebBooking | null> {
  try {
    const raw = await apiFetch(`/bookings/${params.bookingId}/pay`, {
      accessToken: params.accessToken,
      method: "PATCH",
    });
    return normalizeBooking(raw as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function decideOwnerBooking(params: {
  accessToken: string | null;
  bookingId: string;
  decision: "ACCEPT" | "REJECT";
}): Promise<OwnerBooking | null> {
  try {
    const raw = await apiFetch(`/bookings/${params.bookingId}/decision`, {
      accessToken: params.accessToken,
      method: "PATCH",
      body: JSON.stringify({ decision: params.decision }),
    });
    return normalizeOwnerBooking(raw as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function createBookingFromListing(args: {
  listing: Listing;
  startDate: string;
  endDate: string;
}) {
  const start = parseDate(args.startDate);
  const end = parseDate(args.endDate);
  if (!start || !end) {
    throw new Error("Please enter valid dates in YYYY-MM-DD format.");
  }

  const nights = diffNights(start, end);
  if (nights <= 0) {
    throw new Error("Your stay must be at least 1 night.");
  }

  const subtotal = nights * args.listing.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;

  const booking: WebBooking = {
    id: `web-booking-${Date.now()}`,
    listingId: args.listing.id,
    listingTitle: args.listing.title,
    location: args.listing.location,
    image: args.listing.images[0] ?? "",
    currency: args.listing.currency,
    startDate: args.startDate,
    endDate: args.endDate,
    nights,
    pricePerNight: args.listing.pricePerNight,
    subtotal,
    serviceFee,
    total,
    status: "PENDING",
    paymentStatus: "UNPAID",
    createdAt: new Date().toISOString(),
  };

  const current = getStoredBookings();
  saveStoredBookings([booking, ...current]);
  return booking;
}
