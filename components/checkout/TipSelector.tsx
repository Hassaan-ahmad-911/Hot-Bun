"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId } from "react";
import { Field, Input } from "@/components/ui/Field";
import { formatMoney } from "@/lib/format";
import { TIP_PRESETS, tipFromPercent } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface TipSelectorProps {
  subtotal: number;
  percent: number | null;
  custom: string;
  onPercent: (value: number | null) => void;
  onCustom: (value: string) => void;
  customError?: string;
}

/** Tip presets with live dollar amounts; "Custom" reveals an amount field. */
export function TipSelector({ subtotal, percent, custom, onPercent, onCustom, customError }: TipSelectorProps) {
  const name = useId();
  const options: { key: string; value: number | null; label: string; amount?: string }[] = [
    ...TIP_PRESETS.map((p) => ({
      key: String(p),
      value: p,
      label: p === 0 ? "No tip" : `${p}%`,
      amount: p === 0 ? undefined : formatMoney(tipFromPercent(subtotal, p)),
    })),
    { key: "custom", value: null, label: "Custom" },
  ];

  return (
    <fieldset>
      <legend className="sr-only">Tip for the kitchen</legend>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {options.map((opt) => {
          const selected = opt.value === percent;
          return (
            <label
              key={opt.key}
              className={cn(
                "relative flex min-h-[4rem] cursor-pointer flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition-[border-color,background-color,transform] duration-200 active:scale-[0.97]",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tomato",
                selected ? "border-ink bg-ink text-cream" : "border-line bg-card hover:border-muted/50",
              )}
            >
              <input type="radio" name={name} className="sr-only" checked={selected} onChange={() => onPercent(opt.value)} />
              <span className="font-semibold">{opt.label}</span>
              {opt.amount && <span className={cn("font-mono text-xs", selected ? "text-fog" : "text-muted")}>{opt.amount}</span>}
            </label>
          );
        })}
      </div>
      <AnimatePresence initial={false}>
        {percent === null && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-3 max-w-[12rem]">
            <Field label="Tip amount ($)" error={customError}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  inputMode="decimal"
                  placeholder="5.00"
                  value={custom}
                  onChange={(e) => onCustom(e.target.value.replace(/[^\d.]/g, ""))}
                />
              )}
            </Field>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-3 text-sm text-muted">100% of tips go to the kitchen and floor team.</p>
    </fieldset>
  );
}
