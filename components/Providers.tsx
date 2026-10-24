"use client";

import { MotionConfig } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { useAdminAuth } from "@/lib/store/admin-auth";
import { useCart } from "@/lib/store/cart";

/**
 * App-wide client setup:
 * - MotionConfig reducedMotion="user" makes every Framer animation respect
 *   prefers-reduced-motion (transforms are skipped, opacity fades remain).
 * - Persisted stores hydrate after mount to avoid SSR mismatches.
 */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useCart.persist.rehydrate();
    void useAdminAuth.persist.rehydrate();

    // Keep the cart in sync across tabs.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "hotbun:cart:v1") void useCart.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
