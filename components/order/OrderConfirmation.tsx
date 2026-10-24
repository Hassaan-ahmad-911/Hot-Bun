"use client";

import { motion } from "framer-motion";
import { Clock, CreditCard, MapPin } from "lucide-react";
import { useEffect, useRef } from "react";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { EASE_HEARTH } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { restaurant } from "@/data/restaurant";
import { ordersApi, subscribeToDb } from "@/lib/api";
import { formatClock } from "@/lib/dates";
import { useAsync } from "@/lib/hooks";
import type { Order } from "@/lib/types";
import { StatusTracker } from "./StatusTracker";

const STATUS_COPY: Record<Order["status"], string> = {
  received: "Your order is on the rail.",
  cooking: "Your order is on the grill.",
  ready: "Your order is ready!",
  completed: "Order complete — enjoy.",
  cancelled: "This order was cancelled.",
};

/** The kitchen rail: the ticket slides up and clips on, then gets stamped PAID. */
function RailTicket({ order }: { order: Order }) {
  return (
    <div className="relative mx-auto w-full max-w-sm pt-6">
      {/* Rail */}
      <div className="absolute inset-x-[-20%] top-6 h-3 rounded-full bg-gradient-to-b from-[#8A7B6E] to-[#4A3F37] shadow-[0_2px_4px_rgba(0,0,0,0.25)]" aria-hidden />
      <motion.div
        initial={{ y: 140, rotate: -6, opacity: 0 }}
        animate={{ y: 0, rotate: [-6, 2, -1, 0], opacity: 1 }}
        transition={{ y: { type: "spring", stiffness: 160, damping: 16 }, rotate: { duration: 1.1, ease: EASE_HEARTH }, opacity: { duration: 0.2 } }}
        className="relative origin-top"
      >
        {/* Clip */}
        <motion.div
          className="absolute left-1/2 top-[-0.9rem] z-10 h-7 w-14 rounded-md bg-gradient-to-b from-[#C9BCAE] to-[#7D6F63] shadow"
          style={{ x: "-50%" }}
          initial={{ scaleY: 1.3 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.45, type: "spring", stiffness: 700, damping: 12 }}
          aria-hidden
        />
        <div className="relative pt-3">
          <OrderSummary lines={order.lines} totals={order.totals} title={order.number} meta={`${order.fulfillment === "pickup" ? "Pickup" : "Delivery"} · ${formatClock(order.createdAt)}`} />
          {/* PAID stamp */}
          <motion.div
            className="pointer-events-none absolute right-4 top-16 rounded-md border-[3px] border-tomato px-3 py-1 font-mono text-xl font-bold tracking-[0.2em] text-tomato"
            style={{ rotate: -14 }}
            initial={{ scale: 2.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 500, damping: 18 }}
            aria-hidden
          >
            PAID
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export function OrderConfirmation({ id }: { id: string }) {
  const { status, data: order, error, reload } = useAsync(() => ordersApi.getOrder(id), [id]);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Live updates: quiet polling for the demo timeline + instant refresh when staff change it.
  useEffect(() => {
    const refresh = () => void reload({ quiet: true });
    const timer = setInterval(refresh, 2000);
    const unsubscribe = subscribeToDb(refresh);
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [reload]);

  useEffect(() => {
    if (status === "ready") headingRef.current?.focus();
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status === "ready"]);

  if (status === "loading" && !order) {
    return (
      <div className="container grid gap-10 pb-24 pt-[calc(var(--header-h)+3rem)] lg:grid-cols-2" aria-busy="true">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-96 w-full max-w-sm" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container pb-24 pt-[calc(var(--header-h)+4rem)]">
        <ErrorState title="We couldn't find that order" message={error} onRetry={() => reload()} />
      </div>
    );
  }

  const readyBy = new Date(new Date(order.scheduledFor ?? order.createdAt).getTime() + (order.scheduledFor ? 0 : restaurant.pickupLeadMinutes * 60_000));

  return (
    <div className="container overflow-x-clip pb-24 pt-[calc(var(--header-h)+2.5rem)]">
      <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <motion.p
            className="font-mono text-xs uppercase tracking-[0.25em] text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Order {order.number} · confirmed
          </motion.p>
          <motion.h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 font-display text-display-lg uppercase outline-none"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE_HEARTH }}
          >
            Thank you, {order.customer.name.split(" ")[0]}.{" "}
            <span className="text-tomato">{STATUS_COPY[order.status]}</span>
          </motion.h1>
          <p className="sr-only" role="status" aria-live="polite">
            {STATUS_COPY[order.status]}
          </p>

          <motion.div
            className="mt-10 rounded-[1.5rem] border-2 border-ink bg-card p-6 shadow-pop sm:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE_HEARTH }}
          >
            <StatusTracker status={order.status} fulfillment={order.fulfillment} />
            <dl className="mt-8 grid gap-5 border-t border-line pt-6 sm:grid-cols-3">
              <div className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden />
                <div>
                  <dt className="text-sm text-muted">{order.scheduledFor ? "Scheduled for" : "Estimated ready"}</dt>
                  <dd className="font-semibold">{formatClock(readyBy.toISOString())}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden />
                <div>
                  <dt className="text-sm text-muted">{order.fulfillment === "pickup" ? "Pickup from" : "Delivering to"}</dt>
                  <dd className="font-semibold">{order.fulfillment === "pickup" ? restaurant.address.line1 : order.address?.line1}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden />
                <div>
                  <dt className="text-sm text-muted">Paid (test mode)</dt>
                  <dd className="font-semibold">•••• {order.cardLast4}</dd>
                </div>
              </div>
            </dl>
          </motion.div>

          <p className="mt-6 text-sm text-muted">
            We&apos;ve sent a receipt to <strong className="font-semibold text-ink">{order.customer.email}</strong> and will text{" "}
            {order.customer.phone} with updates.
            <span className="mt-2 block rounded-lg bg-mustard-tint/70 px-3 py-2 text-muted">
              Demo: this order moves through the kitchen in about 25 seconds — or change its status from the staff panel.
            </span>
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/menu" variant="secondary" size="lg">
              Order something else
            </ButtonLink>
            <ButtonLink href="/reservations" variant="ghost" size="lg">
              Book a table next time
            </ButtonLink>
          </div>
        </div>

        <RailTicket order={order} />
      </div>
    </div>
  );
}
