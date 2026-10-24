import { computeTotals } from "@/lib/pricing";
import type { Order, OrderLine, OrderStatus } from "@/lib/types";
import { uid } from "@/lib/utils";
import { ApiError, clone, delay, maybeFail } from "./client";
import { mutateDb, readDb } from "./mock-db";

export interface CreateOrderInput {
  lines: OrderLine[];
  fulfillment: Order["fulfillment"];
  scheduledFor: string | null;
  customer: Order["customer"];
  address?: Order["address"];
  tip: number;
  /** A real integration would send a Stripe PaymentMethod id, never card digits. */
  cardLast4: string;
}

/** Demo kitchen timeline (seconds after the order is placed). */
const COOKING_AFTER = 8;
const READY_AFTER = 24;

function advance(order: Order, now = Date.now()): Order {
  if (!order.autoAdvance) return order;
  const elapsed = (now - new Date(order.createdAt).getTime()) / 1000;
  const next: OrderStatus = elapsed >= READY_AFTER ? "ready" : elapsed >= COOKING_AFTER ? "cooking" : "received";
  return { ...order, status: next, autoAdvance: next !== "ready" };
}

// Real API: GET /api/orders?since=ISO
export async function listOrders(opts: { since?: string } = {}): Promise<Order[]> {
  await delay();
  maybeFail("orders");
  const orders = readDb().orders.map((o) => advance(o));
  const filtered = opts.since ? orders.filter((o) => o.createdAt >= opts.since!) : orders;
  return clone(filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

// Real API: GET /api/orders/:id
export async function getOrder(id: string, opts: { quiet?: boolean } = {}): Promise<Order> {
  if (!opts.quiet) await delay();
  maybeFail("orders");
  const found = readDb().orders.find((o) => o.id === id);
  if (!found) throw new ApiError("We couldn't find that order.", 404);
  return clone(advance(found));
}

// Real API: POST /api/orders (after the payment intent is confirmed)
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  await delay(1200, 1800); // payment + kitchen handoff feel
  maybeFail("orders");
  if (!input.lines.length) throw new ApiError("Your order is empty.", 400);

  const db = readDb();
  const lastNumber = Math.max(2400, ...db.orders.map((o) => Number(o.number.replace("HB-", "")) || 0));
  const order: Order = {
    id: uid("ord"),
    number: `HB-${lastNumber + 1}`,
    createdAt: new Date().toISOString(),
    status: "received",
    autoAdvance: true,
    fulfillment: input.fulfillment,
    scheduledFor: input.scheduledFor,
    customer: input.customer,
    address: input.fulfillment === "delivery" ? input.address : undefined,
    lines: input.lines,
    // Totals are always recomputed "server-side" — never trust client maths.
    totals: computeTotals(input.lines, { fulfillment: input.fulfillment, tip: input.tip }),
    cardLast4: input.cardLast4,
  };
  mutateDb((d) => {
    d.orders.push(order);
  });
  return clone(order);
}

// Real API: PATCH /api/orders/:id { status }
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  await delay(120, 300);
  let updated: Order | undefined;
  mutateDb((db) => {
    const order = db.orders.find((o) => o.id === id);
    if (!order) throw new ApiError("Order not found", 404);
    order.status = status;
    order.autoAdvance = false; // a human took over
    updated = order;
  });
  return clone(updated!);
}
