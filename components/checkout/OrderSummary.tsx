"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Perforation, Ticket, TicketHeader, TicketRow } from "@/components/brand/Ticket";
import { restaurant } from "@/data/restaurant";
import { formatMoney } from "@/lib/format";
import type { OrderLine, OrderTotals } from "@/lib/types";

interface OrderSummaryProps {
  lines: Pick<OrderLine, "dishId" | "name" | "quantity" | "unitPrice">[];
  totals: OrderTotals;
  title?: string;
  meta?: string;
}

/** The checkout ticket — every cost visible, line by line. */
export function OrderSummary({ lines, totals, title = "Your order", meta }: OrderSummaryProps) {
  return (
    <Ticket>
      <TicketHeader title={title} meta={meta} />
      <Perforation />
      <ul className="space-y-2" aria-label="Order items">
        {lines.map((l) => (
          <li key={l.dishId} className="flex items-baseline gap-3">
            <span className="w-6 shrink-0 text-muted">{l.quantity}×</span>
            <span className="min-w-0 flex-1">{l.name}</span>
            <span className="shrink-0 tabular-nums">{formatMoney(l.unitPrice * l.quantity)}</span>
          </li>
        ))}
      </ul>
      <Perforation />
      <div className="space-y-1.5">
        <TicketRow label="Subtotal" value={formatMoney(totals.subtotal)} />
        <TicketRow label={`Tax ${(restaurant.taxRate * 100).toFixed(3).replace(/0+$/, "")}%`} value={formatMoney(totals.tax)} />
        <AnimatePresence initial={false}>
          {totals.deliveryFee > 0 && (
            <motion.div key="delivery" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
              <TicketRow label="Delivery" value={formatMoney(totals.deliveryFee)} />
            </motion.div>
          )}
        </AnimatePresence>
        <TicketRow label="Tip" value={formatMoney(totals.tip)} />
      </div>
      <Perforation />
      <div className="flex items-baseline justify-between text-lg font-semibold">
        <span>TOTAL</span>
        <motion.span key={totals.total} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} className="tabular-nums">
          {formatMoney(totals.total)}
        </motion.span>
      </div>
    </Ticket>
  );
}
