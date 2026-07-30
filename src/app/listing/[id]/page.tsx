import { notFound } from "next/navigation";

import { AppShell } from "@/components/web/AppShell";
import { ListingDetailClient } from "@/components/web/ListingDetailClient";
import { getListingById } from "@/lib/utils";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListingById(id);

  if (!listing) {
    notFound();
  }

  return (
    <AppShell
      heading="Listing details"
      subheading="Property information, amenities, host details, and a booking summary now line up with the mobile app flow."
    >
      <ListingDetailClient listing={listing} />
    </AppShell>
  );
}
