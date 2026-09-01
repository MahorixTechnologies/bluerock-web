"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { fetchOwnerBookings } from "@/api/bookings";
import { fetchOwnerPayouts, type Payout } from "@/api/payouts";
import { useListings } from "@/hooks/useListings";
import type { OwnerBooking } from "@/types/models";
import { formatMoney } from "@/utils";
import { useWebAuth } from "@/providers/WebAuthProvider";

import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";

function ListingRow({
  listing,
  bookingsForListing,
}: {
  listing: { id: string; title: string; location: string; image: string; pricePerNight: number; currency: "USD" | "NGN"; status?: string };
  bookingsForListing: OwnerBooking[];
}) {
  const revenue = bookingsForListing
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.total, 0);
  const nights = bookingsForListing
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.nights, 0);

  return (
    <div className="grid grid-cols-[1.6fr_1.2fr_0.9fr_1fr] items-center gap-4 border-b border-[var(--border)] px-4 py-4 last:border-b-0 sm:px-6">
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel-soft)]">
          {listing.image ? (
            <Image src={listing.image} alt={listing.title} fill sizes="56px" className="object-cover" />
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--text)]">{listing.title}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{listing.location}</p>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-2)]">Rate</p>
        <p className="mt-1 text-sm font-black tabular-nums text-[var(--text)]">
          {formatMoney(listing.pricePerNight, listing.currency)}
          <span className="ml-1 text-xs font-semibold text-[var(--muted)]">/night</span>
        </p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-2)]">Booked Nights</p>
        <p className="mt-1 text-sm font-black tabular-nums text-[var(--primary)]">{nights}</p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-2)]">Revenue</p>
        <p className="mt-1 text-sm font-black tabular-nums text-[var(--text)]">
          {formatMoney(revenue, listing.currency)}
        </p>
      </div>
    </div>
  );
}

function BookingRow({ booking }: { booking: OwnerBooking }) {
  const statusStyle =
    booking.status === "CONFIRMED"
      ? "bg-[var(--trend-up-bg)] text-[var(--trend-up)]"
      : booking.status === "PENDING"
        ? "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]"
        : "bg-[rgba(107,114,128,0.12)] text-[var(--muted)]";

  return (
    <div className="grid grid-cols-[1.4fr_1.4fr_1fr_0.8fr_1fr_0.9fr] items-center gap-4 border-b border-[var(--border)] px-4 py-4 last:border-b-0 sm:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-[var(--text)]">
          {booking.renter.name?.trim() || booking.renter.email}
        </p>
        <p className="mt-0.5 truncate text-xs text-[var(--muted)]">Booking {booking.id.slice(0, 8)}</p>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--text)]">{booking.listing.title}</p>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          {booking.startDate} · {booking.nights} nights
        </p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-2)]">Check-in</p>
        <p className="mt-1 text-sm font-bold tabular-nums text-[var(--text)]">{booking.startDate}</p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-2)]">Nights</p>
        <p className="mt-1 text-sm font-black tabular-nums text-[var(--primary)]">{booking.nights}</p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-2)]">Payout</p>
        <p className="mt-1 text-sm font-black tabular-nums text-[var(--text)]">
          {formatMoney(booking.total, booking.listing.currency)}
        </p>
      </div>
      <span
        className={`justify-self-end inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${statusStyle}`}
      >
        {booking.status}
      </span>
    </div>
  );
}

function PayoutRow({ payout }: { payout: Payout }) {
  const statusStyle =
    payout.status === "PAID"
      ? "bg-[var(--trend-up-bg)] text-[var(--trend-up)]"
      : payout.status === "FAILED"
        ? "bg-[var(--danger-soft)] text-[var(--danger)]"
        : "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]";
  return (
    <div className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr] items-center gap-4 border-b border-[var(--border)] px-4 py-4 last:border-b-0 sm:px-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-2)]">Date</p>
        <p className="mt-1 text-sm font-bold tabular-nums text-[var(--text)]">
          {new Date(payout.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-[var(--text)]">{payout.reference}</p>
        <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{payout.provider}</p>
      </div>
      <span
        className={`justify-self-start inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${statusStyle}`}
      >
        {payout.status}
      </span>
      <p className="justify-self-end text-sm font-black tabular-nums text-[var(--primary)]">
        {formatMoney(payout.amount, payout.currency)}
      </p>
    </div>
  );
}

export function LandlordDashboard() {
  const { accessToken, profile } = useWebAuth();
  const { data: listings, loading: listingsLoading, error: listingsError } = useListings({
    token: accessToken,
    scope: "mine",
  });
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutsError, setPayoutsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const [bookingsResult, payoutsResult] = await Promise.allSettled([
        fetchOwnerBookings(accessToken),
        fetchOwnerPayouts(accessToken),
      ]);
      if (cancelled) return;
      if (bookingsResult.status === "fulfilled") {
        setBookings(bookingsResult.value);
      } else {
        setBookingsError(
          bookingsResult.reason instanceof Error ? bookingsResult.reason.message : "Failed to load bookings",
        );
      }
      if (payoutsResult.status === "fulfilled") {
        setPayouts(payoutsResult.value);
      } else {
        setPayoutsError(
          payoutsResult.reason instanceof Error ? payoutsResult.reason.message : "Failed to load payouts",
        );
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const sharedCurrency = listings[0]?.currency ?? payouts[0]?.currency ?? "NGN";
  const totalRevenue = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.total, 0);
  const pendingPayoutTotal = payouts
    .filter((p) => p.status === "PENDING" || p.status === "PROCESSING")
    .reduce((sum, p) => sum + p.amount, 0);
  const paidPayoutTotal = payouts
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const recentBookings = [...bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const recentPayouts = [...payouts]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  return (
    <AppShell
      heading="Host Dashboard"
      subheading="Manage listings, guest bookings and payouts in one place"
    >
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            eyebrow="Listings"
            value={listingsLoading ? "—" : String(listings.length)}
            icon="🏢"
            tint="var(--primary)"
          />
          <StatCard
            eyebrow="Guest Bookings"
            value={loading ? "—" : String(bookings.length)}
            icon="👥"
            tint="var(--primary)"
          />
          <StatCard
            eyebrow="Confirmed Revenue"
            value={loading ? "—" : formatMoney(totalRevenue, sharedCurrency)}
            icon="💰"
            tint="var(--primary)"
          />
          <StatCard
            eyebrow="Paid Out"
            value={loading ? "—" : formatMoney(paidPayoutTotal, sharedCurrency)}
            icon="✓"
            tint="var(--trend-up)"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
            <div className="flex flex-col gap-3 border-b border-[var(--border)] px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Welcome back
                </p>
                <h2 className="mt-2 text-[26px] font-black tracking-tight text-[var(--text)]">
                  {profile?.name?.trim() || profile?.email}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                  Here&apos;s a live snapshot of your properties, guest bookings and payouts.
                </p>
              </div>
              <Link
                href="/host/payouts"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--sidebar)] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(10,42,140,0.25)] transition hover:bg-[#07206E]"
              >
                View Payouts <span>→</span>
              </Link>
            </div>
            <div className="px-6 py-6">
              {listingsError ? (
                <p className="text-sm font-semibold text-[var(--danger)]">⚠ {listingsError}</p>
              ) : bookingsError ? (
                <p className="text-sm font-semibold text-[var(--danger)]">⚠ {bookingsError}</p>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  {listings.length} listing{listings.length === 1 ? "" : "s"} · {bookings.length} guest
                  booking{bookings.length === 1 ? "" : "s"} on record.
                </p>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Pending Payouts
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-[26px] font-black tracking-tight text-[var(--text)]">
                    {loading ? "—" : formatMoney(pendingPayoutTotal, sharedCurrency)}
                  </p>
                </div>
              </div>
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                style={{ background: "rgba(30, 91, 255, 0.12)", color: "var(--primary)" }}
              >
                💳
              </span>
            </div>
            {payoutsError ? (
              <p className="mt-4 text-xs font-semibold text-[var(--danger)]">⚠ {payoutsError}</p>
            ) : (
              <p className="mt-4 text-xs text-[var(--muted)]">
                {payouts.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").length}{" "}
                payout{payouts.length === 1 ? "" : "s"} awaiting disbursement.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[20px] font-black tracking-tight text-[var(--text)]">My Listings</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Booked nights and confirmed revenue for every property.
              </p>
            </div>
            <Link
              href="/host/listings"
              className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-[var(--primary)] px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[var(--primary-600)]"
            >
              + New Listing
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-[1.6fr_1.2fr_0.9fr_1fr] items-center gap-4 border-b border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 sm:px-6">
              {["Property", "Rate", "Booked Nights", "Revenue"].map((header) => (
                <p key={header} className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {header}
                </p>
              ))}
            </div>
            {listingsLoading ? (
              <p className="px-6 py-8 text-sm font-semibold text-[var(--muted)]">Loading listings…</p>
            ) : listings.length ? (
              listings.slice(0, 4).map((listing) => (
                <ListingRow
                  key={listing.id}
                  listing={{
                    id: listing.id,
                    title: listing.title,
                    location: listing.location,
                    image: listing.images[0] ?? "",
                    pricePerNight: listing.pricePerNight,
                    currency: listing.currency,
                  }}
                  bookingsForListing={bookings.filter((b) => b.listingId === listing.id)}
                />
              ))
            ) : (
              <p className="px-6 py-8 text-sm text-[var(--muted)]">
                You haven&apos;t published any listings yet.
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-black tracking-tight text-[var(--text)]">
                  Recent Guest Bookings
                </h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Latest confirmed, pending and completed guest stays.
                </p>
              </div>
              <Link
                href="/host/bookings"
                className="inline-flex items-center gap-1 text-sm font-bold text-[var(--primary)] transition hover:text-[var(--primary-600)]"
              >
                See all <span>→</span>
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
              <div className="grid grid-cols-[1.4fr_1.4fr_1fr_0.8fr_1fr_0.9fr] items-center gap-4 border-b border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 sm:px-6">
                {["Guest", "Property", "Check-in", "Nights", "Payout", "Status"].map((header) => (
                  <p key={header} className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                    {header}
                  </p>
                ))}
              </div>
              {loading ? (
                <p className="px-6 py-8 text-sm font-semibold text-[var(--muted)]">Loading bookings…</p>
              ) : recentBookings.length ? (
                recentBookings.map((booking) => <BookingRow key={booking.id} booking={booking} />)
              ) : (
                <p className="px-6 py-8 text-sm text-[var(--muted)]">No guest bookings yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-black tracking-tight text-[var(--text)]">Payout History</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Disbursements to your connected bank/wallet account.
                </p>
              </div>
              <Link
                href="/host/payouts"
                className="inline-flex items-center gap-1 text-sm font-bold text-[var(--primary)] transition hover:text-[var(--primary-600)]"
              >
                See all <span>→</span>
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
              <div className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr] items-center gap-4 border-b border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 sm:px-6">
                {["Date", "Reference", "Status", "Amount"].map((header) => (
                  <p key={header} className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                    {header}
                  </p>
                ))}
              </div>
              {loading ? (
                <p className="px-6 py-8 text-sm font-semibold text-[var(--muted)]">Loading payouts…</p>
              ) : recentPayouts.length ? (
                recentPayouts.map((payout) => <PayoutRow key={payout.id} payout={payout} />)
              ) : (
                <p className="px-6 py-8 text-sm text-[var(--muted)]">
                  No payouts yet — they appear here after a guest checks out of a paid stay.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
