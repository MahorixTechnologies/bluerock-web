"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import {
  BookingDetailCard,
  BookingTimeline,
  EmptyBookingsState,
} from "@/components/feature/booking";
import { useWebAuth } from "@/providers/WebAuthProvider";
import { fetchMyBookings } from "@/api/bookings";
import type { WebBooking } from "@/types/models";
import { formatMoney } from "@/utils";

export default function BookingDetailPage() {
  const { id } = useParams();
  const bookingId = typeof id === "string" ? id : null;
  const { accessToken } = useWebAuth();
  const [booking, setBooking] = useState<WebBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const all = await fetchMyBookings(accessToken);
        if (cancelled) return;
        setBooking(all.find((b) => b.id === bookingId) ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [accessToken, bookingId]);

  return (
    <AppShell
      heading="Booking details"
      subheading="View your reservation summary and payment status"
    >
      {loading ? (
        <section className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            <p className="text-sm font-semibold text-[var(--muted)]">
              Loading booking details…
            </p>
          </div>
        </section>
      ) : !booking ? (
        <EmptyBookingsState mode="renter" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div>
            <BookingDetailCard booking={booking} />
          </div>
          <div className="space-y-6">
            <BookingTimeline booking={booking} />
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-soft)] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted-2)]">
                Listing info
              </p>
              <h3 className="mt-2 text-[18px] font-black tracking-tight text-[var(--text)]">
                {booking.listingTitle}
              </h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[var(--muted)]">📍</span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-2)]">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-[#374151]">
                      {booking.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[var(--muted)]">🏠</span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-2)]">
                      Stay
                    </p>
                    <p className="text-sm font-semibold text-[#374151]">
                      {booking.nights}{" "}
                      {booking.nights === 1 ? "night" : "nights"} ·{" "}
                      {formatMoney(booking.pricePerNight, booking.currency)}/night
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
