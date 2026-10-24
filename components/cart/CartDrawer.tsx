"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Receipt } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Perforation, Ticket, TicketHeader, TicketRow } from "@/components/brand/Ticket";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/States";
import { Stepper } from "@/components/ui/Stepper";
import { restaurant } from "@/data/restaurant";
import { formatMoney } from "@/lib/format";
import { computeTotals } from "@/lib/pricing";
import { selectItemCount, useCart } from "@/lib/store/cart";
import { useMenu } from "@/lib/store/menu";
import { pluralize } from "@/lib/utils";

export function CartDrawer() {
  const { lines, isOpen, close, increment, decrement } = useCart();
  const count = useCart(selectItemCount);
  const pathname = usePathname();
  const totals = computeTotals(lines);
  const { dishes, load } = useMenu();
  // Staff can mark a dish sold out while it sits in someone's ticket.
  const soldOut = new Set(dishes.filter((d) => !d.available).map((d) => d.id));
  const blocked = lines.some((l) => soldOut.has(l.dishId));

  // Close when navigating (e.g. after tapping Checkout).
  useEffect(() => close(), [pathname, close]);
  useEffect(() => {
    if (isOpen) void load();
  }, [isOpen, load]);

  return (
    <Sheet
      open={isOpen}
      onClose={close}
      title="Your order"
      description={count ? `${pluralize(count, "item")} · pickup or delivery at checkout` : undefined}
      footer={
        lines.length > 0 ? (
          <div className="space-y-3 pb-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">Estimated total</span>
              <span className="font-mono text-xl font-semibold tabular-nums">{formatMoney(totals.total)}</span>
            </div>
            {blocked ? (
              <Button size="lg" className="w-full" disabled>
                Remove sold-out items to continue
              </Button>
            ) : (
              <ButtonLink href="/checkout" size="lg" className="w-full" data-autofocus>
                Go to checkout
              </ButtonLink>
            )}
          </div>
        ) : null
      }
    >
      {lines.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-7 w-7" />}
          title="Your ticket is blank"
          action={
            <ButtonLink href="/menu" onClick={close}>
              Browse the menu
            </ButtonLink>
          }
        >
          Start with a smash burger. Everything else follows.
        </EmptyState>
      ) : (
        <Ticket className="mb-6 mt-1">
          <TicketHeader title="Order up!" meta="Smashed fresh, made to order" />
          <Perforation />
          <ul className="space-y-1" aria-label="Items in your order">
            <AnimatePresence initial={false}>
              {lines.map((line) => (
                <motion.li
                  key={line.dishId}
                  layout
                  // "Prints" onto the ticket: feeds down from the printer head.
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="py-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug">{line.name}</p>
                      {soldOut.has(line.dishId) ? (
                        <p className="text-xs font-semibold text-tomato" role="alert">
                          Just sold out — please remove
                        </p>
                      ) : (
                        <p className="text-xs text-muted">{formatMoney(line.unitPrice)} each</p>
                      )}
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums">{formatMoney(line.unitPrice * line.quantity)}</p>
                  </div>
                  <Stepper
                    className="mt-2"
                    size="sm"
                    value={line.quantity}
                    label={line.name}
                    removeAtMin
                    onIncrement={() => increment(line.dishId)}
                    onDecrement={() => decrement(line.dishId)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <Perforation />
          <motion.div layout className="space-y-1.5">
            <TicketRow label="Subtotal" value={formatMoney(totals.subtotal)} />
            <TicketRow label={`Tax (${(restaurant.taxRate * 100).toFixed(3).replace(/0+$/, "")}%)`} value={formatMoney(totals.tax)} />
            <TicketRow label="Delivery" value="at checkout" className="text-muted" />
            <Perforation />
            <TicketRow label="Total" value={formatMoney(totals.total)} strong />
          </motion.div>
        </Ticket>
      )}
    </Sheet>
  );
}
