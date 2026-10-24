"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowRight, Store, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { toast } from "@/components/ui/Toaster";
import { ordersApi, subscribeToDb } from "@/lib/api";
import { formatClock } from "@/lib/dates";
import { formatServiceLabel, getServiceStart } from "@/lib/hours";
import { formatMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";
import type { Order, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AdminPageHeader, SampleDataBadge } from "./AdminShell";
import { ORDER_STATUS_META, StatusPill } from "./StatusPill";

const COLUMNS: OrderStatus[] = ["received", "cooking", "ready", "completed"];
const DONE_PREVIEW = 4;
const NEXT: Partial<Record<OrderStatus, OrderStatus>> = { received: "cooking", cooking: "ready", ready: "completed" };
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = { received: "Start cooking", cooking: "Mark ready", ready: "Handed over" };

function minutesAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  return mins < 1 ? "just now" : mins < 60 ? `${mins} min ago` : formatClock(iso);
}

function OrderTicket({ order, onStatus }: { order: Order; onStatus: (o: Order, s: OrderStatus) => void }) {
  const next = NEXT[order.status];
  const items = order.lines.reduce((n, l) => n + l.quantity, 0);
  const isNew = Date.now() - new Date(order.createdAt).getTime() < 5 * 60_000 && order.status === "received";

  return (
    <motion.article
      layout
      layoutId={order.id}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className={cn("drop-shadow-[0_10px_18px_rgba(31,25,21,0.14)]", order.status === "cancelled" && "opacity-60")}
      aria-labelledby={`order-${order.id}`}
    >
      <div className="ticket-edge bg-card px-4 pb-6 pt-4 font-mono text-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 id={`order-${order.id}`} className="text-base font-semibold">
            {order.number}
            {isNew && <span className="ml-2 rounded bg-tomato px-1.5 py-0.5 align-middle text-[0.6rem] font-semibold uppercase tracking-wider text-white">New</span>}
          </h3>
          <p className="text-xs text-muted">{minutesAgo(order.createdAt)}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-ink/[0.06] px-2 py-1 font-sans text-xs font-semibold">
          {order.fulfillment === "pickup" ? <Store className="h-3.5 w-3.5" aria-hidden /> : <Truck className="h-3.5 w-3.5" aria-hidden />}
          {order.fulfillment === "pickup" ? "Pickup" : "Delivery"}
        </span>
      </div>
      <p className="mt-2 font-sans font-semibold">{order.customer.name}</p>
      {order.scheduledFor && <p className="font-sans text-xs text-muted">Scheduled · {formatClock(order.scheduledFor)}</p>}
      <div className="perforation my-2.5" aria-hidden />
      <ul className="space-y-0.5" aria-label={`${items} items`}>
        {order.lines.map((l) => (
          <li key={l.dishId} className="flex gap-2">
            <span className="text-muted">{l.quantity}×</span>
            <span className="min-w-0 flex-1 truncate">{l.name}</span>
          </li>
        ))}
      </ul>
      <div className="perforation my-2.5" aria-hidden />
      <div className="flex items-center justify-between">
        <span className="font-semibold tabular-nums">{formatMoney(order.totals.total)}</span>
        {order.status === "cancelled" ? <StatusPill status="cancelled" /> : null}
      </div>
      {order.status !== "completed" && order.status !== "cancelled" && (
        <div className="mt-3 flex items-center gap-2 font-sans">
          {next && (
            <Button size="sm" className="flex-1" onClick={() => onStatus(order, next)}>
              {NEXT_LABEL[order.status]} <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          )}
          <label className="sr-only" htmlFor={`status-${order.id}`}>
            Set status for {order.number}
          </label>
          <select
            id={`status-${order.id}`}
            value={order.status}
            onChange={(e) => onStatus(order, e.target.value as OrderStatus)}
            className="h-10 cursor-pointer rounded-full border border-line bg-card px-3 text-xs font-semibold focus:border-ink focus:outline-none"
          >
            {(["received", "cooking", "ready", "completed", "cancelled"] as OrderStatus[]).map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
      )}
      </div>
    </motion.article>
  );
}

export function OrdersRail() {
  const now = new Date();
  const serviceStart = getServiceStart(now);
  const since = serviceStart.toISOString();
  const { status, data, error, reload, setData } = useAsync(() => ordersApi.listOrders({ since }), [since]);
  const [showCancelled, setShowCancelled] = useState(false);
  const [showAllDone, setShowAllDone] = useState(false);

  // New orders arrive via polling (the demo kitchen timer) and DB change events.
  useEffect(() => {
    const refresh = () => void reload({ quiet: true });
    const timer = setInterval(refresh, 5000);
    const unsubscribe = subscribeToDb(refresh);
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [reload]);

  const changeStatus = async (order: Order, next: OrderStatus) => {
    if (!data) return;
    setData(data.map((o) => (o.id === order.id ? { ...o, status: next, autoAdvance: false } : o))); // optimistic
    try {
      await ordersApi.updateOrderStatus(order.id, next);
      toast(`${order.number} → ${ORDER_STATUS_META[next].label}`);
    } catch {
      toast(`Couldn't update ${order.number}.`, "error");
      void reload({ quiet: true });
    }
  };

  const orders = data ?? [];
  const cancelled = orders.filter((o) => o.status === "cancelled");

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description={
          <span className="flex flex-wrap items-center gap-2">
            {formatServiceLabel(serviceStart, now)} · updates live <SampleDataBadge />
          </span>
        }
        actions={
          cancelled.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setShowCancelled((s) => !s)} aria-pressed={showCancelled}>
              {showCancelled ? "Hide" : "Show"} cancelled ({cancelled.length})
            </Button>
          ) : undefined
        }
      />

      {status === "error" && !data ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : !data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-busy="true">
          {COLUMNS.map((c) => (
            <Skeleton key={c} className="h-96 rounded-[1.25rem]" />
          ))}
        </div>
      ) : (
        <LayoutGroup>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 xl:mx-0 xl:grid xl:grid-cols-4 xl:overflow-visible xl:px-0">
            {COLUMNS.map((col) => {
              const all = orders.filter((o) => o.status === col || (showCancelled && col === "completed" && o.status === "cancelled"));
              // Completed tickets pile up — keep the rail scannable.
              const collapsed = col === "completed" && !showAllDone && all.length > DONE_PREVIEW;
              const items = collapsed ? all.slice(0, DONE_PREVIEW) : all;
              const meta = ORDER_STATUS_META[col];
              const Icon = meta.icon;
              return (
                <section key={col} className="w-[82%] shrink-0 snap-start sm:w-[45%] xl:w-auto" aria-labelledby={`col-${col}`}>
                  {/* The rail */}
                  <div className="relative mb-4 flex items-center justify-between rounded-full bg-ink px-4 py-2.5 text-cream">
                    <h2 id={`col-${col}`} className="flex items-center gap-2 font-semibold">
                      <Icon className="h-4 w-4 text-mustard" aria-hidden /> {meta.label}
                    </h2>
                    <span className="rounded-full bg-cream/15 px-2 font-mono text-sm">{all.length}</span>
                  </div>
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {items.map((o) => (
                        <OrderTicket key={o.id} order={o} onStatus={changeStatus} />
                      ))}
                    </AnimatePresence>
                    {items.length === 0 && (
                      <p className="rounded-2xl border-2 border-dashed border-line px-4 py-8 text-center text-sm text-muted">Nothing here right now.</p>
                    )}
                    {col === "completed" && all.length > DONE_PREVIEW && (
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowAllDone((s) => !s)} aria-expanded={showAllDone}>
                        {showAllDone ? "Show fewer" : `Show ${all.length - DONE_PREVIEW} more`}
                      </Button>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </LayoutGroup>
      )}
    </div>
  );
}
