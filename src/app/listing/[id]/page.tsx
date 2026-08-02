"use client";

import { useParams } from "next/navigation";

import { AppShell } from "@/components/web/AppShell";
import { ListingDetailClient } from "@/components/web/ListingDetailClient";
import { useWebAuth } from "@/components/web/WebAuthProvider";
import { useListing } from "@/lib/listing-hooks";
import { mockListings } from "@/lib/mock-data";

export default function ListingDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const { accessToken } = useWebAuth();
  const { data: listing = mockListings.find((l) => l.id === id) ?? mockListings[0] ?? null } = useListing(id, accessToken);

  return (
    <AppShell
      heading="Listing details"
      subheading="Property information, amenities, host details, and a booking summary now line up with the mobile app flow."
    >
      {listing ? <ListingDetailClient listing={listing} /> : null}
    </AppShell>
  );
}
