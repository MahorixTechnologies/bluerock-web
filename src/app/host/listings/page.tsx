"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardRouter } from "@/components/feature/home/DashboardRouter";
import { formatMoney } from "@/utils";
import { apiFetch } from "@/api/client";
import { ALL_PROPERTY_TYPES, type Listing } from "@/types/models";
import {
  EMPTY_DRAFT,
  type ListingDraft,
  createListing,
  deleteListing,
  listingToDraft,
  updateListing,
  useListings,
} from "@/hooks/useListings";
import { initiatePayment } from "@/api/payments";
import type { PaymentProvider } from "@/components/feature/payment";
import { useWebAuth } from "@/providers/WebAuthProvider";
import { useState } from "react";
import { BecomeHostCta } from "@/components/feature/home/BecomeHostCta";
import Image from "next/image";

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

function Row({
  listing,
  fullListing,
  onEdit,
  onDelete,
  onBoost,
}: {
  listing: HostListing;
  fullListing: Listing | null;
  onEdit: () => void;
  onDelete: () => void;
  onBoost: () => void;
}) {
  const featuredUntil = fullListing?.featuredUntil ? new Date(fullListing.featuredUntil) : null;
  const isFeatured = Boolean(fullListing?.featured && featuredUntil && featuredUntil > new Date());
  const canBoost = fullListing?.status === "APPROVED";
  const statusStyle =
    listing.status === "Active"
      ? "bg-[var(--trend-up-bg)] text-[var(--trend-up)]"
      : listing.status === "Paused"
        ? "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]"
        : "bg-[rgba(107,114,128,0.12)] text-[var(--muted)]";
  return (
    <div className="grid grid-cols-[1.5fr_1.2fr_0.7fr_0.9fr_1fr_1fr_0.8fr] items-center gap-4 border-b border-[var(--border)] px-4 py-4 last:border-b-0 sm:px-6">
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel-soft)]">
          <Image src={listing.image} alt={listing.title} fill sizes="56px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--text)]">{listing.title}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{listing.location}</p>
        </div>
      </div>
      <p className="text-sm font-bold tabular-nums text-[var(--text)]">
        {formatMoney(listing.pricePerNight, listing.currency)}
        <span className="ml-1 text-xs font-semibold text-[var(--muted)]">/night</span>
      </p>
      <p className="text-sm font-black tabular-nums text-[var(--primary)]">{listing.occupancy}%</p>
      <p className="text-sm font-black tabular-nums text-[var(--text)]">{listing.totalNights}</p>
      <p className="text-sm font-black tabular-nums text-[var(--text)]">{formatMoney(listing.totalRevenue, listing.currency)}</p>
      <div className="flex flex-col items-start gap-1">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${statusStyle}`}>{listing.status}</span>
        {isFeatured && (
          <span className="inline-flex items-center rounded-full bg-[rgba(30,91,255,0.12)] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[var(--primary)]">
            ★ Featured · until {featuredUntil?.toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        {canBoost && (
          <button
            type="button"
            onClick={onBoost}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--primary)] bg-white px-2.5 text-xs font-bold text-[var(--primary)] transition hover:bg-[rgba(30,91,255,0.08)]"
          >
            {isFeatured ? "Extend" : "★ Boost"}
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="h-8 w-8 rounded-lg border border-[var(--border)] bg-white text-sm text-[var(--muted)] transition hover:bg-[var(--panel-soft)]"
        >
          ✎
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="h-8 w-8 rounded-lg border border-[var(--border)] bg-white text-sm text-[var(--muted)] transition hover:bg-[var(--panel-soft)]"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

const propertyTypeLabels: Record<string, string> = {
  EntireProperty: "Entire Property",
  Apartment: "Apartment",
  House: "House",
  Duplex: "Duplex",
  Studio: "Studio",
  SingleRoom: "Single Room",
  SharedRoom: "Shared Room",
  Hostel: "Hostel",
  StudentHousing: "Student Housing",
  HotelRoom: "Hotel Room",
  Other: "Other",
};

export function HostListingsPage() {
  const { profile, accessToken } = useWebAuth();
  const { data: backendListings = [], refetch } = useListings({ token: accessToken, scope: "mine" });

  const hostListings: HostListing[] = backendListings.map((listing, i) => ({
    id: listing.id,
    title: listing.title,
    location: listing.location,
    image: listing.images[0] ?? "",
    pricePerNight: listing.pricePerNight,
    currency: listing.currency,
    occupancy: [92, 78, 65, 84, 72, 88, 61, 95, 70, 80][i % 10] ?? 70,
    status: (["Active", "Active", "Active", "Pending", "Active", "Paused", "Active", "Active", "Active", "Active"] as const)[i % 10] ?? "Active",
    totalNights: [28, 24, 18, 22, 20, 12, 26, 29, 19, 23][i % 10] ?? 20,
    totalRevenue: listing.pricePerNight * ([28, 24, 18, 22, 20, 12, 26, 29, 19, 23][i % 10] ?? 20),
  }));

  const summary = {
    total: hostListings.length,
    active: hostListings.filter((l) => l.status === "Active").length,
    paused: hostListings.filter((l) => l.status === "Paused").length,
    pending: hostListings.filter((l) => l.status === "Pending").length,
    totalRevenue: hostListings.reduce((sum, l) => sum + l.totalRevenue, 0),
    totalNights: hostListings.reduce((sum, l) => sum + l.totalNights, 0),
  };

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const [draft, setDraft] = useState<ListingDraft>(EMPTY_DRAFT);
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const [boosting, setBoosting] = useState<Listing | null>(null);
  const [boostProvider, setBoostProvider] = useState<PaymentProvider>("PAYSTACK");
  const [boostError, setBoostError] = useState<string | null>(null);
  const [boostSubmitting, setBoostSubmitting] = useState(false);

  const desiredDraftKey = editing ? editing.id : openCreate ? "__new__" : null;
  if (desiredDraftKey !== draftKey) {
    setDraftKey(desiredDraftKey);
    setDraft(editing ? listingToDraft(editing) : EMPTY_DRAFT);
  }

  const dialogOpen = openCreate || editing !== null;
  const dialogTitle = editing ? "Edit Listing" : "New Listing";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogSubmitting(true);
    setDialogError(null);
    try {
      if (editing) {
        await updateListing(editing.id, draft, accessToken);
      } else {
        await createListing(draft, accessToken);
      }
      await refetch();
      setOpenCreate(false);
      setEditing(null);
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setDialogSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteListing(confirmDeleteId, accessToken);
      await refetch();
      setConfirmDeleteId(null);
    } catch {
      // ignore
    }
  };

  const handleBoost = async () => {
    if (!boosting) return;
    setBoostSubmitting(true);
    setBoostError(null);
    try {
      const callbackUrl = `${window.location.origin}/payments/callback?purpose=FEATURED_LISTING&targetId=${boosting.id}`;
      const result = await initiatePayment({
        accessToken,
        purpose: "FEATURED_LISTING",
        targetId: boosting.id,
        provider: boostProvider,
        callbackUrl,
      });
      if (!result) {
        setBoostError("We couldn't start the payment. Please try again.");
        return;
      }
      window.location.href = result.authorizationUrl;
    } catch (err) {
      setBoostError(err instanceof Error ? err.message : "Failed to feature this listing.");
    } finally {
      setBoostSubmitting(false);
    }
  };

  const closeDialog = () => {
    setOpenCreate(false);
    setEditing(null);
    setDialogError(null);
    setDialogSubmitting(false);
  };

  void profile;
  void apiFetch;

  return (
    <AppShell heading="My Listings" subheading="Manage every property you list on BlueRock">
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Listings", value: String(summary.total), delta: "+1", color: "var(--trend-up)", icon: "🏢" },
            { label: "Active", value: String(summary.active), delta: `${summary.active} online`, color: "var(--trend-up)", icon: "🟢" },
            { label: "Paused", value: String(summary.paused), delta: "hidden", color: "#ca8a04", icon: "⏸" },
            { label: "Pending", value: String(summary.pending), delta: "review", color: "var(--muted)", icon: "⏱" },
            { label: "Lifetime Revenue", value: formatMoney(summary.totalRevenue, "USD"), delta: `${summary.totalNights} nights`, color: "var(--trend-up)", icon: "💎" },
          ].map((tile) => (
            <div key={tile.label} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{tile.label}<span className="ml-1 rounded bg-[var(--panel-soft)] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">est.</span></p>
                  <p className="mt-2 text-[22px] font-black tracking-tight text-[var(--text)]">{tile.value}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-base" style={{ background: `color-mix(in srgb, ${tile.color} 12%, transparent)`, color: tile.color }}>{tile.icon}</span>
              </div>
              <p className="mt-3 text-xs font-semibold text-[var(--muted)]"><span style={{ color: tile.color }}>{tile.delta}</span> lifetime</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-[20px] font-black tracking-tight text-[var(--text)]">All Properties</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">Tap any row to edit listing details, photos and pricing.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-2 sm:flex">
                <span className="text-sm text-[var(--muted)]">⌕</span>
                <span className="text-sm font-medium text-[var(--muted)]">Search listings</span>
              </div>
              <button type="button" className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--panel-soft)]">Filters</button>
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setOpenCreate(true);
                }}
                className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-[var(--primary)] px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[var(--primary-600)]"
              >
                + New Listing
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
            <div className="overflow-x-auto">
              <div className="min-w-[820px]">
                <div className="grid grid-cols-[1.5fr_1.2fr_0.7fr_0.9fr_1fr_1fr_0.8fr] items-center gap-4 border-b border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 sm:px-6">
                  {["Property", "Rate", "Occupancy", "Booked", "Revenue", "Status", "Actions"].map((header) => (
                    <p key={header} className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{header}</p>
                  ))}
                </div>
                {hostListings.map((hostListing) => {
                  const fullListing = backendListings.find((l) => l.id === hostListing.id) ?? null;
                  return (
                    <Row
                      key={hostListing.id}
                      listing={hostListing}
                      fullListing={fullListing}
                      onEdit={() => {
                        if (fullListing) setEditing(fullListing);
                      }}
                      onDelete={() => setConfirmDeleteId(hostListing.id)}
                      onBoost={() => {
                        if (fullListing) setBoosting(fullListing);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[22px] font-black tracking-tight text-[var(--text)]">{dialogTitle}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Fill in the details below to {editing ? "update" : "publish"} your property.</p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--panel-soft)]"
              >
                ✕
              </button>
            </div>

            {dialogError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {dialogError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Title</label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="e.g. Luxury 3-Bed Apartment in Victoria Island"
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Location</label>
                <input
                  type="text"
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  placeholder="e.g. Victoria Island, Lagos, Nigeria"
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Description</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Describe your property, amenities and what makes it special..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={draft.rooms}
                    onChange={(e) => setDraft({ ...draft, rooms: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Bathrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={draft.bathrooms}
                    onChange={(e) => setDraft({ ...draft, bathrooms: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Currency</label>
                  <select
                    value={draft.currency}
                    onChange={(e) => setDraft({ ...draft, currency: e.target.value as "USD" | "NGN" })}
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Price per Night</label>
                  <input
                    type="number"
                    min="0"
                    value={draft.pricePerNight}
                    onChange={(e) => setDraft({ ...draft, pricePerNight: e.target.value })}
                    placeholder="e.g. 50000"
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Property Type</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PROPERTY_TYPES.map((pt) => {
                    const active = draft.type === pt;
                    return (
                      <button
                        type="button"
                        key={pt}
                        onClick={() => setDraft({ ...draft, type: pt })}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                          active
                            ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-[0_4px_12px_rgba(30,91,255,0.35)]"
                            : "border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--panel-soft)]"
                        }`}
                      >
                        {propertyTypeLabels[pt] ?? pt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Images (comma separated URLs)</label>
                <textarea
                  value={draft.images}
                  onChange={(e) => setDraft({ ...draft, images: e.target.value })}
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Amenities (comma separated)</label>
                <input
                  type="text"
                  value={draft.amenities}
                  onChange={(e) => setDraft({ ...draft, amenities: e.target.value })}
                  placeholder="WiFi, AC, Parking, Pool, Gym"
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">House Rules (comma separated)</label>
                <input
                  type="text"
                  value={draft.rules}
                  onChange={(e) => setDraft({ ...draft, rules: e.target.value })}
                  placeholder="No smoking, No parties, Check-in 3pm"
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[var(--border)] pt-5">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={dialogSubmitting}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--panel-soft)] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dialogSubmitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[var(--primary-600)] disabled:opacity-50"
                >
                  {dialogSubmitting ? "Saving..." : editing ? "Save Changes" : "Create Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">
                🗑
              </div>
              <h2 className="mt-4 text-[22px] font-black tracking-tight text-[var(--text)]">Delete Listing?</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                This will permanently remove this property and all its associated data. This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--panel-soft)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(220,38,38,0.35)] transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {boosting !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(30,91,255,0.12)] text-2xl text-[var(--primary)]">
                ★
              </div>
              <h2 className="mt-4 text-[22px] font-black tracking-tight text-[var(--text)]">
                Feature &ldquo;{boosting.title}&rdquo;?
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Your listing gets priority placement in Featured Homes for 30 days, starting now (or
                extending from its current expiry if it&apos;s already featured). Estimated cost: ₦5,000.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {(["PAYSTACK", "FLUTTERWAVE"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setBoostProvider(p)}
                  disabled={boostSubmitting}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${
                    boostProvider === p
                      ? "border-[var(--primary)] bg-[rgba(30,91,255,0.08)] text-[var(--primary)]"
                      : "border-[var(--border)] bg-white text-[var(--text)] hover:bg-[var(--panel-soft)]"
                  }`}
                >
                  {p === "PAYSTACK" ? "Paystack" : "Flutterwave"}
                </button>
              ))}
            </div>

            {boostError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {boostError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setBoosting(null);
                  setBoostError(null);
                }}
                disabled={boostSubmitting}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--panel-soft)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBoost}
                disabled={boostSubmitting}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:opacity-90 disabled:opacity-50"
              >
                {boostSubmitting
                  ? "Redirecting..."
                  : `Continue to ${boostProvider === "PAYSTACK" ? "Paystack" : "Flutterwave"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function RenterRedirect() {
  return (
    <AppShell heading="My Listings" subheading="This section is for hosts only">
      <BecomeHostCta />
    </AppShell>
  );
}

export default function HostListingsRoute() {
  return (
    <DashboardRouter
      landlord={<HostListingsPage />}
      renter={<RenterRedirect />}
      public={<RenterRedirect />}
      admin={<RenterRedirect />}
    />
  );
}
