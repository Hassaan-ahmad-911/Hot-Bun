"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarX2, MessageSquareText, Phone, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { SEATING_LABEL } from "@/components/reservations/PlaceCard";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { toast } from "@/components/ui/Toaster";
import { reservationsApi, subscribeToDb } from "@/lib/api";
import { addDays, formatDateLong, formatTime, fromDateKey, toDateKey } from "@/lib/dates";
import { useAsync } from "@/lib/hooks";
import { isClosedDay } from "@/lib/hours";
import type { Reservation, ReservationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AdminPageHeader, SampleDataBadge } from "./AdminShell";

const STATUSES: { value: ReservationStatus; label: string }[] = [
  { value: "confirmed", label: "Confirmed" },
  { value: "seated", label: "Seated" },
  { value: "completed", label: "Completed" },
  { value: "no-show", label: "No-show" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_CLASS: Record<ReservationStatus, string> = {
  confirmed: "border-line",
  seated: "border-lettuce bg-lettuce-tint/40",
  completed: "border-line opacity-70",
  "no-show": "border-chili/40 bg-chili-tint/40",
  cancelled: "border-line opacity-50",
};

export function ReservationsList() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const { status, data, error, reload, setData } = useAsync(() => reservationsApi.listReservations(date), [date]);

  useEffect(() => subscribeToDb(() => void reload({ quiet: true })), [reload]);

  const days = Array.from({ length: 10 }, (_, i) => addDays(new Date(), i));
  const active = (data ?? []).filter((r) => r.status !== "cancelled");
  const covers = active.reduce((s, r) => s + r.partySize, 0);
  const closed = isClosedDay(fromDateKey(date));

  const changeStatus = async (res: Reservation, next: ReservationStatus) => {
    if (!data) return;
    setData(data.map((r) => (r.id === res.id ? { ...r, status: next } : r)));
    try {
      await reservationsApi.updateReservationStatus(res.id, next);
      toast(`${res.name} · ${formatTime(res.time)} → ${STATUSES.find((s) => s.value === next)?.label}`);
    } catch {
      toast("Couldn't update that booking.", "error");
      void reload({ quiet: true });
    }
  };

  // Group by seating time.
  const groups = (data ?? []).reduce<Record<string, Reservation[]>>((acc, r) => {
    (acc[r.time] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <AdminPageHeader
        title="Bookings"
        description={
          <span className="flex flex-wrap items-center gap-2">
            {formatDateLong(fromDateKey(date))}
            {data && !closed && (
              <span className="font-mono text-sm">
                · {active.length} bookings · {covers} covers
              </span>
            )}
            <SampleDataBadge />
          </span>
        }
        actions={
          <>
            <label htmlFor="booking-date" className="sr-only">
              Pick a date
            </label>
            <input
              id="booking-date"
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="h-10 rounded-full border border-line bg-card px-4 font-mono text-sm focus:border-ink focus:outline-none focus:ring-4 focus:ring-mustard/30"
            />
          </>
        }
      />

      {/* Day strip */}
      <div role="group" aria-label="Choose a day" className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {days.map((d) => {
          const key = toDateKey(d);
          const selected = key === date;
          const isClosed = isClosedDay(d);
          return (
            <button
              key={key}
              type="button"
              onClick={() => setDate(key)}
              aria-pressed={selected}
              className={cn(
                "flex h-16 w-14 shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl border transition-colors",
                selected ? "border-ink bg-ink text-cream" : "border-line bg-card hover:border-muted/50",
                isClosed && !selected && "text-muted",
              )}
            >
              <span className="text-xs font-semibold uppercase">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
              <span className="font-mono text-lg font-semibold">{d.getDate()}</span>
              {isClosed && <span className="sr-only">(closed)</span>}
            </button>
          );
        })}
      </div>

      {status === "error" && !data ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : status === "loading" ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState icon={<CalendarX2 className="h-7 w-7" />} title={closed ? "Closed that day" : "No bookings yet"}>
          {closed ? "We deep-clean the grill on Mondays and holidays." : "Walk-ins only so far."}
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([time, list]) => (
            <section key={time} aria-labelledby={`t-${time}`}>
              <h2 id={`t-${time}`} className="mb-2 flex items-baseline gap-3">
                <span className="font-mono text-lg font-semibold">{formatTime(time)}</span>
                <span className="text-sm text-muted">{list.reduce((s, r) => s + (r.status === "cancelled" ? 0 : r.partySize), 0)} covers</span>
              </h2>
              <ul className="grid gap-3 lg:grid-cols-2">
                <AnimatePresence initial={false}>
                  {list.map((r) => (
                    <motion.li
                      key={r.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("rounded-2xl border border-2 border-ink bg-card p-4 shadow-pop transition-colors", STATUS_CLASS[r.status])}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={cn("font-semibold", r.status === "cancelled" && "line-through")}>{r.name}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-4 w-4" aria-hidden /> {r.partySize} guests
                            </span>
                            <span>{SEATING_LABEL[r.seating]}</span>
                            <a href={`tel:${r.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-1 underline-offset-4 hover:text-ink hover:underline">
                              <Phone className="h-3.5 w-3.5" aria-hidden /> {r.phone}
                            </a>
                            <span className="font-mono text-xs">{r.code}</span>
                          </p>
                        </div>
                        <div>
                          <label htmlFor={`rs-${r.id}`} className="sr-only">
                            Status for {r.name}
                          </label>
                          <select
                            id={`rs-${r.id}`}
                            value={r.status}
                            onChange={(e) => changeStatus(r, e.target.value as ReservationStatus)}
                            className="h-10 cursor-pointer rounded-full border border-line bg-card px-3 text-sm font-semibold focus:border-ink focus:outline-none"
                          >
                            {STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {r.notes && (
                        <p className="mt-3 flex gap-2 rounded-xl bg-mustard-tint/50 px-3 py-2 text-sm">
                          <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                          {r.notes}
                        </p>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
