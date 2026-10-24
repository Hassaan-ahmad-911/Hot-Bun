"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronDown, Receipt, Store, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { restaurant } from "@/data/restaurant";
import { ordersApi } from "@/lib/api";
import { dateAtTime, formatTime, fromDateKey } from "@/lib/dates";
import { formatMoney } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { getPickupWindow } from "@/lib/hours";
import { computeTotals, tipFromPercent } from "@/lib/pricing";
import { checkoutSchema, digitsOnly, type CheckoutValues } from "@/lib/schemas";
import { useCart } from "@/lib/store/cart";
import { useMenu } from "@/lib/store/menu";
import { cn } from "@/lib/utils";
import { CardFields } from "./CardFields";
import { OrderSummary } from "./OrderSummary";
import { TipSelector } from "./TipSelector";

function Section({ n, title, children, aside }: { n: number; title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border-2 border-ink bg-card p-5 shadow-pop sm:p-7" aria-labelledby={`step-${n}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id={`step-${n}`} className="flex items-baseline gap-3 font-display text-2xl">
          <span className="font-mono text-sm text-tomato">0{n}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const { lines, hydrated, clear } = useCart();
  const now = useNow();
  const window_ = useMemo(() => (now ? getPickupWindow(now) : null), [now]);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: {
      fulfillment: "pickup",
      timing: "asap",
      scheduledTime: "",
      address: { line1: "", line2: "", city: restaurant.address.city, postcode: "", instructions: "" },
      contact: { name: "", phone: "", email: "" },
      tipPercent: 15,
      tipCustom: "",
      card: { number: "", expiry: "", cvc: "", postal: "" },
    },
  });

  const fulfillment = watch("fulfillment");
  const timing = watch("timing");
  const tipPercent = watch("tipPercent");
  const tipCustom = watch("tipCustom") ?? "";

  // If the kitchen can't take ASAP orders right now, default to scheduling.
  useEffect(() => {
    if (window_ && !window_.asapAvailable) setValue("timing", "scheduled");
  }, [window_, setValue]);

  const orderLines = lines.map((l) => ({ dishId: l.dishId, name: l.name, unitPrice: l.unitPrice, quantity: l.quantity }));
  const subtotal = orderLines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const tip = tipPercent === null ? Math.round((Number(tipCustom) || 0) * 100) : tipFromPercent(subtotal, tipPercent);
  const totals = computeTotals(orderLines, { fulfillment, tip });

  const onSubmit = async (values: CheckoutValues) => {
    setPayError(null);
    // Re-check availability right before charging (staff may have 86'd a dish).
    await useMenu.getState().load();
    const unavailable = lines.filter((l) => useMenu.getState().dishes.find((d) => d.id === l.dishId)?.available === false);
    if (unavailable.length) {
      setPayError(`${unavailable.map((l) => l.name).join(", ")} just sold out. Remove it from your order to continue — you haven't been charged.`);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    setPaying(true);
    try {
      const scheduledFor =
        values.timing === "scheduled" && values.scheduledTime && window_
          ? dateAtTime(fromDateKey(window_.dateKey), values.scheduledTime).toISOString()
          : null;
      const order = await ordersApi.createOrder({
        lines: orderLines,
        fulfillment: values.fulfillment,
        scheduledFor,
        customer: values.contact,
        address: values.fulfillment === "delivery" ? values.address : undefined,
        tip,
        cardLast4: digitsOnly(values.card.number).slice(-4),
      });
      router.push(`/order/${order.id}`);
      clear();
    } catch (err) {
      setPaying(false);
      setPayError(err instanceof Error ? err.message : "Payment failed. Please try again.");
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  };

  if (!hydrated) {
    return (
      <div className="container grid gap-8 pb-20 pt-[calc(var(--header-h)+3rem)] lg:grid-cols-[1fr_24rem]" aria-busy="true">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-56 w-full rounded-[1.5rem]" />
          <Skeleton className="h-72 w-full rounded-[1.5rem]" />
        </div>
        <Skeleton className="hidden h-96 lg:block" />
      </div>
    );
  }

  if (!lines.length && !paying) {
    return (
      <div className="container pb-24 pt-[calc(var(--header-h)+4rem)]">
        <EmptyState
          icon={<Receipt className="h-7 w-7" />}
          title="Nothing to check out yet"
          action={<ButtonLink href="/menu">Browse the menu</ButtonLink>}
        >
          Your ticket is empty. Add a few dishes and come back — we&apos;ll keep the oven hot.
        </EmptyState>
      </div>
    );
  }

  const asapLabel = fulfillment === "pickup" ? `ASAP · ~${restaurant.pickupLeadMinutes} min` : "ASAP · 35–45 min";
  const payLabel = `Pay ${formatMoney(totals.total)}`;

  return (
    <div className="container pb-32 pt-[calc(var(--header-h)+2.5rem)] md:pb-20">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Checkout</p>
        <h1 className="mt-2 font-display text-display-md uppercase">Almost <span className="text-tomato">there.</span></h1>
      </div>

      {/* Mobile: collapsible ticket summary */}
      <div className="mb-6 lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          aria-expanded={summaryOpen}
          aria-controls="mobile-summary"
          className="flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 border-ink bg-card px-5 py-4 shadow-pop"
        >
          <span className="flex items-center gap-2 font-semibold">
            <Receipt className="h-5 w-5" aria-hidden /> {summaryOpen ? "Hide" : "Show"} order
          </span>
          <span className="flex items-center gap-2 font-mono font-semibold">
            {formatMoney(totals.total)}
            <ChevronDown className={cn("h-5 w-5 transition-transform", summaryOpen && "rotate-180")} aria-hidden />
          </span>
        </button>
        <AnimatePresence initial={false}>
          {summaryOpen && (
            <motion.div id="mobile-summary" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-4">
              <OrderSummary lines={orderLines} totals={totals} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start xl:gap-12">
        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Section n={1} title="Pickup or delivery">
            <Controller
              control={control}
              name="fulfillment"
              render={({ field }) => (
                <Segmented
                  legend="How would you like your order?"
                  hideLegend
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "pickup", label: <span className="flex items-center gap-2"><Store className="h-4 w-4" aria-hidden />Pickup</span>, description: "Free" },
                    { value: "delivery", label: <span className="flex items-center gap-2"><Truck className="h-4 w-4" aria-hidden />Delivery</span>, description: `${formatMoney(restaurant.deliveryFee)} fee` },
                  ]}
                />
              )}
            />
            <AnimatePresence initial={false} mode="wait">
              {fulfillment === "delivery" ? (
                <motion.div key="delivery" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }} className="mt-6 grid gap-4 sm:grid-cols-6">
                  <Field label="Street address" error={errors.address?.line1?.message} className="sm:col-span-4">
                    {({ id, describedBy, invalid }) => (
                      <Input id={id} aria-describedby={describedBy} invalid={invalid} autoComplete="address-line1" {...register("address.line1")} />
                    )}
                  </Field>
                  <Field label="Apt / floor" optional className="sm:col-span-2">
                    {({ id }) => <Input id={id} autoComplete="address-line2" {...register("address.line2")} />}
                  </Field>
                  <Field label="City" error={errors.address?.city?.message} className="sm:col-span-3">
                    {({ id, describedBy, invalid }) => (
                      <Input id={id} aria-describedby={describedBy} invalid={invalid} autoComplete="address-level2" {...register("address.city")} />
                    )}
                  </Field>
                  <Field label="Postcode" error={errors.address?.postcode?.message} className="sm:col-span-3">
                    {({ id, describedBy, invalid }) => (
                      <Input id={id} aria-describedby={describedBy} invalid={invalid} autoComplete="postal-code" {...register("address.postcode")} />
                    )}
                  </Field>
                  <Field label="Notes for the driver" optional error={errors.address?.instructions?.message} className="sm:col-span-6" hint={`We deliver within ${restaurant.deliveryRadiusKm} km of Foundry Lane.`}>
                    {({ id, describedBy, invalid }) => (
                      <Textarea id={id} aria-describedby={describedBy} invalid={invalid} rows={2} placeholder="Buzzer 4B, leave with the concierge…" {...register("address.instructions")} />
                    )}
                  </Field>
                </motion.div>
              ) : (
                <motion.p key="pickup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }} className="mt-5 text-muted">
                  Collect from the counter at <strong className="font-semibold text-ink">{restaurant.address.line1}</strong>. We&apos;ll text you when it&apos;s out of the oven.
                </motion.p>
              )}
            </AnimatePresence>
          </Section>

          <Section n={2} title={fulfillment === "pickup" ? "Pickup time" : "Delivery time"}>
            {!window_ ? (
              <Skeleton className="h-14 w-full rounded-full" />
            ) : (
              <>
                <Controller
                  control={control}
                  name="timing"
                  render={({ field }) => (
                    <Segmented
                      legend="When?"
                      hideLegend
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: "asap", label: asapLabel, disabled: !window_.asapAvailable },
                        { value: "scheduled", label: "Schedule" },
                      ]}
                    />
                  )}
                />
                {!window_.asapAvailable && (
                  <p className="mt-3 text-sm text-muted">The kitchen is closed right now — schedule for the next service.</p>
                )}
                <AnimatePresence initial={false}>
                  {timing === "scheduled" && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-5 max-w-sm">
                      <Field label={`${window_.dayLabel} at`} error={errors.scheduledTime?.message} hint="Times in 15-minute windows.">
                        {({ id, describedBy, invalid }) => (
                          <Select id={id} aria-describedby={describedBy} invalid={invalid} {...register("scheduledTime")}>
                            <option value="">Choose a time</option>
                            {window_.slots.map((s) => (
                              <option key={s} value={s}>
                                {formatTime(s)}
                              </option>
                            ))}
                          </Select>
                        )}
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </Section>

          <Section n={3} title="Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.contact?.name?.message} className="sm:col-span-2">
                {({ id, describedBy, invalid }) => (
                  <Input id={id} aria-describedby={describedBy} invalid={invalid} autoComplete="name" {...register("contact.name")} />
                )}
              </Field>
              <Field label="Phone" error={errors.contact?.phone?.message} hint="For order updates by text.">
                {({ id, describedBy, invalid }) => (
                  <Input id={id} type="tel" aria-describedby={describedBy} invalid={invalid} autoComplete="tel" {...register("contact.phone")} />
                )}
              </Field>
              <Field label="Email" error={errors.contact?.email?.message} hint="We'll send your receipt here.">
                {({ id, describedBy, invalid }) => (
                  <Input id={id} type="email" aria-describedby={describedBy} invalid={invalid} autoComplete="email" {...register("contact.email")} />
                )}
              </Field>
            </div>
          </Section>

          <Section n={4} title="Tip the kitchen">
            <TipSelector
              subtotal={subtotal}
              percent={tipPercent}
              custom={tipCustom}
              onPercent={(v) => setValue("tipPercent", v, { shouldValidate: true })}
              onCustom={(v) => setValue("tipCustom", v, { shouldValidate: true })}
              customError={errors.tipCustom?.message}
            />
          </Section>

          <Section n={5} title="Payment">
            <AnimatePresence>
              {payError && (
                <motion.div
                  ref={errorRef}
                  tabIndex={-1}
                  role="alert"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 flex gap-3 rounded-xl border border-tomato/30 bg-tomato-tint/60 p-4 text-sm outline-none"
                >
                  <AlertTriangle className="h-5 w-5 shrink-0 text-tomato" aria-hidden />
                  <span>{payError}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <CardFields control={control} errors={errors} setValue={setValue} />
            <Button type="submit" size="lg" className="mt-6 hidden w-full md:inline-flex" loading={paying} loadingText="Authorising payment…">
              {payLabel}
            </Button>
          </Section>
        </form>

        <aside className="hidden lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:block" aria-label="Order summary">
          <OrderSummary lines={orderLines} totals={totals} meta={fulfillment === "pickup" ? "Pickup at Foundry Lane" : "Delivery"} />
        </aside>
      </div>

      {/* Mobile sticky pay bar */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 pt-3 backdrop-blur-md md:hidden">
        <Button type="submit" form="checkout-form" size="lg" className="w-full" loading={paying} loadingText="Authorising…">
          {payLabel}
        </Button>
      </div>
    </div>
  );
}
