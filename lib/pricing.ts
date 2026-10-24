import { restaurant } from "@/data/restaurant";
import type { Cents, FulfillmentType, OrderTotals } from "@/lib/types";

export interface PricedLine {
  unitPrice: Cents;
  quantity: number;
}

export function subtotalOf(lines: PricedLine[]): Cents {
  return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}

export function computeTotals(
  lines: PricedLine[],
  opts: { fulfillment?: FulfillmentType; tip?: Cents } = {},
): OrderTotals {
  const subtotal = subtotalOf(lines);
  const tax = Math.round(subtotal * restaurant.taxRate);
  const deliveryFee = opts.fulfillment === "delivery" && subtotal > 0 ? restaurant.deliveryFee : 0;
  const tip = Math.max(0, Math.round(opts.tip ?? 0));
  return { subtotal, tax, deliveryFee, tip, total: subtotal + tax + deliveryFee + tip };
}

export const TIP_PRESETS = [0, 10, 15, 20] as const;

export function tipFromPercent(subtotal: Cents, percent: number): Cents {
  return Math.round((subtotal * percent) / 100);
}
