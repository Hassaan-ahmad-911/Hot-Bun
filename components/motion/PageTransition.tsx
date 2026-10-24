"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { BunMark } from "@/components/brand/Logo";
import { EASE_HEARTH } from "./Reveal";

/** First load gets no curtain (it would delay first paint); every later navigation does. */
let hasMounted = false;

/**
 * Route transition: a tomato curtain with the bun mark sweeps up off the new page,
 * then the content rises in. Transform/opacity only; MotionConfig skips the
 * transforms for reduced-motion users.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const [withCurtain] = useState(() => hasMounted);
  useEffect(() => {
    hasMounted = true;
  }, []);

  return (
    <>
      {withCurtain && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[90] flex origin-top items-center justify-center bg-tomato"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <motion.div initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
            <BunMark className="h-20 w-20 text-cream" />
          </motion.div>
        </motion.div>
      )}
      <motion.div
        // First paint renders content immediately (good for LCP and no-JS); later pages rise in.
        initial={withCurtain ? { opacity: 0, y: 24 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_HEARTH, delay: 0.12 }}
      >
        {children}
      </motion.div>
    </>
  );
}
