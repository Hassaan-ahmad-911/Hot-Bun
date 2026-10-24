import type { Cents } from "@/lib/types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatMoney(cents: Cents) {
  return money.format(cents / 100);
}

/** Compact variant for menus: "$19" when whole, "$19.50" otherwise. */
export function formatPrice(cents: Cents) {
  return cents % 100 === 0 ? `$${cents / 100}` : money.format(cents / 100);
}
