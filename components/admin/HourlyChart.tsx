"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface HourlyChartProps {
  data: { hour: number; orders: number; revenue: number }[];
}

const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h >= 12 ? "p" : "a"}`;

function niceMax(value: number) {
  if (value <= 4) return 4;
  const step = value <= 10 ? 2 : 5;
  return Math.ceil(value / step) * step;
}

/**
 * Single-series column chart: orders per hour.
 * Columns ≤24px, 4px rounded data-end, hairline grid, hover/focus tooltip, table view.
 * Bars grow with scaleY (transform only). Colour: clay, validated against the paper surface.
 */
export function HourlyChart({ data }: HourlyChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const max = niceMax(Math.max(...data.map((d) => d.orders), 1));
  const ticks = [0, max / 2, max];
  const peak = data.reduce((best, d) => (d.orders > best.orders ? d : best), data[0]);

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl">Orders by hour</h2>
          <p className="text-sm text-muted">This service, 11 am – 11 pm</p>
        </div>
        <button
          type="button"
          onClick={() => setAsTable((t) => !t)}
          className="h-9 cursor-pointer rounded-full px-3 text-sm font-semibold text-muted underline decoration-line decoration-2 underline-offset-4 hover:text-ink"
          aria-pressed={asTable}
        >
          {asTable ? "Show chart" : "View as table"}
        </button>
      </div>

      {asTable ? (
        <div className="max-h-72 overflow-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <caption className="sr-only">Orders and revenue per hour, today</caption>
            <thead className="sticky top-0 bg-card text-left text-muted">
              <tr>
                <th scope="col" className="px-4 py-2 font-semibold">Hour</th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">Orders</th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {data.map((d) => (
                <tr key={d.hour} className="border-t border-line">
                  <td className="px-4 py-2">{hourLabel(d.hour)}m</td>
                  <td className="px-4 py-2 text-right">{d.orders}</td>
                  <td className="px-4 py-2 text-right">{formatMoney(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-3">
          {/* Y axis */}
          <div className="relative h-52 w-6 shrink-0 font-mono text-[0.7rem] text-muted" aria-hidden>
            {ticks.map((t) => (
              <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - (t / max) * 100}%` }}>
                {t}
              </span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="relative h-52" role="list" aria-label="Orders per hour">
              {/* Hairline grid */}
              {ticks.map((t) => (
                <div key={t} className="absolute inset-x-0 h-px bg-line" style={{ top: `${100 - (t / max) * 100}%` }} aria-hidden />
              ))}
              <div className="absolute inset-0 flex items-end">
                {data.map((d, i) => {
                  const ratio = d.orders / max;
                  const isPeak = d.hour === peak.hour && d.orders > 0;
                  return (
                    <div
                      key={d.hour}
                      role="listitem"
                      tabIndex={0}
                      aria-label={`${hourLabel(d.hour)}m: ${d.orders} orders, ${formatMoney(d.revenue)}`}
                      onMouseEnter={() => setActive(i)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(i)}
                      onBlur={() => setActive(null)}
                      className="group relative flex h-full flex-1 cursor-default items-end justify-center outline-none focus-visible:bg-ink/[0.04]"
                    >
                      {/* Hit target is the full column; the mark is ≤24px. */}
                      <motion.div
                        className={cn("w-full max-w-6 origin-bottom rounded-t-[4px] bg-sauce transition-opacity", active !== null && active !== i ? "opacity-50" : "opacity-100")}
                        style={{ height: `${Math.max(ratio * 100, d.orders ? 2 : 0)}%` }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.6, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                      />
                      {isPeak && active === null && (
                        <span className="absolute font-mono text-xs font-semibold text-ink" style={{ bottom: `calc(${ratio * 100}% + 4px)` }}>
                          {d.orders}
                        </span>
                      )}
                      {active === i && (
                        <div
                          className="pointer-events-none absolute z-10 w-max rounded-lg bg-ink px-3 py-2 text-xs text-cream shadow-lift"
                          style={{ bottom: `calc(${ratio * 100}% + 10px)` }}
                          role="tooltip"
                        >
                          <p className="font-semibold">{hourLabel(d.hour)}m</p>
                          <p className="font-mono">{d.orders} orders · {formatMoney(d.revenue)}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* X axis */}
            <div className="mt-2 flex font-mono text-[0.7rem] text-muted" aria-hidden>
              {data.map((d, i) => (
                <span key={d.hour} className="flex-1 text-center">
                  {i % 2 === 0 ? hourLabel(d.hour) : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
