"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CalendarPlus, ChefHat, Sofa, Sun } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { EASE_HEARTH } from "@/components/motion/Reveal";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { Stepper } from "@/components/ui/Stepper";
import { restaurant } from "@/data/restaurant";
import { reservationsApi } from "@/lib/api";
import { addDays, dateAtTime, formatDateLong, formatTime, fromDateKey, toDateKey } from "@/lib/dates";
import { useNow } from "@/lib/hooks";
import { isClosedDay } from "@/lib/hours";
import { reservationSchema, type ReservationValues } from "@/lib/schemas";
import type { Reservation, SeatingPreference, TimeSlot } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DatePicker } from "./DatePicker";
import { PlaceCard, SEATING_LABEL } from "./PlaceCard";

const SEATING: { value: SeatingPreference; icon: typeof Sofa; note: string }[] = [
  { value: "booth", icon: Sofa, note: "Comfy red booths, fits up to 6" },
  { value: "counter", icon: ChefHat, note: "Watch the smash. Best for 1–4" },
  { value: "patio", icon: Sun, note: "Heated, dog-friendly, weather permitting" },
];

function firstOpenDay(from: Date) {
  for (let i = 0; i < 14; i++) {
    const d = addDays(from, i);
    if (!isClosedDay(d)) return toDateKey(d);
  }
  return toDateKey(from);
}

/** Build a tiny .ics file so guests can add the booking to their calendar. */
function downloadIcs(res: Reservation) {
  const start = dateAtTime(fromDateKey(res.date), res.time);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HOT BUN//Reservations//EN",
    "BEGIN:VEVENT",
    `UID:${res.id}@hotbun.example`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:HOT BUN (${res.partySize} guests)`,
    `LOCATION:${restaurant.address.line1}\\, ${restaurant.address.city}`,
    `DESCRIPTION:Booking ${res.code}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `hotbun-${res.code}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReservationFlow() {
  const now = useNow();
  const [slots, setSlots] = useState<{ status: "idle" | "loading" | "ready" | "error"; items: TimeSlot[] }>({ status: "idle", items: [] });
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const confirmRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservationValues>({
    resolver: zodResolver(reservationSchema),
    mode: "onTouched",
    defaultValues: { date: "", time: "", partySize: 2, seating: "booth", name: "", phone: "", email: "", notes: "" },
  });

  const date = watch("date");
  const time = watch("time");
  const partySize = watch("partySize");
  const seating = watch("seating");
  const name = watch("name");

  // Preselect the first open day once we know "today" on the client.
  useEffect(() => {
    if (now && !date) setValue("date", firstOpenDay(now));
  }, [now, date, setValue]);

  const loadSlots = useMemo(
    () => async (dateKey: string) => {
      setSlots({ status: "loading", items: [] });
      try {
        const items = await reservationsApi.getAvailability(dateKey);
        setSlots({ status: "ready", items });
      } catch {
        setSlots({ status: "error", items: [] });
      }
    },
    [],
  );

  useEffect(() => {
    if (date) void loadSlots(date);
  }, [date, loadSlots]);

  const onSubmit = async (values: ReservationValues) => {
    setSubmitError(null);
    try {
      const res = await reservationsApi.createReservation({
        date: values.date,
        time: values.time,
        partySize: values.partySize,
        seating: values.seating,
        name: values.name,
        phone: values.phone,
        email: values.email || undefined,
        notes: values.notes || undefined,
      });
      setConfirmed(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => confirmRef.current?.focus(), 400);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "We couldn't save that booking.");
      setValue("time", "");
      void loadSlots(values.date);
    }
  };

  const startOver = () => {
    setConfirmed(null);
    reset({ date, time: "", partySize: 2, seating: "booth", name: "", phone: "", email: "", notes: "" });
    void loadSlots(date);
  };

  const available = slots.items.filter((s) => s.available).length;

  return (
    <div className="container pb-24 pt-[calc(var(--header-h)+2.5rem)]">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_26rem] xl:gap-16">
        <AnimatePresence mode="wait" initial={false}>
          {confirmed ? (
            <motion.section
              key="confirmed"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE_HEARTH }}
              aria-labelledby="confirm-title"
            >
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-lettuce">Booking confirmed · {confirmed.code}</p>
              <h1 id="confirm-title" ref={confirmRef} tabIndex={-1} className="mt-3 font-display text-display-lg uppercase outline-none">
                See you {formatDateLong(fromDateKey(confirmed.date)).split(",")[0]}, <span className="text-tomato">{confirmed.name.split(" ")[0]}.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted">
                We&apos;ve saved a table for {confirmed.partySize} at {formatTime(confirmed.time)} on {formatDateLong(fromDateKey(confirmed.date))},{" "}
                {SEATING_LABEL[confirmed.seating].toLowerCase()}. A confirmation text is on its way to {confirmed.phone}.
              </p>
              <ul className="mt-8 space-y-3 text-muted">
                <li>· Running late? We hold tables for 15 minutes.</li>
                <li>· Need to change it? Call {restaurant.phone} and quote {confirmed.code}.</li>
              </ul>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => downloadIcs(confirmed)}>
                  <CalendarPlus className="h-5 w-5" aria-hidden /> Add to calendar
                </Button>
                <ButtonLink href="/menu" variant="secondary" size="lg">
                  Preview the menu
                </ButtonLink>
                <Button variant="ghost" size="lg" onClick={startOver}>
                  Make another booking
                </Button>
              </div>
            </motion.section>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
              aria-labelledby="reserve-title"
            >
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Reservations</p>
              <h1 id="reserve-title" className="mt-3 font-display text-display-lg uppercase">
                Grab a <span className="text-tomato">booth.</span>
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted">
                Tables for up to ten. For parties of 11+, call us and we&apos;ll set up the long table.
              </p>

              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {/* Date */}
                <section className="rounded-[1.5rem] border-2 border-ink bg-card p-5 shadow-pop sm:p-6" aria-labelledby="date-label">
                  <h2 id="date-label" className="mb-4 flex items-baseline gap-3 font-display text-2xl">
                    <span className="font-mono text-sm text-tomato">01</span>Date
                  </h2>
                  {now ? (
                    <Controller
                      control={control}
                      name="date"
                      render={({ field }) => (
                        <DatePicker
                          today={now}
                          value={field.value || null}
                          labelledBy="date-label"
                          onChange={(key) => {
                            field.onChange(key);
                            setValue("time", "");
                          }}
                        />
                      )}
                    />
                  ) : (
                    <Skeleton className="aspect-square w-full" />
                  )}
                  {errors.date && <p className="mt-2 text-sm font-medium text-tomato">{errors.date.message}</p>}
                </section>

                <div className="flex flex-col gap-5">
                  {/* Party size */}
                  <section className="rounded-[1.5rem] border-2 border-ink bg-card p-5 shadow-pop sm:p-6" aria-labelledby="party-label">
                    <h2 id="party-label" className="mb-4 flex items-baseline gap-3 font-display text-2xl">
                      <span className="font-mono text-sm text-tomato">02</span>Guests
                    </h2>
                    <Controller
                      control={control}
                      name="partySize"
                      render={({ field }) => (
                        <div className="flex items-center justify-between gap-4">
                          <Stepper
                            value={field.value}
                            min={1}
                            max={10}
                            label="guests"
                            onIncrement={() => field.onChange(Math.min(10, field.value + 1))}
                            onDecrement={() => field.onChange(Math.max(1, field.value - 1))}
                          />
                          <p className="text-right text-sm text-muted">
                            {field.value >= 10 ? (
                              <>
                                Larger group?{" "}
                                <a className="font-semibold text-ink underline underline-offset-4" href={`tel:${restaurant.phone.replace(/[^+\d]/g, "")}`}>
                                  Call us
                                </a>
                              </>
                            ) : field.value >= 7 ? (
                              "We'll set a long table."
                            ) : (
                              "Kids welcome — high chairs available."
                            )}
                          </p>
                        </div>
                      )}
                    />
                  </section>

                  {/* Time */}
                  <section className="flex-1 rounded-[1.5rem] border-2 border-ink bg-card p-5 shadow-pop sm:p-6" aria-labelledby="time-label">
                    <div className="mb-4 flex items-baseline justify-between gap-3">
                      <h2 id="time-label" className="flex items-baseline gap-3 font-display text-2xl">
                        <span className="font-mono text-sm text-tomato">03</span>Time
                      </h2>
                      {slots.status === "ready" && slots.items.length > 0 && (
                        <span className="font-mono text-xs text-muted">{available} open</span>
                      )}
                    </div>
                    {slots.status === "loading" || slots.status === "idle" ? (
                      <div className="grid grid-cols-3 gap-2" aria-busy="true" aria-label="Loading times">
                        {Array.from({ length: 9 }, (_, i) => (
                          <Skeleton key={i} className="h-12 rounded-xl" />
                        ))}
                      </div>
                    ) : slots.status === "error" ? (
                      <ErrorState className="py-6" title="Couldn't load times" onRetry={() => loadSlots(date)} />
                    ) : slots.items.length === 0 || available === 0 ? (
                      <p className="rounded-xl bg-mustard-tint/60 p-4 text-sm text-muted">
                        {slots.items.length === 0 ? "We're closed that day." : "Fully booked — try another day, or walk in for the counter."}
                      </p>
                    ) : (
                      <Controller
                        control={control}
                        name="time"
                        render={({ field }) => (
                          <fieldset>
                            <legend className="sr-only">Available times on {formatDateLong(fromDateKey(date))}</legend>
                            <motion.div
                              className="grid grid-cols-3 gap-2"
                              initial="hidden"
                              animate="show"
                              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.025 } } }}
                            >
                              {slots.items.map((slot) => {
                                const selected = field.value === slot.time;
                                return (
                                  <motion.label
                                    key={slot.time}
                                    variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                                    className={cn(
                                      "relative flex h-12 cursor-pointer flex-col items-center justify-center rounded-xl border font-mono text-sm transition-[background-color,border-color,color] duration-150",
                                      "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tomato",
                                      selected && "border-ink bg-ink text-cream",
                                      !selected && slot.available && "border-line hover:border-muted/60",
                                      !slot.available && "cursor-not-allowed border-dashed border-line text-muted/70",
                                    )}
                                  >
                                    <input
                                      type="radio"
                                      name={field.name}
                                      value={slot.time}
                                      checked={selected}
                                      disabled={!slot.available}
                                      onChange={() => field.onChange(slot.time)}
                                      className="sr-only"
                                      aria-label={`${formatTime(slot.time)}${slot.available ? "" : ", full"}`}
                                    />
                                    <span className={cn(!slot.available && "line-through")}>{formatTime(slot.time)}</span>
                                    {!slot.available && <span className="text-[0.6rem] uppercase tracking-wider">Full</span>}
                                  </motion.label>
                                );
                              })}
                            </motion.div>
                          </fieldset>
                        )}
                      />
                    )}
                    {errors.time && <p className="mt-2 text-sm font-medium text-tomato" role="alert">{errors.time.message}</p>}
                  </section>
                </div>
              </div>

              {/* Seating */}
              <section className="mt-5 rounded-[1.5rem] border-2 border-ink bg-card p-5 shadow-pop sm:p-6" aria-labelledby="seat-label">
                <h2 id="seat-label" className="mb-4 flex items-baseline gap-3 font-display text-2xl">
                  <span className="font-mono text-sm text-tomato">04</span>Where would you like to sit?
                </h2>
                <Controller
                  control={control}
                  name="seating"
                  render={({ field }) => (
                    <fieldset className="grid gap-3 sm:grid-cols-3">
                      <legend className="sr-only">Seating preference</legend>
                      {SEATING.map((opt) => {
                        const Icon = opt.icon;
                        const selected = field.value === opt.value;
                        return (
                          <label
                            key={opt.value}
                            className={cn(
                              "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-[border-color,background-color,transform] duration-200 active:scale-[0.98]",
                              "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tomato",
                              selected ? "border-ink bg-ink text-cream" : "border-line hover:border-muted/50",
                            )}
                          >
                            <input type="radio" name={field.name} value={opt.value} checked={selected} onChange={() => field.onChange(opt.value)} className="sr-only" />
                            <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                            <span>
                              <span className="block font-semibold">{SEATING_LABEL[opt.value]}</span>
                              <span className={cn("block text-sm", selected ? "text-fog" : "text-muted")}>{opt.note}</span>
                            </span>
                          </label>
                        );
                      })}
                    </fieldset>
                  )}
                />
                <p className="mt-3 text-sm text-muted">A preference, not a promise — we&apos;ll do our best.</p>
              </section>

              {/* Details */}
              <section className="mt-5 rounded-[1.5rem] border-2 border-ink bg-card p-5 shadow-pop sm:p-6" aria-labelledby="details-label">
                <h2 id="details-label" className="mb-4 flex items-baseline gap-3 font-display text-2xl">
                  <span className="font-mono text-sm text-tomato">05</span>Your details
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" error={errors.name?.message}>
                    {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} invalid={invalid} autoComplete="name" {...register("name")} />}
                  </Field>
                  <Field label="Phone" error={errors.phone?.message} hint="We'll text a confirmation.">
                    {({ id, describedBy, invalid }) => <Input id={id} type="tel" aria-describedby={describedBy} invalid={invalid} autoComplete="tel" {...register("phone")} />}
                  </Field>
                  <Field label="Email" optional error={errors.email?.message} className="sm:col-span-2">
                    {({ id, describedBy, invalid }) => <Input id={id} type="email" aria-describedby={describedBy} invalid={invalid} autoComplete="email" {...register("email")} />}
                  </Field>
                  <Field label="Anything we should know?" optional error={errors.notes?.message} className="sm:col-span-2" hint="Allergies, celebrations, accessibility needs.">
                    {({ id, describedBy, invalid }) => <Textarea id={id} aria-describedby={describedBy} invalid={invalid} rows={3} {...register("notes")} />}
                  </Field>
                </div>
              </section>

              <AnimatePresence>
                {submitError && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-5 flex gap-3 rounded-xl border border-tomato/30 bg-tomato-tint/60 p-4 text-sm"
                  >
                    <AlertTriangle className="h-5 w-5 shrink-0 text-tomato" aria-hidden />
                    {submitError}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Button type="submit" size="lg" loading={isSubmitting} loadingText="Saving your table…" className="w-full sm:w-auto">
                  Confirm booking
                </Button>
                <p className="text-sm text-muted">No deposit needed for parties under 8.</p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]" aria-label="Booking preview">
          <PlaceCard
            name={confirmed?.name ?? name}
            date={confirmed?.date ?? (date || null)}
            time={confirmed?.time ?? (time || null)}
            partySize={confirmed?.partySize ?? partySize}
            seating={confirmed?.seating ?? seating}
            code={confirmed?.code}
            className="mx-auto max-w-sm"
          />
        </aside>
      </div>
    </div>
  );
}
