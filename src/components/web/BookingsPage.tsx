"use client";

import Link from "next/link";
import { useState } from "react";

import { useWebAuth } from "@/components/web/WebAuthProvider";
import { getStoredBookings } from "@/lib/bookings";
import type { WebBooking } from "@/lib/models";
import { formatMoney } from "@/lib/utils";

import { AppShell } from "./AppShell";

function formatDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function BookingsPage() {
  const { status, profile } = useWebAuth();
  const [bookings] = useState<WebBooking[]>(() => getStoredBookings());
  const totalSpent = bookings.reduce((sum, booking) => sum + booking.total, 0);
  const totalNights = bookings.reduce((sum, booking) => sum + booking.nights, 0);
  const latestBooking = bookings[0] ?? null;

  return (
    <AppShell
      heading="Your bookings"
      subheading="Track upcoming stays, recent reservations, and your total travel activity in a cleaner BlueRock web dashboard."
    >
      {status !== "signedIn" ? (
        <section className="overflow-hidden rounded-[32px] border border-[#dfe6f7] bg-white shadow-[0_20px_50px_rgba(31,41,55,0.07)]">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="bg-linear-to-br from-[#eef1fb] via-white to-[#f6f8ff] px-8 py-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8d96aa]">
                Booking hub
              </p>
              <h2 className="mt-4 max-w-md text-[34px] font-extrabold tracking-[-0.04em] text-[#0f2b71]">
                Log in to unlock your stays
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#667089]">
                Use the same renter or landlord demo accounts from the mobile app to view reservations,
                review totals, and continue your booking journey on web.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "Live booking cards",
                  "Trip summaries",
                  "Cross-platform demo access",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#d9e1f4] bg-white px-4 py-2 text-sm font-bold text-[#546076]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <Link
                href="/login"
                className="mt-8 inline-flex rounded-full bg-[#2b5df3] px-6 py-3 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(43,93,243,0.25)]"
              >
                Go to Login
              </Link>
            </div>

            <div className="grid gap-4 bg-[#fbfcff] p-8 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: "Synced access", value: "Mobile + Web" },
                { label: "Demo-ready", value: "3 accounts" },
                { label: "Booking flow", value: "Live on web" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-[#e7ebf5] bg-white p-5 shadow-[0_12px_28px_rgba(31,41,55,0.04)]"
                >
                  <p className="text-sm font-bold text-[#7a8398]">{item.label}</p>
                  <p className="mt-2 text-[24px] font-extrabold tracking-[-0.03em] text-[#0f2b71]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : bookings.length ? (
        <div className="space-y-6">
          <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[32px] border border-[#dfe6f7] bg-linear-to-br from-[#eef1fb] via-[#f8faff] to-white p-7 shadow-[0_20px_50px_rgba(31,41,55,0.07)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8d96aa]">
                Welcome back
              </p>
              <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="max-w-xl text-[32px] font-extrabold tracking-[-0.04em] text-[#0f2b71]">
                    Your travel activity is looking good
                  </h2>
                  <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#667089]">
                    Signed in as {profile?.email}. Review your latest stay, revisit totals,
                    and continue exploring premium homes from one place.
                  </p>
                </div>
                <Link
                  href="/search"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#2b5df3] px-6 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(43,93,243,0.24)]"
                >
                  Book Another Stay
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {[
                { label: "Total bookings", value: String(bookings.length) },
                { label: "Total nights", value: String(totalNights) },
                {
                  label: "Total spend",
                  value: formatMoney(totalSpent, latestBooking?.currency ?? "NGN"),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-[#e3e7f2] bg-white p-5 shadow-[0_14px_32px_rgba(31,41,55,0.05)]"
                >
                  <p className="text-sm font-bold text-[#7a8398]">{item.label}</p>
                  <p className="mt-2 text-[28px] font-extrabold tracking-[-0.03em] text-[#0f2b71]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {latestBooking ? (
            <section className="rounded-[28px] border border-[#e3e7f2] bg-white p-6 shadow-[0_14px_34px_rgba(31,41,55,0.05)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8d96aa]">
                    Latest reservation
                  </p>
                  <h3 className="mt-2 text-[24px] font-extrabold tracking-[-0.03em] text-[#0f2b71]">
                    {latestBooking.listingTitle}
                  </h3>
                  <p className="mt-2 text-sm text-[#667089]">
                    {formatDisplayDate(latestBooking.startDate)} to{" "}
                    {formatDisplayDate(latestBooking.endDate)} • {latestBooking.nights}{" "}
                    {latestBooking.nights === 1 ? "night" : "nights"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full border border-[#dce3f2] bg-[#f7f8fc] px-4 py-2 text-sm font-bold text-[#546076]">
                    {latestBooking.location}
                  </span>
                  <span className="rounded-full border border-[#dce3f2] bg-[#f7f8fc] px-4 py-2 text-sm font-bold text-[#546076]">
                    Total {formatMoney(latestBooking.total, latestBooking.currency)}
                  </span>
                </div>
              </div>
            </section>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="group overflow-hidden rounded-[28px] border border-[#e3e7f2] bg-white shadow-[0_16px_40px_rgba(31,41,55,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(31,41,55,0.09)]"
              >
                <div className="relative">
                  <img
                    src={booking.image}
                    alt={booking.listingTitle}
                    className="h-[240px] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#081224]/65 via-[#081224]/10 to-transparent" />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
                    <span className="rounded-full bg-white/88 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#0f2b71] backdrop-blur">
                      Confirmed
                    </span>
                    <span className="rounded-full bg-[#2b5df3] px-4 py-2 text-xs font-extrabold text-white shadow-[0_10px_22px_rgba(43,93,243,0.25)]">
                      {formatMoney(booking.total, booking.currency)}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/72">
                      Reserved stay
                    </p>
                    <h2 className="mt-2 text-[24px] font-extrabold tracking-[-0.03em]">
                      {booking.listingTitle}
                    </h2>
                    <p className="mt-1 text-sm text-white/80">{booking.location}</p>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-[#e8ecf5] bg-[#f8faff] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9aa3b5]">
                        Stay window
                      </p>
                      <p className="mt-2 text-sm font-bold text-[#334155]">
                        {formatDisplayDate(booking.startDate)}
                      </p>
                      <p className="text-sm text-[#667089]">
                        to {formatDisplayDate(booking.endDate)}
                      </p>
                    </div>

                    <div className="rounded-[18px] border border-[#e8ecf5] bg-[#f8faff] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9aa3b5]">
                        Booking value
                      </p>
                      <p className="mt-2 text-lg font-extrabold text-[#0f2b71]">
                        {formatMoney(booking.total, booking.currency)}
                      </p>
                      <p className="mt-1 text-sm text-[#7a8398]">
                        Fee {formatMoney(booking.serviceFee, booking.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[18px] bg-[#f7f8fc] px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9aa3b5]">
                        Nights
                      </p>
                      <p className="mt-2 text-base font-extrabold text-[#0f2b71]">
                        {booking.nights}
                      </p>
                    </div>
                    <div className="rounded-[18px] bg-[#f7f8fc] px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9aa3b5]">
                        Per night
                      </p>
                      <p className="mt-2 text-base font-extrabold text-[#0f2b71]">
                        {formatMoney(booking.pricePerNight, booking.currency)}
                      </p>
                    </div>
                    <div className="rounded-[18px] bg-[#f7f8fc] px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9aa3b5]">
                        Created
                      </p>
                      <p className="mt-2 text-base font-extrabold text-[#0f2b71]">
                        {formatDisplayDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1f7] pt-4">
                    <p className="text-sm text-[#667089]">
                      Booking ID: <span className="font-bold text-[#0f2b71]">{booking.id}</span>
                    </p>
                    <Link
                      href={`/listing/${booking.listingId}`}
                      className="inline-flex rounded-full border border-[#dce3f2] bg-[#f7f8fc] px-4 py-2 text-sm font-bold text-[#2b5df3] transition hover:border-[#b8c6f6] hover:bg-[#eef3ff]"
                    >
                      View Listing
                    </Link>
                  </div>
                </div>
              </article>
            ))}
        </div>
        </div>
      ) : (
        <section className="overflow-hidden rounded-[32px] border border-[#e3e7f2] bg-white shadow-[0_18px_44px_rgba(31,41,55,0.06)]">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="bg-linear-to-br from-[#eef1fb] via-white to-[#f7f9ff] px-8 py-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8d96aa]">
                Booking dashboard
              </p>
              <h2 className="mt-4 text-[34px] font-extrabold tracking-[-0.04em] text-[#0f2b71]">
                No bookings yet
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#667089]">
                Start from a listing detail page, choose your dates, and your reservation will
                appear here with a full summary.
              </p>
              <Link
                href="/search"
                className="mt-8 inline-flex rounded-full bg-[#2b5df3] px-6 py-3 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(43,93,243,0.25)]"
              >
                Explore Listings
              </Link>
            </div>

            <div className="grid gap-4 bg-[#fbfcff] p-8 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: "Stay summaries", value: "Ready" },
                { label: "Booking totals", value: "Tracked" },
                { label: "Property revisit", value: "One click" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-[#e7ebf5] bg-white p-5 shadow-[0_12px_28px_rgba(31,41,55,0.04)]"
                >
                  <p className="text-sm font-bold text-[#7a8398]">{item.label}</p>
                  <p className="mt-2 text-[24px] font-extrabold tracking-[-0.03em] text-[#0f2b71]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </AppShell>
  );
}
