"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { selectItemCount, selectSubtotal, useCart } from "@/lib/store/cart";
import { CART_TARGET_ATTR } from "@/lib/store/fly";

const HIDDEN_ON = ["/checkout", "/order"];

/** Native-app style sticky bar on small screens whenever the ticket has items. */
export function MobileCartBar() {
  const count = useCart(selectItemCount);
  const subtotal = useCart(selectSubtotal);
  const hydrated = useCart((s) => s.hydrated);
  const pulse = useCart((s) => s.pulse);
  const open = useCart((s) => s.open);
  const pathname = usePathname();
  const visible = hydrated && count > 0 && !HIDDEN_ON.some((p) => pathname.startsWith(p));

  return (
    <>
      {/* Reserve space so the bar never covers the end of the page. */}
      {visible && <div className="h-24 md:hidden" aria-hidden />}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-3 pt-2 md:hidden"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
          >
            <button
              type="button"
              onClick={open}
              {...{ [CART_TARGET_ATTR]: "" }}
              className="on-dark flex h-16 w-full cursor-pointer items-center gap-3 rounded-2xl bg-ink px-4 text-left text-cream shadow-lift transition-transform active:scale-[0.98]"
            >
              <motion.span
                key={pulse}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="flex h-9 min-w-9 items-center justify-center rounded-full bg-mustard px-2 font-mono text-sm font-semibold text-ink"
              >
                {count}
              </motion.span>
              <span className="flex-1">
                <span className="block font-semibold leading-tight">View your order</span>
                <span className="block text-xs text-fog">Pickup or delivery</span>
              </span>
              <span className="font-mono font-semibold tabular-nums">{formatMoney(subtotal)}</span>
              <ArrowRight className="h-5 w-5" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
