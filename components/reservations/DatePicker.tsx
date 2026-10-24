"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, formatDateLong, fromDateKey, startOfDay, toDateKey } from "@/lib/dates";
import { isClosedDay } from "@/lib/hours";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string | null;
  onChange: (dateKey: string) => void;
  today: Date;
  /** How far ahead bookings open. */
  maxDays?: number;
  labelledBy?: string;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/**
 * Month calendar. Closed days (Mondays, holidays), past days and days beyond the
 * booking window are disabled. Arrow keys move by day/week; focus is roving.
 */
export function DatePicker({ value, onChange, today, maxDays = 60, labelledBy }: DatePickerProps) {
  const first = startOfDay(today);
  const last = addDays(first, maxDays);
  const initialMonth = value ? fromDateKey(value) : first;
  const [month, setMonth] = useState(new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));
  const [focusKey, setFocusKey] = useState<string>(value ?? toDateKey(first));
  const gridRef = useRef<HTMLDivElement>(null);
  const shouldFocus = useRef(false);

  const days = useMemo(() => {
    const start = new Date(month);
    const offset = (start.getDay() + 6) % 7; // Monday-first
    start.setDate(start.getDate() - offset);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [month]);

  const isDisabled = (d: Date) => d < first || d > last || isClosedDay(d);

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusKey}"]`)?.focus();
  }, [focusKey, month]);

  const moveFocus = (from: string, delta: number) => {
    let next = addDays(fromDateKey(from), delta);
    if (next < first || next > last) return;
    // Skip over disabled days in the direction of travel.
    let guard = 0;
    while (isDisabled(next) && guard++ < 14) {
      const step = delta > 0 ? 1 : -1;
      const candidate = addDays(next, Math.abs(delta) === 7 ? 7 * step : step);
      if (candidate < first || candidate > last) return;
      next = candidate;
    }
    const key = toDateKey(next);
    if (next.getMonth() !== month.getMonth()) setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    shouldFocus.current = true;
    setFocusKey(key);
  };

  const onKeyDown = (e: React.KeyboardEvent, key: string) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in map) {
      e.preventDefault();
      moveFocus(key, map[e.key]);
    }
  };

  const canPrev = month > new Date(first.getFullYear(), first.getMonth(), 1);
  const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= last;
  const monthLabel = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Keep a focusable day inside the visible month.
  const visibleKeys = new Set(days.filter((d) => d.getMonth() === month.getMonth() && !isDisabled(d)).map(toDateKey));
  const tabbableKey = visibleKeys.has(focusKey) ? focusKey : value && visibleKeys.has(value) ? value : [...visibleKeys][0];

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-xl" aria-live="polite">
          {monthLabel}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            disabled={!canPrev}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-ink/[0.07] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            disabled={!canNext}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-ink/[0.07] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center" aria-hidden>
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1 font-mono text-xs uppercase tracking-wider text-muted">
            {d}
          </span>
        ))}
      </div>
      <div ref={gridRef} role="group" aria-labelledby={labelledBy} className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = toDateKey(d);
          const inMonth = d.getMonth() === month.getMonth();
          const disabled = isDisabled(d);
          const closed = isClosedDay(d) && d >= first && d <= last;
          const selected = key === value;
          const isToday = key === toDateKey(first);
          if (!inMonth) return <span key={key} aria-hidden />;
          return (
            <button
              key={key}
              type="button"
              data-date={key}
              disabled={disabled}
              tabIndex={key === tabbableKey ? 0 : -1}
              onClick={() => {
                setFocusKey(key);
                onChange(key);
              }}
              onKeyDown={(e) => onKeyDown(e, key)}
              aria-pressed={selected}
              aria-label={`${formatDateLong(d)}${isToday ? ", today" : ""}${closed ? ", closed" : ""}`}
              className={cn(
                "relative flex aspect-square min-h-[44px] cursor-pointer flex-col items-center justify-center rounded-xl font-mono text-sm tabular-nums transition-[background-color,color,transform] duration-150 active:scale-95",
                selected ? "bg-ink font-semibold text-cream" : "hover:bg-ink/[0.07]",
                disabled && "cursor-not-allowed text-muted/40 hover:bg-transparent",
                closed && "line-through decoration-muted/40",
              )}
            >
              {d.getDate()}
              {isToday && <span className={cn("absolute bottom-1.5 h-1 w-1 rounded-full", selected ? "bg-mustard" : "bg-tomato")} aria-hidden />}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted">Closed Mondays and on struck-through dates. Bookings open {maxDays} days ahead.</p>
    </div>
  );
}
