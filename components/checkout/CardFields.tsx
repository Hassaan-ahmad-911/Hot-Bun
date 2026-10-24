"use client";

import { CreditCard, FlaskConical, Lock } from "lucide-react";
import { Controller, type Control, type FieldErrors, type UseFormSetValue } from "react-hook-form";
import { digitsOnly, type CheckoutValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type Brand = "visa" | "mastercard" | "amex" | "unknown";

export function detectBrand(number: string): Brand {
  const d = digitsOnly(number);
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  return "unknown";
}

function formatCardNumber(value: string) {
  const d = digitsOnly(value);
  if (detectBrand(d) === "amex") {
    const v = d.slice(0, 15);
    return [v.slice(0, 4), v.slice(4, 10), v.slice(10)].filter(Boolean).join(" ");
  }
  return d.slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string, previous: string) {
  const d = digitsOnly(value).slice(0, 4);
  // Let backspace remove the slash naturally.
  if (value.length < previous.length && previous.endsWith("/")) return d.slice(0, 1);
  if (d.length === 1 && Number(d) > 1) return `0${d}/`;
  if (d.length >= 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
}

const BRAND_LABEL: Record<Brand, string> = { visa: "VISA", mastercard: "MC", amex: "AMEX", unknown: "" };

const cell =
  "h-12 w-full bg-transparent px-4 text-base text-ink placeholder:text-muted/60 focus:outline-none focus-visible:outline-none";

interface CardFieldsProps {
  control: Control<CheckoutValues>;
  errors: FieldErrors<CheckoutValues>;
  setValue: UseFormSetValue<CheckoutValues>;
}

/**
 * Card entry styled like a hosted payment element. UI only — in production,
 * mount your payment provider's element here so raw card numbers never touch your app.
 */
export function CardFields({ control, errors, setValue }: CardFieldsProps) {
  const cardErrors = errors.card;
  const messages = [cardErrors?.number?.message, cardErrors?.expiry?.message, cardErrors?.cvc?.message, cardErrors?.postal?.message].filter(Boolean);

  const fillTestCard = () => {
    const opts = { shouldValidate: true, shouldDirty: true };
    setValue("card.number", "4242 4242 4242 4242", opts);
    const nextYear = String((new Date().getFullYear() + 3) % 100).padStart(2, "0");
    setValue("card.expiry", `12/${nextYear}`, opts);
    setValue("card.cvc", "123", opts);
    setValue("card.postal", "10021", opts);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-mustard-tint px-2 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-muted">
          <FlaskConical className="h-3.5 w-3.5" aria-hidden /> Test mode
        </span>
        <button type="button" onClick={fillTestCard} className="cursor-pointer text-sm font-semibold underline decoration-line decoration-2 underline-offset-4 hover:decoration-tomato">
          Use test card
        </button>
      </div>

      <fieldset>
        <legend className="sr-only">Card details</legend>
        <div
          className={cn(
            "overflow-hidden rounded-xl border bg-card shadow-[0_1px_2px_rgba(31,25,21,0.06)] transition-[border-color,box-shadow] focus-within:border-ink focus-within:ring-4 focus-within:ring-mustard/30",
            messages.length ? "border-tomato" : "border-line",
          )}
        >
          <Controller
            control={control}
            name="card.number"
            render={({ field }) => {
              const brand = detectBrand(field.value);
              return (
                <div className="relative flex items-center border-b border-line">
                  <label htmlFor="card-number" className="sr-only">
                    Card number
                  </label>
                  <input
                    id="card-number"
                    ref={field.ref}
                    name={field.name}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 1234 1234 1234"
                    aria-invalid={Boolean(cardErrors?.number) || undefined}
                    aria-describedby="card-errors"
                    className={cn(cell, "pr-20 font-mono tracking-wide")}
                  />
                  <span className="pointer-events-none absolute right-3 flex items-center gap-1.5" aria-hidden>
                    {brand === "unknown" ? (
                      <CreditCard className="h-5 w-5 text-muted" />
                    ) : (
                      <span className="rounded bg-ink px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold tracking-wider text-cream">
                        {BRAND_LABEL[brand]}
                      </span>
                    )}
                  </span>
                </div>
              );
            }}
          />
          <div className="grid grid-cols-3 divide-x divide-line">
            <Controller
              control={control}
              name="card.expiry"
              render={({ field }) => (
                <div>
                  <label htmlFor="card-expiry" className="sr-only">
                    Expiry date (MM/YY)
                  </label>
                  <input
                    id="card-expiry"
                    ref={field.ref}
                    name={field.name}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(formatExpiry(e.target.value, field.value))}
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM / YY"
                    aria-invalid={Boolean(cardErrors?.expiry) || undefined}
                    aria-describedby="card-errors"
                    className={cn(cell, "font-mono")}
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="card.cvc"
              render={({ field }) => (
                <div>
                  <label htmlFor="card-cvc" className="sr-only">
                    Security code (CVC)
                  </label>
                  <input
                    id="card-cvc"
                    ref={field.ref}
                    name={field.name}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(digitsOnly(e.target.value).slice(0, 4))}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="CVC"
                    aria-invalid={Boolean(cardErrors?.cvc) || undefined}
                    aria-describedby="card-errors"
                    className={cn(cell, "font-mono")}
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="card.postal"
              render={({ field }) => (
                <div>
                  <label htmlFor="card-postal" className="sr-only">
                    Billing postcode
                  </label>
                  <input
                    id="card-postal"
                    {...field}
                    autoComplete="postal-code"
                    placeholder="Postcode"
                    aria-invalid={Boolean(cardErrors?.postal) || undefined}
                    aria-describedby="card-errors"
                    className={cell}
                  />
                </div>
              )}
            />
          </div>
        </div>
      </fieldset>

      <div id="card-errors" className="mt-2 space-y-1" role="alert">
        {messages.map((m) => (
          <p key={m} className="text-sm font-medium text-tomato">
            {m}
          </p>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-2 text-sm text-muted">
        <Lock className="h-4 w-4" aria-hidden />
        Test mode — no card is charged. Try 4242 4242 4242 4242, any future date, any CVC.
      </p>
    </div>
  );
}
