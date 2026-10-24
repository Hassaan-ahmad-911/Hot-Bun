"use client";

import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { dashboardApi, ordersApi, reservationsApi, subscribeToDb } from "@/lib/api";
import { formatClock, formatDateLong, formatTime, toDateKey } from "@/lib/dates";
import { formatMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";
import { formatServiceLabel, getServiceStart } from "@/lib/hours";
import { useAdminAuth } from "@/lib/store/admin-auth";
import { AdminPageHeader, SampleDataBadge } from "./AdminShell";
import { HourlyChart } from "./HourlyChart";
import { StatusPill } from "./StatusPill";

function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="h-full rounded-[1.25rem] border-2 border-ink bg-card p-5 shadow-pop">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight">{value}</p>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
    </div>
  );
}

export function Dashboard() {
  const user = useAdminAuth((s) => s.user);
  const now = new Date();
  const today = toDateKey(now);
  const serviceStart = getServiceStart(now);
  const since = serviceStart.toISOString();
  const data = useAsync(
    async () => {
      const [stats, orders, bookings] = await Promise.all([
        dashboardApi.getDashboardStats({ since, bookingsDate: today }),
        ordersApi.listOrders({ since }),
        reservationsApi.listReservations(today),
      ]);
      return { stats, orders, bookings };
    },
    [since, today],
  );

  const { reload } = data;
  useEffect(() => subscribeToDb(() => void reload({ quiet: true })), [reload]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <AdminPageHeader
        title={`${greeting}, ${user?.name.split(" ")[0] ?? "chef"}.`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {formatDateLong(now)} · {formatServiceLabel(serviceStart, now)} <SampleDataBadge />
          </span>
        }
      />

      {data.status === "error" && !data.data ? (
        <ErrorState message={data.error} onRetry={() => reload()} />
      ) : !data.data ? (
        <div className="space-y-6" aria-busy="true">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-32 rounded-[1.25rem]" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-[1.25rem]" />
        </div>
      ) : (
        <>
          <RevealGroup className="grid grid-cols-2 gap-4 xl:grid-cols-4" stagger={0.06}>
            <RevealItem>
              <StatTile label="Orders this service" value={String(data.data.stats.orders)} note={`${data.data.stats.activeOrders} in the kitchen now`} />
            </RevealItem>
            <RevealItem>
              <StatTile label="Revenue" value={formatMoney(data.data.stats.revenue)} note="Incl. tax, tips & delivery" />
            </RevealItem>
            <RevealItem>
              <StatTile label="Average order" value={formatMoney(data.data.stats.averageTicket)} />
            </RevealItem>
            <RevealItem>
              <StatTile label="Bookings tonight" value={String(data.data.stats.bookings)} note={`${data.data.stats.covers} covers`} />
            </RevealItem>
          </RevealGroup>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <section className="rounded-[1.25rem] border-2 border-ink bg-card p-5 shadow-pop sm:p-6">
              <HourlyChart data={data.data.stats.ordersByHour} />
            </section>

            <section className="rounded-[1.25rem] border-2 border-ink bg-card p-5 shadow-pop sm:p-6" aria-labelledby="top-dishes">
              <h2 id="top-dishes" className="font-display text-xl">Top dishes this service</h2>
              <ol className="mt-4 divide-y divide-line">
                {data.data.stats.topDishes.map((d, i) => (
                  <li key={d.name} className="flex items-center gap-3 py-3">
                    <span className="w-5 font-mono text-sm text-muted">{i + 1}</span>
                    <span className="flex-1 font-semibold">{d.name}</span>
                    <span className="font-mono text-sm tabular-nums">{d.quantity} sold</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="rounded-[1.25rem] border-2 border-ink bg-card p-5 shadow-pop sm:p-6" aria-labelledby="recent-orders">
              <div className="flex items-center justify-between">
                <h2 id="recent-orders" className="font-display text-xl">Latest orders</h2>
                <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold underline decoration-line decoration-2 underline-offset-4 hover:decoration-tomato">
                  Open the rail <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <ul className="mt-4 divide-y divide-line">
                {data.data.orders.slice(0, 5).map((o) => (
                  <li key={o.id} className="flex items-center gap-3 py-3">
                    <span className="font-mono text-sm font-semibold">{o.number}</span>
                    <span className="min-w-0 flex-1 truncate">
                      {o.customer.name} <span className="text-sm text-muted">· {formatClock(o.createdAt)}</span>
                    </span>
                    <StatusPill status={o.status} />
                    <span className="hidden w-20 text-right font-mono text-sm tabular-nums sm:block">{formatMoney(o.totals.total)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[1.25rem] border-2 border-ink bg-card p-5 shadow-pop sm:p-6" aria-labelledby="tonight">
              <div className="flex items-center justify-between">
                <h2 id="tonight" className="font-display text-xl">Tonight&apos;s book</h2>
                <Link href="/admin/reservations" className="inline-flex items-center gap-1 text-sm font-semibold underline decoration-line decoration-2 underline-offset-4 hover:decoration-tomato">
                  All bookings <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              {data.data.bookings.length === 0 ? (
                <p className="mt-6 text-muted">No bookings today — the oven rests on Mondays.</p>
              ) : (
                <ul className="mt-4 divide-y divide-line">
                  {data.data.bookings.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex items-center gap-3 py-3">
                      <span className="w-16 font-mono text-sm font-semibold">{formatTime(r.time)}</span>
                      <span className="min-w-0 flex-1 truncate">{r.name}</span>
                      <span className="inline-flex items-center gap-1 font-mono text-sm text-muted">
                        <Users className="h-4 w-4" aria-hidden />
                        <span className="sr-only">Party of</span>
                        {r.partySize}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
