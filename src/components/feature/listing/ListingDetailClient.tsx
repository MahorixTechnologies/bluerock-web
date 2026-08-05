"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PaymentIntentDialog } from "@/components/feature/payment/PaymentIntentDialog";
import { useWebAuth } from "@/providers/WebAuthProvider";
import { createBookingFromListing, createBookingOnApi } from "@/api/bookings";
import type { Listing, PaymentIntent, WebBooking } from "@/types/models";
import { confirmPayment, createPaymentIntent } from "@/api/payments";
import { diffNights, formatMoney, initialsFor, parseDate } from "@/utils";

export function ListingDetailClient({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { status, profile, accessToken } = useWebAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<WebBooking | null>(null);
  const [currentIntent, setCurrentIntent] = useState<PaymentIntent | null>(null);

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

  const fieldClass =
    "flex h-12 w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-3.5 text-sm text-[#111827] outline-none transition-all duration-200 focus:border-[#1E5BFF] focus:bg-white focus:ring-4 focus:ring-[#1E5BFF]/10";

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="h-[380px] w-full object-cover"
            />
            <div className="absolute left-5 top-5 flex items-center gap-2">
              <span className="rounded-full bg-white/90 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#0A2A8C] shadow backdrop-blur">
                {listing.type}
              </span>
              {listing.featured ? (
                <span className="rounded-full bg-[#7CA8FF] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#081866] shadow-[0_4px_12px_rgba(124,168,255,0.4)]">
                  Featured
                </span>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4">
            {listing.images.slice(1, 3).map((image, i) => (
              <div key={image} className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
                <img
                  src={image}
                  alt={listing.title}
                  className="h-[182px] w-full object-cover"
                />
                {i === 1 && listing.images.length > 3 ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <span className="text-xl font-black text-white">
                      +{listing.images.length - 3} more
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1E5BFF]/70">
                Property Details
              </p>
              <h1 className="mt-2 text-[30px] font-black tracking-tight text-[#111827]">
                {listing.title}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#6b7280]">
                <span>📍 {listing.location}</span>
                <span className="text-[#9ca3af]">·</span>
                <span className="rounded-md bg-[var(--panel-soft)] px-2 py-0.5 font-bold text-[#374151]">
                  {listing.type}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#0A2A8C] to-[#1442C4] px-5 py-3 text-white shadow-[0_8px_24px_rgba(10,42,140,0.3)]">
              <div className="text-right">
                <p className="text-[22px] font-black leading-none">
                  {formatMoney(listing.pricePerNight, listing.currency)}
                </p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7CA8FF]/80">
                  per night
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {[
              { label: `${listing.rooms} rooms`, icon: "🛏" },
              { label: `${listing.bathrooms} baths`, icon: "🚿" },
              { label: listing.type, icon: "🏠" },
            ].map((tag) => (
              <span
                key={tag.label}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-3.5 py-2 text-xs font-bold text-[#4b5563]"
              >
                <span>{tag.icon}</span>
                {tag.label}
              </span>
            ))}
          </div>
        </section>

        {listing.description ? (
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b7280]">
              About this place
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-[#111827]">
              Description
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#4b5563]">
              {listing.description}
            </p>
          </section>
        ) : null}

        <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b7280]">
                Features
              </p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-[#111827]">
                Amenities
              </h2>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E5BFF]/10 text-lg text-[#1E5BFF]">
              ✨
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {listing.amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-3.5 py-2 text-xs font-bold text-[#4b5563] transition hover:border-[#1E5BFF]/30 hover:bg-[#1E5BFF]/5 hover:text-[#1E5BFF]"
              >
                ✓ {amenity}
              </span>
            ))}
          </div>
        </section>

        {listing.rules?.length ? (
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b7280]">
                  Guidelines
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight text-[#111827]">
                  House rules
                </h2>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ef4444]/10 text-lg text-[#ef4444]">
                ⚠
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {listing.rules.map((rule) => (
                <div
                  key={rule}
                  className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-[11px] font-black text-[#ef4444] shadow-sm">
                    !
                  </span>
                  <p className="text-sm leading-6 text-[#4b5563]">{rule}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b7280]">
                Your Host
              </p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-[#111827]">
                Hosted by
              </h2>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-4 rounded-2xl bg-[var(--panel-soft)] p-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A2A8C] to-[#1442C4] text-lg font-black text-white shadow-[0_4px_12px_rgba(10,42,140,0.25)]">
              {initialsFor(listing.host.name)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-black text-[#111827]">{listing.host.name}</p>
              {listing.host.phone ? (
                <p className="mt-1 text-sm font-medium text-[#6b7280]">📞 {listing.host.phone}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="hidden h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-4 text-xs font-bold text-[#1E5BFF] transition hover:border-[#1E5BFF]/30 hover:bg-[#1E5BFF]/5 sm:inline-flex"
            >
              Contact Host
            </button>
          </div>
          {listing.availabilityNote ? (
            <p className="mt-4 rounded-xl border border-[#1E5BFF]/15 bg-[#EDF3FF] px-4 py-3 text-sm leading-6 text-[#0F2F99]">
              💬 {listing.availabilityNote}
            </p>
          ) : null}
        </section>
      </div>

      <aside className="h-fit sticky top-32 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1E5BFF]/70">
              Reservation
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-[#111827]">
              Book a room
            </h2>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A2A8C] to-[#1442C4] text-white shadow-[0_4px_12px_rgba(10,42,140,0.25)]">
            📅
          </span>
        </div>

        {status !== "signedIn" ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-[#ef4444]/15 bg-[#fef2f2] p-4">
              <p className="flex items-start gap-2 text-sm leading-6 text-[#991b1b]">
                <span className="mt-0.5">🔐</span>
                Log in with your demo account to create bookings on web.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2A8C] px-5 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(10,42,140,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#07206E]"
            >
              Log In to Book <span>→</span>
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-3 rounded-xl bg-[var(--panel-soft)] px-3.5 py-2.5 text-xs font-semibold text-[#4b5563]">
              Signed in as{" "}
              <span className="font-black text-[#0A2A8C]">{profile?.email}</span>
            </p>

            <div className="mt-5 space-y-3.5">
              <div>
                <label className="text-[11px] font-black uppercase tracking-[0.14em] text-[#6b7280]">
                  Check-in
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className={`mt-1.5 ${fieldClass}`}
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-[0.14em] text-[#6b7280]">
                  Check-out
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className={`mt-1.5 ${fieldClass}`}
                />
              </div>

              {summary ? (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
                  {[
                    ["Nights", summary.nights],
                    ["Subtotal", formatMoney(summary.subtotal, listing.currency)],
                    ["Service fee", formatMoney(summary.serviceFee, listing.currency)],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <span className="font-semibold text-[#6b7280]">{label}</span>
                      <span className="font-bold text-[#374151]">{value}</span>
                    </div>
                  ))}
                  <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] pt-3">
                    <span className="text-base font-black text-[#111827]">Total</span>
                    <span className="text-lg font-black tracking-tight text-[#0A2A8C]">
                      {formatMoney(summary.total, listing.currency)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel-soft)] p-4 text-center">
                  <p className="text-xs font-semibold text-[#6b7280]">
                    Enter valid dates to see a price breakdown.
                  </p>
                </div>
              )}

              {error ? (
                <div className="rounded-xl border border-[#ef4444]/20 bg-[#fef2f2] px-4 py-3 text-sm font-bold text-[#991b1b]">
                  ⚠ {error}
                </div>
              ) : null}

              <button
                type="button"
                disabled={!summary || busy}
                onClick={async () => {
                  setError(null);
                  if (!summary) {
                    setError("Please enter valid dates with at least 1 night.");
                    return;
                  }

                  try {
                    setBusy(true);
                    let newBooking: WebBooking | null = null;
                    try {
                      newBooking = await createBookingOnApi({
                        accessToken,
                        listingId: listing.id,
                        startDate,
                        endDate,
                      });
                    } catch {
                      newBooking = null;
                    }
                    if (!newBooking) {
                      newBooking = createBookingFromListing({ listing, startDate, endDate });
                    }
                    router.push(`/pay/${newBooking.id}`);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Booking failed.");
                  } finally {
                    setBusy(false);
                  }
                }}
                className="w-full rounded-xl bg-gradient-to-br from-[#0A2A8C] to-[#1442C4] px-5 py-3.5 text-sm font-black text-white shadow-[0_8px_24px_rgba(10,42,140,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(10,42,140,0.4)] disabled:cursor-not-allowed disabled:from-[#BFD4FF]/60 disabled:to-[#BFD4FF]/60 disabled:shadow-none disabled:hover:translate-y-0"
              >
                {busy ? "⏳ Creating booking..." : "✓ Confirm Booking"}
              </button>
            </div>
          </>
        )}
      </aside>

      <PaymentIntentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        booking={currentBooking!}
        intent={currentIntent}
        busy={paymentBusy}
        onConfirm={async () => {
          if (!currentIntent) return;
          setPaymentBusy(true);
          try {
            confirmPayment(currentIntent.id);
            setTimeout(() => {
              router.push("/bookings");
            }, 600);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment failed.");
            setPaymentBusy(false);
          }
        }}
      />
    </div>
  );
}
