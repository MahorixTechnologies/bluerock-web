import type { WebBooking } from "@/types/models";
import { mockListings } from "@/constants/mock-data";

function toISODate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

function buildBooking(
  id: string,
  listingId: string,
  startOffsetDays: number,
  nights: number,
  status: WebBooking["status"],
  paymentStatus: WebBooking["paymentStatus"],
  todayUtc: Date,
): WebBooking | null {
  const listing = mockListings.find((l) => l.id === listingId);
  if (!listing) return null;
  const start = addDays(todayUtc, startOffsetDays);
  const end = addDays(start, nights);
  const subtotal = nights * listing.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;
  return {
    id,
    listingId,
    listingTitle: listing.title,
    location: listing.location,
    image: listing.images[0] ?? "",
    currency: listing.currency,
    startDate: toISODate(start),
    endDate: toISODate(end),
    nights,
    pricePerNight: listing.pricePerNight,
    subtotal,
    serviceFee,
    total,
    status,
    paymentStatus,
    createdAt: addDays(start, -Math.min(14, nights + 5)).toISOString(),
  };
}

export function makeMockBookings(): WebBooking[] {
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  return [
    buildBooking("mock-wb1", "l4", 12, 3, "CONFIRMED", "PAID", todayUtc),
    buildBooking("mock-wb2", "l1", 4, 2, "PENDING", "UNPAID", todayUtc),
    buildBooking("mock-wb3", "l8", -18, 4, "COMPLETED", "PAID", todayUtc),
    buildBooking("mock-wb4", "l10", -47, 2, "COMPLETED", "PAID", todayUtc),
    buildBooking("mock-wb5", "l2", -92, 6, "CANCELLED", "UNPAID", todayUtc),
  ].filter((b): b is WebBooking => b !== null);
}

export function makeMockOwnerBookings() {
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const renters = [
    { id: "gr-1", email: "amada@example.com", name: "Amanda Okafor", phone: "+2348010000001" },
    { id: "gr-2", email: "tunde@example.com", name: "Tunde Bakare", phone: "+2348010000002" },
    { id: "gr-3", email: "sarah@example.com", name: "Sarah Johnson", phone: "+2348010000003" },
    { id: "gr-4", email: "kofi@example.com", name: "Kofi Mensah", phone: "+2348010000004" },
    { id: "gr-5", email: "zainab@example.com", name: "Zainab Umar", phone: "+2348010000005" },
  ];
  const plans = [
    { id: "mock-ob1", listingId: "l4", renterIdx: 0, startOffset: 12, nights: 5, status: "CONFIRMED" as const, paymentStatus: "PAID" as const },
    { id: "mock-ob2", listingId: "l1", renterIdx: 1, startOffset: 7, nights: 3, status: "PENDING" as const, paymentStatus: "UNPAID" as const },
    { id: "mock-ob3", listingId: "l2", renterIdx: 2, startOffset: -28, nights: 7, status: "COMPLETED" as const, paymentStatus: "PAID" as const },
    { id: "mock-ob4", listingId: "l8", renterIdx: 3, startOffset: -14, nights: 4, status: "COMPLETED" as const, paymentStatus: "PAID" as const },
    { id: "mock-ob5", listingId: "l10", renterIdx: 4, startOffset: -40, nights: 3, status: "REJECTED" as const, paymentStatus: "UNPAID" as const },
  ];
  const bookings = plans
    .map((p) => {
      const listing = mockListings.find((l) => l.id === p.listingId);
      const renter = renters[p.renterIdx];
      if (!listing) return null;
      const start = addDays(todayUtc, p.startOffset);
      const end = addDays(start, p.nights);
      const subtotal = p.nights * listing.pricePerNight;
      const serviceFee = Math.round(subtotal * 0.1);
      const total = subtotal + serviceFee;
      return {
        id: p.id,
        listingId: p.listingId,
        startDate: toISODate(start),
        endDate: toISODate(end),
        nights: p.nights,
        subtotal,
        serviceFee,
        total,
        status: p.status,
        paymentStatus: p.paymentStatus,
        createdAt: addDays(start, -Math.min(14, p.nights + 5)).toISOString(),
        listing: {
          id: listing.id,
          title: listing.title,
          location: listing.location,
          currency: listing.currency,
          pricePerNight: listing.pricePerNight,
        },
        renter: { ...renter },
      };
    })
    .filter((b): b is NonNullable<typeof b> => b !== null);
  return bookings;
}
