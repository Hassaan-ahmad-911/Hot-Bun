import type { RestaurantInfo } from "@/lib/types";
import { addDays, toDateKey } from "@/lib/dates";

/** Weekly schedule. Mondays we deep-clean the flat-top. */
const hours: RestaurantInfo["hours"] = [
  { day: 0, open: "12:00", close: "21:00" }, // Sunday
  { day: 1, open: null, close: null }, // Monday — closed
  { day: 2, open: "11:30", close: "22:00" },
  { day: 3, open: "11:30", close: "22:00" },
  { day: 4, open: "11:30", close: "22:00" },
  { day: 5, open: "11:30", close: "23:30" },
  { day: 6, open: "11:30", close: "23:30" },
];

/** One-off closures, generated relative to today so the demo never goes stale. */
function upcomingClosures(): string[] {
  const today = new Date();
  return [addDays(today, 12), addDays(today, 26)].map(toDateKey);
}

export const restaurant: RestaurantInfo = {
  name: "HOT BUN",
  tagline: "Smash burgers. Loud flavours.",
  phone: "+1 (555) 014-2290",
  email: "hello@hotbun.example",
  address: { line1: "48 Foundry Lane", city: "Riverside", postcode: "10021" },
  hours,
  closures: upcomingClosures(),
  taxRate: 0.0875,
  deliveryFee: 399,
  deliveryRadiusKm: 5,
  pickupLeadMinutes: 15,
};
