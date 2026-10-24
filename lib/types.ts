/**
 * Domain types shared by the UI, the stores and the mock API.
 * When a real backend arrives, these are the contracts its responses should satisfy.
 */

/** Money is always stored in integer cents to avoid floating-point drift. */
export type Cents = number;

export type DietaryTag = "vegetarian" | "vegan" | "spicy" | "gluten-free";

export type CategoryId = "burgers" | "chicken" | "sides" | "greens" | "shakes" | "drinks";

export interface Category {
  id: CategoryId;
  name: string;
  /** Short line shown under the tab heading. */
  blurb: string;
}

export interface Dish {
  id: string;
  name: string;
  /** Short sticker shown on the card, e.g. "Fan fave" or "New". */
  badge?: string;
  description: string;
  price: Cents;
  category: CategoryId;
  tags: DietaryTag[];
  available: boolean;
  featured?: boolean;
  /** Real photo URL (or uploaded data URL). Undefined → branded placeholder. */
  image?: string;
}

export type FulfillmentType = "pickup" | "delivery";

export type OrderStatus = "received" | "cooking" | "ready" | "completed" | "cancelled";

export interface OrderLine {
  dishId: string;
  name: string;
  unitPrice: Cents;
  quantity: number;
}

export interface OrderTotals {
  subtotal: Cents;
  tax: Cents;
  deliveryFee: Cents;
  tip: Cents;
  total: Cents;
}

export interface Order {
  id: string;
  /** Human-friendly number printed on the ticket, e.g. "K-2417". */
  number: string;
  createdAt: string; // ISO
  status: OrderStatus;
  /** Demo only: the mock API walks fresh orders through the kitchen on a timer. */
  autoAdvance?: boolean;
  fulfillment: FulfillmentType;
  /** ISO time, or null for "as soon as possible". */
  scheduledFor: string | null;
  customer: { name: string; phone: string; email: string };
  address?: { line1: string; line2?: string; city: string; postcode: string; instructions?: string };
  lines: OrderLine[];
  totals: OrderTotals;
  /** Last 4 digits of the (test) card — never store full card numbers. */
  cardLast4: string;
}

export type SeatingPreference = "booth" | "counter" | "patio";

export type ReservationStatus = "confirmed" | "seated" | "completed" | "no-show" | "cancelled";

export interface Reservation {
  id: string;
  code: string;
  date: string; // YYYY-MM-DD (restaurant local)
  time: string; // HH:mm
  partySize: number;
  seating: SeatingPreference;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface TimeSlot {
  time: string; // HH:mm
  available: boolean;
}

export interface OpeningHours {
  /** 0 = Sunday … 6 = Saturday */
  day: number;
  /** null → closed all day */
  open: string | null;
  close: string | null;
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: { line1: string; city: string; postcode: string };
  hours: OpeningHours[];
  /** Dates the restaurant is closed beyond the weekly schedule (YYYY-MM-DD). */
  closures: string[];
  taxRate: number;
  deliveryFee: Cents;
  deliveryRadiusKm: number;
  pickupLeadMinutes: number;
}
