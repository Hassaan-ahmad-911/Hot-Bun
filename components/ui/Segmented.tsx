"use client";

import { motion } from "framer-motion";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

interface SegmentedProps<T extends string> {
  legend: string;
  hideLegend?: boolean;
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  className?: string;
}

/**
 * Segmented control built on native radio inputs (arrow keys work for free),
 * with a sliding pill that follows the selection.
 */
export function Segmented<T extends string>({ legend, hideLegend, value, onChange, options, className }: SegmentedProps<T>) {
  const name = useId();
  return (
    <fieldset className={className}>
      <legend className={cn("mb-2 text-sm font-semibold", hideLegend && "sr-only")}>{legend}</legend>
      <div className="relative grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-ink/[0.06] p-1">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <label
              key={opt.value}
              className={cn(
                "relative flex min-h-[44px] cursor-pointer items-center justify-center rounded-full px-4 text-center text-sm font-semibold transition-colors duration-200",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tomato",
                selected ? "text-cream" : "text-ink hover:text-ink/80",
                opt.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={selected}
                disabled={opt.disabled}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              {selected && (
                <motion.span
                  layoutId={`${name}-pill`}
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  aria-hidden
                />
              )}
              <span className="relative z-10 flex flex-col leading-tight">
                {opt.label}
                {opt.description && <span className="text-xs font-normal opacity-80">{opt.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
