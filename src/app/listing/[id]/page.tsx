"use client";

import { useParams } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { ListingDetailClient } from "@/components/feature/listing/ListingDetailClient";
import { useWebAuth } from "@/providers/WebAuthProvider";
import { useListing } from "@/hooks/useListings";

export default function ListingDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const { accessToken } = useWebAuth();
  const { data: listing, loading, error } = useListing(id, accessToken);

  return (
    <AppShell
      heading="Listing details"
      subheading="Property information, amenities, host details, and a booking summary now line up with the mobile app flow."
    >
      {listing ? (
        <ListingDetailClient listing={listing} />
      ) : loading ? (
        <section className="rounded-2xl border border-[var(--border)] bg-white p-12 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm font-semibold text-[var(--muted)]">Loading listing…</p>
        </section>
      ) : (
        <section className="rounded-2xl border border-[var(--border)] bg-white p-12 text-center shadow-[var(--shadow-card)]">
          <p className="text-lg font-black text-[var(--text)]">
            {error ? "Couldn't load this listing" : "Listing not found"}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {error ?? "It may have been removed or the link is invalid."}
          </p>
        </section>
      )}
    </AppShell>
  );
}
