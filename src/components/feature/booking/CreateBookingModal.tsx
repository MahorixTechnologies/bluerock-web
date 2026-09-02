"use client";

import { useState } from "react";

import { useListings } from "@/hooks/useListings";
import { lookupRenterByEmail, type RenterLookupResult } from "@/api/users";
import { createBookingForRenterOnApi } from "@/api/bookings";
import type { OwnerBooking } from "@/types/models";

export function CreateBookingModal({
  accessToken,
  onClose,
  onCreated,
}: {
  accessToken: string | null;
  onClose: () => void;
  onCreated: (booking: OwnerBooking) => void;
}) {
  const { data: listings, loading: listingsLoading } = useListings({
    token: accessToken,
    scope: "mine",
  });

  const [email, setEmail] = useState("");
  const [renter, setRenter] = useState<RenterLookupResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const [listingId, setListingId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLookup() {
    if (!email.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    setRenter(null);
    try {
      const found = await lookupRenterByEmail(accessToken, email.trim());
      setRenter(found);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "Renter not found");
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleSubmit() {
    if (!renter) {
      setSubmitError("Look up a renter by email first");
      return;
    }
    if (!listingId) {
      setSubmitError("Select a listing");
      return;
    }
    if (!startDate || !endDate) {
      setSubmitError("Select check-in and check-out dates");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const booking = await createBookingForRenterOnApi({
        accessToken,
        listingId,
        renterId: renter.id,
        startDate,
        endDate,
      });
      onCreated(booking);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-6">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-[22px] font-black tracking-tight text-[var(--text)]">Create Booking</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Book one of your listings on behalf of a guest</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--panel-soft)]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
              Renter Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setRenter(null);
                }}
                placeholder="renter@example.com"
                className="h-11 flex-1 rounded-xl border border-[var(--border)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
              />
              <button
                type="button"
                onClick={handleLookup}
                disabled={lookupLoading || !email.trim()}
                className="h-11 rounded-xl bg-[var(--panel-soft)] px-4 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--border)] disabled:opacity-60"
              >
                {lookupLoading ? "..." : "Find"}
              </button>
            </div>
            {lookupError ? <p className="mt-1.5 text-xs font-semibold text-[var(--danger)]">{lookupError}</p> : null}
            {renter ? (
              <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-3 text-sm">
                <p className="font-bold text-[var(--text)]">{renter.name ?? renter.email}</p>
                <p className="text-[var(--muted)]">{renter.email}{renter.phone ? ` · ${renter.phone}` : ""}</p>
              </div>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
              Listing
            </label>
            <select
              value={listingId}
              onChange={(e) => setListingId(e.target.value)}
              disabled={listingsLoading}
              className="h-11 w-full rounded-xl border border-[var(--border)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
            >
              <option value="">{listingsLoading ? "Loading listings..." : "Select a listing"}</option>
              {listings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                Check-in
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--border)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                Check-out
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--border)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {submitError ? <p className="text-xs font-semibold text-[var(--danger)]">{submitError}</p> : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-[var(--border)] bg-white px-5 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--panel-soft)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-11 rounded-xl bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[var(--primary-600)] disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
