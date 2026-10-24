"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface StepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  /** Accessible name of the thing being counted, e.g. "Pkhali Trio". */
  label: string;
  size?: "sm" | "md";
  /** Show a bin icon instead of minus when decrementing would remove the item. */
  removeAtMin?: boolean;
  tone?: "light" | "dark";
  className?: string;
}

/** Quantity stepper with a rolling number. */
export function Stepper({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max = 20,
  label,
  size = "md",
  removeAtMin,
  tone = "light",
  className,
}: StepperProps) {
  const prev = useRef(value);
  const direction = value >= prev.current ? 1 : -1;
  prev.current = value;

  const btn = cn(
    "flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-[transform,background-color] duration-150 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40",
    size === "sm" ? "h-9 w-9" : "h-11 w-11",
    tone === "dark" ? "text-cream hover:bg-cream/10" : "text-ink hover:bg-ink/[0.07]",
  );
  const showBin = removeAtMin && value <= Math.max(1, min + 1);

  return (
    <div
      role="group"
      aria-label={`Quantity of ${label}`}
      className={cn(
        "inline-flex items-center rounded-full",
        tone === "dark" ? "bg-ink-soft" : "bg-card shadow-inset-line",
        className,
      )}
    >
      <button
        type="button"
        className={btn}
        onClick={onDecrement}
        disabled={!removeAtMin && value <= min}
        aria-label={showBin ? `Remove ${label}` : `Decrease ${label}`}
      >
        {showBin ? <Trash2 className="h-4 w-4" aria-hidden /> : <Minus className="h-4 w-4" aria-hidden />}
      </button>
      <span
        className={cn("relative grid overflow-hidden text-center font-mono font-semibold tabular-nums", size === "sm" ? "h-9 w-6 text-sm" : "h-11 w-8")}
        aria-live="polite"
      >
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.span
            key={value}
            custom={direction}
            className="col-start-1 row-start-1 flex items-center justify-center"
            initial={{ y: direction * 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction * -14, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button type="button" className={btn} onClick={onIncrement} disabled={value >= max} aria-label={`Increase ${label}`}>
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
