import { mockListings } from "@/constants/mock-data";
import type { Listing } from "@/types/models";

export function getFeaturedListings() {
  return mockListings.filter((listing) => listing.featured);
}

export function getSecondaryListings() {
  const featuredIds = new Set(getFeaturedListings().map((listing) => listing.id));
  return mockListings.filter((listing) => !featuredIds.has(listing.id));
}

export function getListingById(id: string) {
  return mockListings.find((listing) => listing.id === id) ?? null;
}

export function getCategoryChips() {
  return [
    "Popular now",
    ...Array.from(
      new Set(mockListings.map((item) => item.location.split(",")[0]?.trim()).filter(Boolean)),
    ),
  ].slice(0, 5);
}

export function filterListings(params: {
  q?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  rooms?: number;
}) {
  const q = params.q?.trim().toLowerCase();
  const location = params.location?.trim().toLowerCase();
  const type = params.type?.trim();

  return mockListings.filter((listing) => {
    const matchesQ =
      !q ||
      listing.title.toLowerCase().includes(q) ||
      listing.location.toLowerCase().includes(q);
    const matchesLocation =
      !location || listing.location.toLowerCase().includes(location);
    const matchesType = !type || listing.type === type;
    const matchesRooms = !params.rooms || listing.rooms >= params.rooms;
    const matchesMin = params.minPrice == null || listing.pricePerNight >= params.minPrice;
    const matchesMax = params.maxPrice == null || listing.pricePerNight <= params.maxPrice;

    return (
      matchesQ &&
      matchesLocation &&
      matchesType &&
      matchesRooms &&
      matchesMin &&
      matchesMax
    );
  });
}
