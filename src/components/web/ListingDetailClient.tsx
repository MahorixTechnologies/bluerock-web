"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useWebAuth } from "@/components/web/WebAuthProvider";
import { createBookingFromListing } from "@/lib/bookings";
import type { Listing } from "@/lib/models";
import { diffNights, formatMoney, initialsFor, parseDate } from "@/lib/utils";

export function ListingDetailClient({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { status, profile } = useWebAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const summary = useMemo(() => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) return null;
    const nights = diffNights(start, end);
    if (nights <= 0) return null;
    const subtotal = nights * listing.pricePerNight;
    const serviceFee = Math.round(subtotal * 0.1);
    const total = subtotal + serviceFee;
    return { nights, subtotal, serviceFee, total };
  }, [endDate, listing.pricePerNight, startDate]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="h-[380px] w-full rounded-[28px] object-cover shadow-[0_18px_40px_rgba(31,41,55,0.12)]"
          />
          <div className="grid gap-4">
            {listing.images.slice(1, 3).map((image) => (
              <img
                key={image}
                src={image}
                alt={listing.title}
                className="h-[182px] w-full rounded-[24px] object-cover shadow-[0_14px_34px_rgba(31,41,55,0.08)]"
              />
            ))}
          </div>
        </div>

        <section className="rounded-[28px] border border-[#e3e7f2] bg-white p-6 shadow-[0_14px_34px_rgba(31,41,55,0.05)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-[34px] font-extrabold tracking-[-0.04em] text-[#0f2b71]">
                {listing.title}
              </h1>
              <p className="mt-2 text-[15px] text-[#667089]">
                {listing.location} · {listing.type}
              </p>
            </div>

            <div className="rounded-full bg-[#2b5df3] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(43,93,243,0.25)]">
              {formatMoney(listing.pricePerNight, listing.currency)} / night
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-full bg-[#f7f8fc] px-4 py-2 text-sm font-bold text-[#546076]">
              {listing.rooms} rooms
            </span>
            <span className="rounded-full bg-[#f7f8fc] px-4 py-2 text-sm font-bold text-[#546076]">
              {listing.bathrooms} baths
            </span>
            <span className="rounded-full bg-[#f7f8fc] px-4 py-2 text-sm font-bold text-[#546076]">
              {listing.type}
            </span>
          </div>
        </section>

        {listing.description ? (
          <section className="rounded-[28px] border border-[#e3e7f2] bg-white p-6 shadow-[0_14px_34px_rgba(31,41,55,0.05)]">
            <h2 className="text-xl font-extrabold text-[#0f2b71]">About this place</h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-8 text-[#667089]">
              {listing.description}
            </p>
          </section>
        ) : null}

        <section className="rounded-[28px] border border-[#e3e7f2] bg-white p-6 shadow-[0_14px_34px_rgba(31,41,55,0.05)]">
          <h2 className="text-xl font-extrabold text-[#0f2b71]">Amenities</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {listing.amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full border border-[#dce3f2] bg-[#f7f8fc] px-4 py-2 text-sm font-bold text-[#546076]"
              >
                {amenity}
              </span>
            ))}
          </div>
        </section>

        {listing.rules?.length ? (
          <section className="rounded-[28px] border border-[#e3e7f2] bg-white p-6 shadow-[0_14px_34px_rgba(31,41,55,0.05)]">
            <h2 className="text-xl font-extrabold text-[#0f2b71]">House rules</h2>
            <div className="mt-4 space-y-3">
              {listing.rules.map((rule) => (
                <p key={rule} className="text-[15px] text-[#667089]">
                  • {rule}
                </p>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-[28px] border border-[#e3e7f2] bg-white p-6 shadow-[0_14px_34px_rgba(31,41,55,0.05)]">
          <h2 className="text-xl font-extrabold text-[#0f2b71]">Hosted by</h2>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ebf1ff] text-lg font-extrabold text-[#2b5df3]">
              {initialsFor(listing.host.name)}
            </span>
            <div>
              <p className="text-lg font-bold text-[#0f2b71]">{listing.host.name}</p>
              {listing.host.phone ? (
                <p className="mt-1 text-sm text-[#667089]">{listing.host.phone}</p>
              ) : null}
            </div>
          </div>
          <p className="mt-4 text-[15px] text-[#667089]">{listing.availabilityNote}</p>
        </section>
      </div>

      <aside className="h-fit rounded-[28px] border border-[#e3e7f2] bg-white p-6 shadow-[0_14px_34px_rgba(31,41,55,0.05)]">
        <h2 className="text-xl font-extrabold text-[#0f2b71]">Book a room</h2>
        {status !== "signedIn" ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-[#7a8398]">
              Log in with the same seeded mobile demo accounts to create bookings on web.
            </p>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-full bg-[#2b5df3] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(43,93,243,0.25)]"
            >
              Log In to Book
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-[#7a8398]">
              Signed in as {profile?.email}. Use the same date-and-summary booking flow from mobile.
            </p>

            <div className="mt-5 space-y-4">
              <input
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                placeholder="Start date (YYYY-MM-DD)"
                className="w-full rounded-[16px] border border-[#e1e6f1] bg-[#f7f8fc] px-4 py-3 text-sm text-[#1d2433] outline-none focus:border-[#9db3fa]"
              />
              <input
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                placeholder="End date (YYYY-MM-DD)"
                className="w-full rounded-[16px] border border-[#e1e6f1] bg-[#f7f8fc] px-4 py-3 text-sm text-[#1d2433] outline-none focus:border-[#9db3fa]"
              />

              {summary ? (
                <div className="rounded-[22px] border border-[#e1e6f1] bg-[#f7f8fc] p-4">
                  {[
                    ["Nights", String(summary.nights)],
                    ["Subtotal", formatMoney(summary.subtotal, listing.currency)],
                    ["Service fee", formatMoney(summary.serviceFee, listing.currency)],
                    ["Total", formatMoney(summary.total, listing.currency)],
                  ].map(([label, value], index) => (
                    <div
                      key={label}
                      className={`flex items-center justify-between py-2 text-sm ${
                        index === 3 ? "font-extrabold text-[#0f2b71]" : "text-[#546076]"
                      }`}
                    >
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#7a8398]">
                  Enter valid dates to see a price breakdown.
                </p>
              )}

              {error ? <p className="text-sm font-bold text-[#d9485f]">{error}</p> : null}

              <button
                type="button"
                disabled={!summary || busy}
                onClick={() => {
                  setError(null);
                  if (!summary) {
                    setError("Please enter valid dates with at least 1 night.");
                    return;
                  }

                  try {
                    setBusy(true);
                    createBookingFromListing({ listing, startDate, endDate });
                    router.push("/bookings");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Booking failed.");
                  } finally {
                    setBusy(false);
                  }
                }}
                className="w-full rounded-full bg-[#2b5df3] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(43,93,243,0.25)] disabled:cursor-not-allowed disabled:bg-[#9bb4fb]"
              >
                {busy ? "Creating booking..." : "Confirm Booking"}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
