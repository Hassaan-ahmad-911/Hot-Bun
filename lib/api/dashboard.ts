import { toDateKey } from "@/lib/dates";
import { clone, delay, maybeFail } from "./client";
import { readDb } from "./mock-db";

export interface DashboardStats {
  since: string;
  bookingsDate: string;
  orders: number;
  revenue: number; // cents, excludes cancelled
  averageTicket: number; // cents
  bookings: number;
  covers: number;
  activeOrders: number;
  /** Orders per hour, 11:00 → 23:00. */
  ordersByHour: { hour: number; orders: number; revenue: number }[];
  topDishes: { name: string; quantity: number }[];
}

// Real API: GET /api/admin/dashboard?since=ISO&bookingsDate=YYYY-MM-DD
export async function getDashboardStats(opts: { since: string; bookingsDate?: string }): Promise<DashboardStats> {
  await delay();
  maybeFail("dashboard");
  const { since, bookingsDate = toDateKey(new Date()) } = opts;
  const db = readDb();
  const orders = db.orders.filter((o) => o.createdAt >= since && o.status !== "cancelled");
  const reservations = db.reservations.filter((r) => r.date === bookingsDate && r.status !== "cancelled");
  const revenue = orders.reduce((s, o) => s + o.totals.total, 0);

  const byHour = Array.from({ length: 13 }, (_, i) => ({ hour: 11 + i, orders: 0, revenue: 0 }));
  for (const o of orders) {
    const slot = byHour.find((b) => b.hour === new Date(o.createdAt).getHours());
    if (slot) {
      slot.orders += 1;
      slot.revenue += o.totals.total;
    }
  }

  const dishCounts = new Map<string, number>();
  for (const o of orders) for (const l of o.lines) dishCounts.set(l.name, (dishCounts.get(l.name) ?? 0) + l.quantity);

  return clone({
    since,
    bookingsDate,
    orders: orders.length,
    revenue,
    averageTicket: orders.length ? Math.round(revenue / orders.length) : 0,
    bookings: reservations.length,
    covers: reservations.reduce((s, r) => s + r.partySize, 0),
    activeOrders: orders.filter((o) => ["received", "cooking", "ready"].includes(o.status)).length,
    ordersByHour: byHour,
    topDishes: [...dishCounts.entries()]
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5),
  });
}
