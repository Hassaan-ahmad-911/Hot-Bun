import { z } from "zod";

/* ---------- shared field rules ---------- */

const name = z.string().trim().min(2, "Please enter your full name.").max(80, "That name is a little long.");
const phone = z
  .string()
  .trim()
  .min(1, "We need a phone number in case something changes.")
  .regex(/^[+()\d\s.-]{7,20}$/, "Enter a valid phone number, e.g. +1 555 014 2290.");
const email = z.string().trim().min(1, "Enter your email for the receipt.").email("That email doesn't look right.");

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/** Luhn checksum — catches typos in card numbers before "submitting". */
export function passesLuhn(value: string) {
  const digits = digitsOnly(value);
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return digits.length >= 13 && sum % 10 === 0;
}

function expiryInFuture(value: string) {
  const [mm, yy] = value.split("/").map(Number);
  if (!mm || Number.isNaN(yy)) return false;
  const now = new Date();
  const expiry = new Date(2000 + yy, mm, 0, 23, 59); // last day of that month
  return expiry >= now;
}

/* ---------- checkout ---------- */

export const checkoutSchema = z
  .object({
    fulfillment: z.enum(["pickup", "delivery"]),
    timing: z.enum(["asap", "scheduled"]),
    scheduledTime: z.string().optional(),
    address: z.object({
      line1: z.string().trim(),
      line2: z.string().trim().optional(),
      city: z.string().trim(),
      postcode: z.string().trim(),
      instructions: z.string().trim().max(200, "Keep instructions under 200 characters.").optional(),
    }),
    contact: z.object({ name, phone, email }),
    tipPercent: z.number().nullable(),
    tipCustom: z.string().optional(),
    card: z.object({
      number: z
        .string()
        .min(1, "Enter a card number.")
        .refine((v) => digitsOnly(v).length >= 13 && digitsOnly(v).length <= 19, "Card numbers are 13–19 digits.")
        .refine(passesLuhn, "That card number has a typo — try 4242 4242 4242 4242 in test mode."),
      expiry: z
        .string()
        .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY.")
        .refine(expiryInFuture, "This card has expired."),
      cvc: z.string().regex(/^\d{3,4}$/, "3 or 4 digits."),
      postal: z.string().trim().min(3, "Enter the billing postcode."),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillment === "delivery") {
      if (data.address.line1.length < 3)
        ctx.addIssue({ code: "custom", path: ["address", "line1"], message: "Where should we bring it?" });
      if (data.address.city.length < 2)
        ctx.addIssue({ code: "custom", path: ["address", "city"], message: "Enter a city." });
      if (!/^[A-Za-z0-9 -]{3,10}$/.test(data.address.postcode))
        ctx.addIssue({ code: "custom", path: ["address", "postcode"], message: "Enter a valid postcode." });
    }
    if (data.timing === "scheduled" && !data.scheduledTime) {
      ctx.addIssue({ code: "custom", path: ["scheduledTime"], message: "Choose a time." });
    }
    if (data.tipPercent === null) {
      const amount = Number(data.tipCustom);
      if (!data.tipCustom || Number.isNaN(amount) || amount < 0 || amount > 500)
        ctx.addIssue({ code: "custom", path: ["tipCustom"], message: "Enter a tip between $0 and $500." });
    }
  });

export type CheckoutValues = z.infer<typeof checkoutSchema>;

/* ---------- reservations ---------- */

export const reservationSchema = z.object({
  date: z.string().min(1, "Choose a date."),
  time: z.string().min(1, "Choose a time."),
  partySize: z.number().int().min(1).max(10, "For 11 or more, please call us — we'll set up the long table."),
  seating: z.enum(["booth", "counter", "patio"]),
  name,
  phone,
  email: z.union([z.literal(""), z.string().trim().email("That email doesn't look right.")]).optional(),
  notes: z.string().trim().max(300, "Keep notes under 300 characters.").optional(),
});

export type ReservationValues = z.infer<typeof reservationSchema>;

/* ---------- admin ---------- */

export const loginSchema = z.object({
  email: z.string().trim().email("Enter your staff email."),
  password: z.string().min(1, "Enter your password."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const dishSchema = z.object({
  name: z.string().trim().min(2, "Give the dish a name.").max(60),
  badge: z.string().trim().max(40).optional(),
  description: z
    .string()
    .trim()
    .min(10, "Describe the dish in a sentence or two.")
    .max(220, "Keep descriptions under 220 characters."),
  price: z
    .number({ invalid_type_error: "Enter a price." })
    .positive("Price must be above zero.")
    .max(500, "That's a very expensive dish."),
  category: z.enum(["burgers", "chicken", "sides", "greens", "shakes", "drinks"]),
  tags: z.array(z.enum(["vegetarian", "vegan", "spicy", "gluten-free"])),
  available: z.boolean(),
  featured: z.boolean(),
  image: z.string().optional(),
});

export type DishValues = z.infer<typeof dishSchema>;
