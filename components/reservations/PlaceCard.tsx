"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BunMark } from "@/components/brand/Logo";
import { formatDateShort, formatTime, fromDateKey } from "@/lib/dates";
import type { SeatingPreference } from "@/lib/types";
import { cn } from "@/lib/utils";

export const SEATING_LABEL: Record<SeatingPreference, string> = {
  booth: "Booth",
  counter: "Grill counter",
  patio: "Patio",
};

interface PlaceCardProps {
  name?: string;
  date?: string | null;
  time?: string | null;
  partySize: number;
  seating: SeatingPreference;
  /** When set, the card flips to its confirmed side. */
  code?: string;
  className?: string;
}

function Value({ children, k }: { children: React.ReactNode; k: string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={k}
        className="inline-block"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

/** Live place-card preview of the booking; flips over to reveal the confirmation. */
export function PlaceCard({ name, date, time, partySize, seating, code, className }: PlaceCardProps) {
  const displayName = name?.trim() || "Your name";
  const dateLabel = date ? formatDateShort(fromDateKey(date)) : "Pick a date";
  const timeLabel = time ? formatTime(time) : "—";

  const face = "absolute inset-0 flex flex-col rounded-[1.25rem] [backface-visibility:hidden]";

  return (
    <div className={cn("[perspective:1400px]", className)}>
      <motion.div
        className="relative aspect-[5/6] w-full [transform-style:preserve-3d]"
        animate={{ rotateY: code ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 70, damping: 14 }}
      >
        {/* Front: live preview */}
        <div className={cn(face, "border-2 border-ink bg-card p-6 shadow-pop-lg")} aria-hidden={Boolean(code)}>
          <div className="flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-[0.25em] text-muted">
            <span>HOT BUN</span>
            <span>Reserved</span>
          </div>
          <div className="my-auto text-center">
            <BunMark className="mx-auto h-12 w-10 text-ink" />
            <p className="mt-5 font-mono text-xs uppercase tracking-[0.25em] text-muted">A table for</p>
            <p className={cn("mt-2 break-words font-display text-4xl uppercase leading-tight", !name?.trim() && "text-muted/60")}>
              <Value k={displayName}>{displayName}</Value>
            </p>
          </div>
          <div className="my-4 border-t-2 border-dashed border-ink" aria-hidden />
          <dl className="grid grid-cols-3 gap-2 text-center font-mono text-sm">
            <div>
              <dt className="text-[0.65rem] uppercase tracking-wider text-muted">Date</dt>
              <dd className="mt-1 font-semibold">
                <Value k={dateLabel}>{dateLabel}</Value>
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] uppercase tracking-wider text-muted">Time</dt>
              <dd className="mt-1 font-semibold">
                <Value k={timeLabel}>{timeLabel}</Value>
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] uppercase tracking-wider text-muted">Guests</dt>
              <dd className="mt-1 font-semibold">
                <Value k={String(partySize)}>{partySize}</Value>
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-center text-xs text-muted">
            <Value k={seating}>{SEATING_LABEL[seating]}</Value>
          </p>
        </div>

        {/* Back: confirmed */}
        <div className={cn(face, "on-dark border-2 border-ink bg-tomato p-6 text-white shadow-pop-lg [transform:rotateY(180deg)]")} aria-hidden={!code}>
          <div className="flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-[0.25em] text-white">
            <span>HOT BUN</span>
            <span>Confirmed</span>
          </div>
          <div className="my-auto text-center">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-white">See you soon</p>
            <p className="mt-3 break-words font-display text-4xl uppercase leading-tight">{displayName}</p>
            <p className="mt-4 font-mono text-sm text-white">
              {dateLabel} · {timeLabel} · {partySize} {partySize === 1 ? "guest" : "guests"}
            </p>
          </div>
          <div className="mx-auto -rotate-2 rounded-xl border-2 border-ink bg-mustard px-5 py-2 text-ink shadow-pop-sm text-center">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em]">Booking code</p>
            <p className="font-mono text-2xl font-semibold tracking-[0.15em]">{code ?? "RSV-0000"}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
