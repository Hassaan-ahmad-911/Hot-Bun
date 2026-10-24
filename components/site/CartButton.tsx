"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { Receipt } from "lucide-react";
import { useEffect } from "react";
import { selectItemCount, useCart } from "@/lib/store/cart";
import { CART_TARGET_ATTR } from "@/lib/store/fly";
import { cn } from "@/lib/utils";

/** Header cart button. Bumps on every add; it's also the landing target for the add-to-cart flight. */
export function CartButton({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const count = useCart(selectItemCount);
  const hydrated = useCart((s) => s.hydrated);
  const pulse = useCart((s) => s.pulse);
  const open = useCart((s) => s.open);
  const shown = hydrated ? count : 0;
  const controls = useAnimationControls();

  // Bump when the flying thumbnail lands (~0.55s after the add).
  useEffect(() => {
    if (!pulse) return;
    void controls.start({ scale: [1, 1.14, 0.96, 1], transition: { duration: 0.45, delay: 0.5, ease: "easeOut" } });
  }, [pulse, controls]);

  return (
    <motion.button
      type="button"
      onClick={open}
      {...{ [CART_TARGET_ATTR]: "" }}
      animate={controls}
      className={cn(
        "relative inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-2 pl-3.5 pr-4 font-display font-bold transition-colors duration-200",
        tone === "dark" ? "border-cream bg-cream/10 text-cream hover:bg-cream/20" : "border-ink bg-ink text-cream shadow-[3px_3px_0_0_theme(colors.tomato.DEFAULT)] hover:bg-ink-soft",
        className,
      )}
      aria-label={shown ? `Your order, ${shown} item${shown === 1 ? "" : "s"}` : "Your order, empty"}
    >
      <Receipt className="h-5 w-5" aria-hidden />
      <span className="hidden text-sm sm:inline">Order</span>
      <AnimatePresence>
        {shown > 0 && (
          <motion.span
            key="count"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            className="flex h-6 min-w-6 items-center justify-center rounded-full bg-mustard px-1.5 font-mono text-xs font-semibold text-ink"
          >
            {shown}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
