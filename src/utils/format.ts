import type { Listing } from "@/types/models";

export function formatMoney(value: number, currency: Listing["currency"]) {
  return `${currency === "USD" ? "$" : "NGN "}${value.toLocaleString()}`;
}
