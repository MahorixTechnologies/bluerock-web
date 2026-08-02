"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LegacyPayRedirectPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const id = typeof bookingId === "string" ? bookingId : null;

  useEffect(() => {
    if (id) {
      router.replace(`/bookings/${id}/pay`);
    }
  }, [router, id]);

  return null;
}
