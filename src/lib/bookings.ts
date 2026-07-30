"use client";

import type { Listing, WebBooking } from "./models";
import { diffNights, parseDate } from "./utils";

const STORAGE_KEY = "bluerock.web.bookings.v1";

export function getStoredBookings() {
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
    createdAt: new Date().toISOString(),
  };

  const current = getStoredBookings();
  saveStoredBookings([booking, ...current]);
  return booking;
}
