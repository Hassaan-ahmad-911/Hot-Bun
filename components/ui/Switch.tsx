"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Hide the visible label text (still announced). */
  hideLabel?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onChange, label, hideLabel, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("group inline-flex min-h-[44px] cursor-pointer items-center gap-3 disabled:cursor-not-allowed disabled:opacity-50", className)}
    >
      <span
        className={cn(
          "relative flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors duration-200",
          checked ? "bg-lettuce" : "bg-line",
        )}
      >
        <motion.span
          className="h-5 w-5 rounded-full bg-card shadow"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 32 }}
        />
      </span>
      <span className={cn("text-sm font-medium", hideLabel && "sr-only")}>{label}</span>
    </button>
  );
}
