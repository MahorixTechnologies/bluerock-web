import Link from "next/link";

import { mockListings } from "@/lib/mock-data";
import { formatMoney } from "@/lib/utils";

import { AppShell } from "./AppShell";

type HostStat = {
  label: string;
  value: string;
  trend: number;
  trendDirection: "up" | "down";
  delta: string;
  icon: string;
  iconBg: string;
  iconColor: string;
};

type HostListing = {
  id: string;
  title: string;
  location: string;
  image: string;
  pricePerNight: number;
  currency: "USD" | "NGN";
  occupancy: number;
  status: "Active" | "Paused" | "Pending";
  totalNights: number;
  totalRevenue: number;
};

type HostBooking = {
  id: string;
  guest: string;
  listingTitle: string;
  startDate: string;
  nights: number;
  status: "Confirmed" | "Pending" | "Completed";
  total: number;
  currency: "USD" | "NGN";
};

function HostStatCard({ card }: { card: HostStat }) {
  const trendBadge =
    card.trendDirection === "up"
      ? "bg-[var(--trend-up-bg)] text-[var(--trend-up)]"
      : "bg-[var(--trend-down-bg)] text-[var(--trend-down)]";
  const trendArrow = card.trendDirection === "up" ? "⦿" : "⊖";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">
            {card.label}
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-[28px] font-black tracking-tight text-[#111827]">
              {card.value}
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${trendBadge}`}
            >
              <span className="text-[10px]">{trendArrow}</span>
              {Math.abs(card.trend)}%
            </span>
          </div>
        </div>
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-300 group-hover:scale-105"
          style={{ background: card.iconBg, color: card.iconColor }}
        >
          {card.icon}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
        <p className="text-xs font-semibold text-[#6b7280]">
          <span className="text-[#1E5BFF]">{card.delta}</span> vs last 30 days
        </p>
        <span className="text-[#6b7280] transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </div>
  );
}

function HostListingRow({ listing }: { listing: HostListing }) {
  const statusStyle =
    listing.status === "Active"
      ? "bg-[var(--trend-up-bg)] text-[var(--trend-up)]"
      : listing.status === "Paused"
        ? "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]"
        : "bg-[rgba(107,114,128,0.12)] text-[#6b7280]";

  return (
    <div className="grid grid-cols-[1.6fr_1.2fr_0.8fr_1fr_1fr] items-center gap-4 border-b border-[var(--border)] px-4 py-4 last:border-b-0 sm:px-6">
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel-soft)]">
          <img
            src={listing.image}
            alt={listing.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#111827]">{listing.title}</p>
          <p className="mt-0.5 truncate text-xs text-[#6b7280]">{listing.location}</p>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9ca3af]">
          Rate
        </p>
        <p className="mt-1 text-sm font-black tabular-nums text-[#111827]">
          {formatMoney(listing.pricePerNight, listing.currency)}
          <span className="ml-1 text-xs font-semibold text-[#6b7280]">/night</span>
        </p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9ca3af]">
          Occupancy
        </p>
        <p className="mt-1 text-sm font-black tabular-nums text-[#1E5BFF]">
          {listing.occupancy}%
        </p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9ca3af]">
          Booked Nights
        </p>
        <p className="mt-1 text-sm font-black tabular-nums text-[#111827]">
          {listing.totalNights}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9ca3af]">
            Revenue
          </p>
          <p className="mt-1 text-sm font-black tabular-nums text-[#111827]">
            {formatMoney(listing.totalRevenue, listing.currency)}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${statusStyle}`}
        >
          {listing.status}
        </span>
      </div>
    </div>
  );
}

function HostBookingRow({ booking }: { booking: HostBooking }) {
  const statusStyle =
    booking.status === "Confirmed"
      ? "bg-[var(--trend-up-bg)] text-[var(--trend-up)]"
      : booking.status === "Pending"
        ? "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]"
        : "bg-[rgba(107,114,128,0.12)] text-[#6b7280]";

  return (
    <div className="grid grid-cols-[1.4fr_1.4fr_1fr_0.8fr_1fr_0.9fr] items-center gap-4 border-b border-[var(--border)] px-4 py-4 last:border-b-0 sm:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-[#111827]">{booking.guest}</p>
        <p className="mt-0.5 truncate text-xs text-[#6b7280]">Booking {booking.id}</p>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#111827]">
          {booking.listingTitle}
        </p>
        <p className="mt-0.5 text-xs text-[#6b7280]">{booking.startDate} · {booking.nights} nights</p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9ca3af]">
          Check-in
        </p>
        <p className="mt-1 text-sm font-bold tabular-nums text-[#111827]">
          {booking.startDate}
        </p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9ca3af]">
          Nights
        </p>
        <p className="mt-1 text-sm font-black tabular-nums text-[#1E5BFF]">
          {booking.nights}
        </p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9ca3af]">
          Payout
        </p>
        <p className="mt-1 text-sm font-black tabular-nums text-[#111827]">
          {formatMoney(booking.total, booking.currency)}
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

function PayoutHistoryRow({
  date,
  label,
  method,
  amount,
  status,
  currency,
}: {
  date: string;
  label: string;
  method: string;
  amount: number;
  status: "Paid" | "Pending";
  currency: "USD" | "NGN";
}) {
  const statusStyle =
    status === "Paid"
      ? "bg-[var(--trend-up-bg)] text-[var(--trend-up)]"
      : "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]";
  return (
    <div className="grid grid-cols-[1.4fr_1.6fr_1fr_1fr_1fr] items-center gap-4 border-b border-[var(--border)] px-4 py-4 last:border-b-0 sm:px-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9ca3af]">
          Date
        </p>
        <p className="mt-1 text-sm font-bold tabular-nums text-[#111827]">{date}</p>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-[#111827]">{label}</p>
        <p className="mt-0.5 truncate text-xs text-[#6b7280]">{method}</p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9ca3af]">
          Method
        </p>
        <p className="mt-1 text-sm font-semibold text-[#111827]">{method}</p>
      </div>
      <span
        className={`justify-self-start inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${statusStyle}`}
      >
        {status}
      </span>
      <p className="justify-self-end text-sm font-black tabular-nums text-[#1E5BFF]">
        +{formatMoney(amount, currency)}
      </p>
    </div>
  );
}

export function LandlordDashboard() {
  const hostListings: HostListing[] = mockListings.slice(0, 4).map((listing, i) => ({
    id: listing.id,
    title: listing.title,
    location: listing.location,
    image: listing.images[0] ?? "",
    pricePerNight: listing.pricePerNight,
    currency: listing.currency,
    occupancy: [92, 78, 65, 84][i] ?? 70,
    status: (["Active", "Active", "Active", "Pending"] as const)[i] ?? "Active",
    totalNights: [28, 24, 18, 22][i] ?? 20,
    totalRevenue: [listing.pricePerNight * 28, listing.pricePerNight * 24, listing.pricePerNight * 18, listing.pricePerNight * 22][i] ?? 0,
  }));

  const hostBookings: HostBooking[] = [
    {
      id: "BK-2048",
      guest: "Amanda Okafor",
      listingTitle: "Aurora Retreat",
      startDate: "2026-08-14",
      nights: 5,
      status: "Confirmed",
      total: 1750,
      currency: "USD",
    },
    {
      id: "BK-2047",
      guest: "Tunde Bakare",
      listingTitle: "Palmview Estate",
      startDate: "2026-08-09",
      nights: 3,
      status: "Pending",
      total: 840,
      currency: "USD",
    },
    {
      id: "BK-2046",
      guest: "Sarah Johnson",
      listingTitle: "The Courtyard Villa",
      startDate: "2026-08-03",
      nights: 7,
      status: "Completed",
      total: 2240,
      currency: "USD",
    },
    {
      id: "BK-2045",
      guest: "Kofi Mensah",
      listingTitle: "Ocean Breeze Villa",
      startDate: "2026-07-28",
      nights: 4,
      status: "Completed",
      total: 1160,
      currency: "USD",
    },
  ];

  const hostStats: HostStat[] = [
    {
      label: "Monthly Revenue",
      value: "$24,850",
      trend: 18.2,
      trendDirection: "up",
      delta: "+$3,820",
      icon: "💰",
      iconBg: "rgba(30, 91, 255, 0.12)",
      iconColor: "#1E5BFF",
    },
    {
      label: "Occupancy Rate",
      value: "80.4%",
      trend: 6.1,
      trendDirection: "up",
      delta: "+4.6%",
      icon: "🏠",
      iconBg: "rgba(30, 91, 255, 0.10)",
      iconColor: "#1E5BFF",
    },
    {
      label: "Active Listings",
      value: String(hostListings.filter((l) => l.status === "Active").length),
      trend: 12.5,
      trendDirection: "up",
      delta: "+1",
      icon: "🏢",
      iconBg: "rgba(59, 130, 246, 0.12)",
      iconColor: "#3b82f6",
    },
    {
      label: "Guest Bookings",
      value: "37",
      trend: 2.4,
      trendDirection: "down",
      delta: "-1",
      icon: "👥",
      iconBg: "rgba(236, 72, 153, 0.10)",
      iconColor: "#ec4899",
    },
  ];

  const upcomingPayable = hostBookings
    .filter((b) => b.status === "Confirmed" || b.status === "Completed")
    .reduce((sum, b) => sum + b.total, 0);

  return (
    <AppShell
      heading="Host Dashboard"
      subheading="Manage listings, guest bookings and payouts in one place"
    >
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {hostStats.map((card) => (
            <HostStatCard key={card.label} card={card} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
            <div className="flex flex-col gap-3 border-b border-[var(--border)] px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">
                  Revenue Snapshot
                </p>
                <h2 className="mt-2 text-[26px] font-black tracking-tight text-[#111827]">
                  Track your earnings
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#6b7280]">
                  Monthly revenue, occupancy and payout trends across every property you host.
                </p>
              </div>
              <Link
                href="/host/payouts"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0A2A8C] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(10,42,140,0.25)] transition hover:bg-[#07206E]"
              >
                View Payouts <span>→</span>
              </Link>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-5">
                {[
                  { label: "Jan", pct: "62%", value: "$14,200" },
                  { label: "Feb", pct: "74%", value: "$16,850" },
                  { label: "Mar", pct: "68%", value: "$15,400" },
                  { label: "Apr", pct: "82%", value: "$18,960" },
                  { label: "May", pct: "90%", value: "$21,100" },
                  { label: "Jun", pct: "96%", value: "$24,850" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <p className="w-10 text-sm font-black tracking-wide text-[#6b7280]">
                          {item.label}
                        </p>
                        <div className="flex-1">
                          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--panel-soft)]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#1E5BFF] to-[#7CA8FF]"
                              style={{ width: item.pct }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-black tabular-nums text-[#111827]">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">
                    Next Payout
                  </p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <p className="text-[26px] font-black tracking-tight text-[#111827]">
                      ${upcomingPayable.toLocaleString()}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--trend-up-bg)] px-2 py-0.5 text-[11px] font-bold text-[var(--trend-up)]">
                      ⦿ 14.2%
                    </span>
                  </div>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ background: "rgba(30, 91, 255, 0.12)", color: "#1E5BFF" }}>
                  💳
                </span>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[#6b7280]">Confirmed stays</p>
                  <p className="font-bold tabular-nums text-[#111827]">
                    ${hostBookings.filter((b) => b.status === "Confirmed").reduce((s, b) => s + b.total, 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[#6b7280]">Service fee (5%)</p>
                  <p className="font-bold tabular-nums text-[#ef4444]">
                    -${Math.round(upcomingPayable * 0.05).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#9ca3af]">
                    Deposits Friday
                  </p>
                  <p className="text-base font-black tabular-nums text-[#1E5BFF]">
                    ${Math.round(upcomingPayable * 0.95).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[#0A2A8C] via-[#0E3298] to-[#1442C4] p-5 shadow-[0_12px_32px_rgba(10,42,140,0.35)] text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7CA8FF]/70">
                    List more
                  </p>
                  <h3 className="mt-2 text-[22px] font-black tracking-tight">
                    Host Plan Pro
                  </h3>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0A2A8C] shadow transition hover:bg-[#EDF3FF]"
                >
                  Upgrade
                </button>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/80">
                Promote properties to Featured, zero service fees on stays, priority
                placements and instant payout on checkout.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-white/5 p-3">
                <div>
                  <p className="text-xs font-semibold text-white/60">Service fees</p>
                  <p className="mt-1 text-lg font-black text-white">
                    <span className="text-[#7CA8FF]">0%</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/60">Featured slots</p>
                  <p className="mt-1 text-lg font-black text-white">🏠 ∞</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[20px] font-black tracking-tight text-[#111827]">
                My Listings
              </h3>
              <p className="mt-1 text-sm text-[#6b7280]">
                Occupancy, booked nights and lifetime revenue for every property.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[#111827] transition hover:bg-[var(--panel-soft)]"
              >
                Export
              </button>
              <Link
                href="/host/listings"
                className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-[#1E5BFF] px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[#1849D6]"
              >
                + New Listing
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-[1.6fr_1.2fr_0.8fr_1fr_1fr] items-center gap-4 border-b border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 sm:px-6">
              {["Property", "Rate", "Occupancy", "Booked Nights", "Revenue"].map((header) => (
                <p
                  key={header}
                  className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b7280]"
                >
                  {header}
                </p>
              ))}
            </div>
            {hostListings.map((listing) => (
              <HostListingRow key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-black tracking-tight text-[#111827]">
                  Recent Guest Bookings
                </h3>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Latest confirmed, pending and completed guest stays.
                </p>
              </div>
              <Link
                href="/host/bookings"
                className="inline-flex items-center gap-1 text-sm font-bold text-[#1E5BFF] transition hover:text-[#1849D6]"
              >
                See all <span>→</span>
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
              <div className="grid grid-cols-[1.4fr_1.4fr_1fr_0.8fr_1fr_0.9fr] items-center gap-4 border-b border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 sm:px-6">
                {["Guest", "Property", "Check-in", "Nights", "Payout", "Status"].map((header) => (
                  <p
                    key={header}
                    className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b7280]"
                  >
                    {header}
                  </p>
                ))}
              </div>
              {hostBookings.map((booking) => (
                <HostBookingRow key={booking.id} booking={booking} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-black tracking-tight text-[#111827]">
                  Payout History
                </h3>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Weekly disbursements — bank transfer and wallet payouts.
                </p>
              </div>
              <Link
                href="/host/payouts"
                className="inline-flex items-center gap-1 text-sm font-bold text-[#1E5BFF] transition hover:text-[#1849D6]"
              >
                See all <span>→</span>
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
              <div className="grid grid-cols-[1.4fr_1.6fr_1fr_1fr_1fr] items-center gap-4 border-b border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 sm:px-6">
                {["Date", "Batch", "Method", "Status", "Amount"].map((header) => (
                  <p
                    key={header}
                    className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b7280]"
                  >
                    {header}
                  </p>
                ))}
              </div>
              <PayoutHistoryRow
                date="2026-07-31"
                label="Weekly batch · BK-2046 / BK-2045"
                method="Bank Transfer"
                amount={3080}
                status="Paid"
                currency="USD"
              />
              <PayoutHistoryRow
                date="2026-07-24"
                label="Weekly batch · BK-2043 / BK-2042"
                method="Bank Transfer"
                amount={2620}
                status="Paid"
                currency="USD"
              />
              <PayoutHistoryRow
                date="2026-08-07"
                label="Weekly batch · BK-2048 / BK-2047"
                method="Wallet Balance"
                amount={Math.round((1750 + 840) * 0.95)}
                status="Pending"
                currency="USD"
              />
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
