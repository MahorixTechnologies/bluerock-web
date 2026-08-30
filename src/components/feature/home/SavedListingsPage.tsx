"use client";

import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { ListingCard } from "@/components/common/ListingCard";
import { useListings } from "@/hooks/useListings";
import { useSavedListings } from "@/hooks/useSavedListings";
import { useWebAuth } from "@/providers/WebAuthProvider";

export function SavedListingsPage() {
  const { accessToken } = useWebAuth();
  const { savedIds } = useSavedListings();
  const { data: listings = [] } = useListings({ token: accessToken, scope: "public" });

  const savedListings = listings.filter((listing) => savedIds.includes(listing.id));

  return (
    <AppShell
      heading="Saved listings"
      subheading="Properties you've bookmarked while browsing"
    >
      {savedListings.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {savedListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} variant="list" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-12 text-center shadow-[var(--shadow-card)]">
          <span className="flex mx-auto h-16 w-16 items-center justify-center rounded-2xl bg-[var(--panel-soft)] text-3xl">
            ♡
          </span>
          <p className="mt-5 text-lg font-black text-[var(--text)]">No saved listings yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            Tap the heart icon on any listing to bookmark it here for later.
          </p>
          <Link
            href="/search"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-xs font-bold text-white shadow-[0_6px_16px_rgba(30,91,255,0.25)] transition hover:bg-[var(--primary-600)]"
          >
            Browse listings
          </Link>
        </div>
      )}
    </AppShell>
  );
}
