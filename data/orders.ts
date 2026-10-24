import { dishes } from "@/data/menu";
import { getServiceStart } from "@/lib/hours";
import { computeTotals } from "@/lib/pricing";
import type { Order, OrderLine, OrderStatus } from "@/lib/types";
import { seededRandom } from "@/lib/utils";

const CUSTOMERS = [
  "Maya Okafor",
  "Daniel Reyes",
  "Priya Shah",
  "Tom Lindqvist",
  "Ana Beridze",
  "Jonah Park",
  "Sofia Marin",
  "Leo Haddad",
  "Grace Whitfield",
  "Omar Nasser",
  "Hana Sato",
  "Felix Duarte",
  "Iris Novak",
  "Sam Adeyemi",
];

/**
 * Sample orders for the most recent service (see getServiceStart), generated
 * relative to now and never in the future, so the admin panel always looks live.
 * Clearly labelled as sample data in the UI.
 */
export function generateSampleOrders(now = new Date()): Order[] {
  const start = getServiceStart(now);
  const rand = seededRandom(start.getFullYear() * 1000 + start.getMonth() * 40 + start.getDate());
  const available = dishes.filter((d) => d.available);
  const base = new Date(start.getTime() + 5 * 60 * 1000);

  const orders = CUSTOMERS.map((name, i): Order => {
    const lineCount = 1 + Math.floor(rand() * 4);
    const picked = new Map<string, OrderLine>();
    for (let l = 0; l < lineCount; l++) {
      const dish = available[Math.floor(rand() * available.length)];
      const existing = picked.get(dish.id);
      if (existing) existing.quantity += 1;
      else picked.set(dish.id, { dishId: dish.id, name: dish.name, unitPrice: dish.price, quantity: 1 + (rand() > 0.8 ? 1 : 0) });
    }
    const lines = [...picked.values()];
    const fulfillment = rand() > 0.55 ? "delivery" : "pickup";
    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    const tip = Math.round(subtotal * [0, 0.1, 0.15, 0.2][Math.floor(rand() * 4)]);
    const createdAt = new Date(base.getTime() + i * 38 * 60 * 1000 + Math.floor(rand() * 20) * 60 * 1000);
    const status: OrderStatus = i === 3 ? "cancelled" : "completed";

    return {
      id: `ord_sample_${i + 1}`,
      number: `HB-${2380 + i}`,
      createdAt: createdAt.toISOString(),
      status,
      fulfillment,
      scheduledFor: null,
      customer: {
        name,
        phone: `+1 (555) 01${String(10 + i).padStart(2, "0")}-${String(4000 + i * 37).slice(0, 4)}`,
        email: `${name.split(" ")[0].toLowerCase()}@example.com`,
      },
      address:
        fulfillment === "delivery"
          ? { line1: `${12 + i * 7} ${["Mill St", "Cedar Ave", "Harbor Rd", "Elm Row"][i % 4]}`, city: "Riverside", postcode: "10021" }
          : undefined,
      lines,
      totals: computeTotals(lines, { fulfillment, tip }),
      cardLast4: "4242",
    };
  });

  // Never in the future; the latest few are still in the kitchen.
  const past = orders.filter((o) => new Date(o.createdAt).getTime() < now.getTime() - 60 * 1000);
  const live: OrderStatus[] = ["received", "cooking", "cooking", "ready"];
  live.forEach((status, k) => {
    const order = past[past.length - 1 - k];
    if (order && order.status !== "cancelled") order.status = status;
  });
  return past;
}
