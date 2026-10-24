"use client";

import { motion } from "framer-motion";
import { DishImage } from "@/components/brand/DishImage";
import { useCart } from "@/lib/store/cart";
import { useFly } from "@/lib/store/fly";

const SIZE = 56;

/** Renders the add-to-cart flights: a thumbnail arcs from the dish card into the cart. */
export function FlyLayer() {
  const flights = useFly((s) => s.flights);
  const land = useFly((s) => s.land);
  const announcement = useCart((s) => s.announcement);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[70]" aria-hidden>
        {flights.map((f) => {
          const startX = f.from.x + f.from.width / 2 - SIZE / 2;
          const startY = f.from.y + f.from.height / 2 - SIZE / 2;
          const dx = f.to.x - SIZE / 2 - startX;
          const dy = f.to.y - SIZE / 2 - startY;
          // Peak of the arc sits above whichever point is higher.
          const lift = Math.min(0, dy) - 90;
          return (
            <motion.div
              key={f.id}
              className="absolute left-0 top-0"
              style={{ width: SIZE, height: SIZE }}
              initial={{ x: startX, y: startY, scale: 1.4, opacity: 0 }}
              animate={{
                x: [startX, startX + dx * 0.55, startX + dx],
                y: [startY, startY + lift, startY + dy],
                scale: [1.4, 1, 0.35],
                opacity: [0, 1, 0.9],
              }}
              transition={{ duration: 0.6, times: [0, 0.45, 1], ease: [0.45, 0, 0.55, 1] }}
              onAnimationComplete={() => land(f.id)}
            >
              <DishImage name="" category={f.category} src={f.image} shape="circle" className="h-full w-full shadow-lift ring-2 ring-card" />
            </motion.div>
          );
        })}
      </div>
      {/* Screen-reader confirmation for every cart change. */}
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}
