"use client";

import { motion } from "framer-motion";
import { Check, ChefHat, ClipboardCheck, PackageCheck } from "lucide-react";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { status: "received", label: "Received", detail: "On the kitchen rail", icon: ClipboardCheck },
  { status: "cooking", label: "On the grill", detail: "Sizzling right now", icon: ChefHat },
  { status: "ready", label: "Ready", detail: "Hot and waiting", icon: PackageCheck },
] as const;

function stepIndex(status: OrderStatus) {
  if (status === "completed") return 3;
  return STEPS.findIndex((s) => s.status === status);
}

/** Animated Received → Cooking → Ready tracker. Progress uses scaleX, never width. */
export function StatusTracker({ status, fulfillment }: { status: OrderStatus; fulfillment: "pickup" | "delivery" }) {
  const current = stepIndex(status);
  const progress = Math.min(1, Math.max(0, current) / (STEPS.length - 1));

  if (status === "cancelled") {
    return <p className="rounded-xl bg-tomato-tint p-4 font-semibold text-tomato">This order was cancelled. You haven&apos;t been charged.</p>;
  }

  return (
    <div>
      <ol className="relative grid grid-cols-3" aria-label="Order progress">
        {/* Track + animated fill */}
        <div className="absolute left-[16.66%] right-[16.66%] top-6 h-1 rounded-full bg-line" aria-hidden>
          <motion.div
            className="h-full origin-left rounded-full bg-lettuce"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
          />
        </div>
        {STEPS.map((step, i) => {
          const done = i < current || status === "completed" || (i === current && step.status === "ready");
          const active = i === current && !done;
          const Icon = step.icon;
          return (
            <li key={step.status} className="relative flex flex-col items-center text-center" aria-current={i === current ? "step" : undefined}>
              <motion.span
                className={cn(
                  "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-500",
                  done ? "border-lettuce bg-lettuce text-cream" : active ? "border-ink bg-ink text-cream" : "border-line bg-card text-muted",
                )}
                animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={active ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { type: "spring", stiffness: 400, damping: 20 }}
              >
                {done ? (
                  <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
                    <Check className="h-5 w-5" aria-hidden />
                  </motion.span>
                ) : (
                  <Icon className="h-5 w-5" aria-hidden />
                )}
                {active && <span className="absolute inset-0 animate-ping rounded-full border-2 border-ink/40" aria-hidden />}
              </motion.span>
              <span className={cn("mt-3 font-semibold", !done && !active && "text-muted")}>{step.label}</span>
              <span className="mt-0.5 hidden text-sm text-muted sm:block">
                {step.status === "ready" ? (fulfillment === "pickup" ? "At the counter" : "With your driver") : step.detail}
              </span>
              <span className="sr-only">{done ? "(done)" : active ? "(in progress)" : "(up next)"}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
