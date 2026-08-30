"use client";

import { useCallback } from "react";

import { useLocalStorage } from "./useLocalStorage";

const SAVED_LISTINGS_KEY = "bluerock.web.savedListings.v1";

export function useSavedListings() {
  const [savedIds, setSavedIds] = useLocalStorage<string[]>(SAVED_LISTINGS_KEY, []);

  const isSaved = useCallback(
    (listingId: string) => savedIds.includes(listingId),
    [savedIds],
  );

  const toggleSaved = useCallback(
    (listingId: string) => {
      setSavedIds((prev) =>
        prev.includes(listingId)
          ? prev.filter((id) => id !== listingId)
          : [...prev, listingId],
      );
    },
    [setSavedIds],
  );

  return { savedIds, isSaved, toggleSaved } as const;
}
