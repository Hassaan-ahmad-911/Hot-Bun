"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useEffect, useRef, type RefObject } from "react";
import { Stepper } from "@/components/ui/Stepper";
import { selectQuantityOf, useCart } from "@/lib/store/cart";
import { useFly } from "@/lib/store/fly";
import type { Dish } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AddToCartProps {
  dish: Dish;
  /** Element the flying thumbnail starts from (usually the dish photo). */
  sourceRef?: RefObject<HTMLElement | null>;
  tone?: "light" | "dark";
  className?: string;
  /** Show the price inside the add button ("Add · $19"). */
  withPrice?: string;
}

/** "Add" button that morphs into a quantity stepper once the dish is on the ticket. */
export function AddToCart({ dish, sourceRef, tone = "light", className, withPrice }: AddToCartProps) {
  const quantity = useCart(selectQuantityOf(dish.id));
  const hydrated = useCart((s) => s.hydrated);
  const { add, increment, decrement } = useCart();
  const launch = useFly((s) => s.launch);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hadFocus = useRef(false);
  const inCart = hydrated && quantity > 0;

  // Keep keyboard focus when the Add button and the stepper swap places.
  useEffect(() => {
    if (!hadFocus.current) return;
    hadFocus.current = false;
    const target = wrapperRef.current?.querySelector<HTMLElement>(inCart ? 'button[aria-label^="Increase"]' : "button");
    target?.focus();
  }, [inCart]);

  const rememberFocus = () => {
    hadFocus.current = Boolean(wrapperRef.current?.contains(document.activeElement));
  };

  if (!dish.available) {
    return (
      <span
        className={cn(
          "inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold",
          tone === "dark" ? "bg-cream/10 text-fog" : "bg-ink/[0.06] text-muted",
          className,
        )}
      >
        Sold out today
      </span>
    );
  }

  const handleAdd = () => {
    rememberFocus();
    add(dish);
    const source = sourceRef?.current;
    if (source) launch(source, { category: dish.category, image: dish.image });
  };

  return (
    <div ref={wrapperRef} className={cn("inline-flex", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {inCart ? (
          <motion.div
            key="stepper"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Stepper
              value={quantity}
              label={dish.name}
              removeAtMin
              tone={tone}
              onIncrement={() => increment(dish.id)}
              onDecrement={() => {
                rememberFocus();
                decrement(dish.id);
              }}
            />
          </motion.div>
        ) : (
          <motion.button
            key="add"
            type="button"
            onClick={handleAdd}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="group inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-ink bg-tomato pl-2 pr-4 font-display text-base font-bold text-white shadow-pop-sm transition-colors hover:bg-tomato-deep"
            aria-label={`Add ${dish.name} to your order`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-mustard text-ink transition-transform duration-300 ease-snap group-hover:rotate-90">
              <Plus className="h-4 w-4" aria-hidden />
            </span>
            {withPrice ? `Add · ${withPrice}` : "Add"}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
