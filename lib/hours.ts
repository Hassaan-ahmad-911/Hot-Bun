import { restaurant } from "@/data/restaurant";
import {
  addDays,
  dateAtTime,
  DAY_NAMES,
  formatTime,
  minutesToTime,
  startOfDay,
  timeToMinutes,
  toDateKey,
} from "@/lib/dates";
import type { OpeningHours } from "@/lib/types";

export function getHoursFor(date: Date): OpeningHours | null {
  if (restaurant.closures.includes(toDateKey(date))) return null;
  const hours = restaurant.hours.find((h) => h.day === date.getDay());
  if (!hours || !hours.open || !hours.close) return null;
  return hours;
}

export function isClosedDay(date: Date) {
  return getHoursFor(date) === null;
}

export interface OpenStatus {
  isOpen: boolean;
  /** e.g. "Open now · until 10 pm" or "Closed · opens Tue at 5 pm" */
  label: string;
}

export function getOpenStatus(now: Date): OpenStatus {
  const today = getHoursFor(now);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  if (today?.open && today.close) {
    const open = timeToMinutes(today.open);
    const close = timeToMinutes(today.close);
    if (minutesNow >= open && minutesNow < close) {
      return { isOpen: true, label: `Open now · until ${formatTime(today.close)}` };
    }
    if (minutesNow < open) {
      return { isOpen: false, label: `Opens today at ${formatTime(today.open)}` };
    }
  }
  for (let i = 1; i <= 14; i++) {
    const day = addDays(now, i);
    const hours = getHoursFor(day);
    if (hours?.open) {
      const when = i === 1 ? "tomorrow" : DAY_NAMES[day.getDay()];
      return { isOpen: false, label: `Closed · opens ${when} at ${formatTime(hours.open)}` };
    }
  }
  return { isOpen: false, label: "Closed" };
}

export interface PickupWindow {
  dateKey: string;
  /** "Today" / "Tomorrow" / "Wednesday" */
  dayLabel: string;
  /** HH:mm values in 15-minute steps. */
  slots: string[];
  asapAvailable: boolean;
}

/** Times an order can be scheduled for — today if possible, otherwise the next open day. */
export function getPickupWindow(now: Date): PickupWindow {
  const lead = restaurant.pickupLeadMinutes;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i <= 14; i++) {
    const day = i === 0 ? now : startOfDay(addDays(now, i));
    const hours = getHoursFor(day);
    if (!hours?.open || !hours.close) continue;
    const open = timeToMinutes(hours.open);
    const lastOrder = timeToMinutes(hours.close) - 15;
    const earliest = i === 0 ? minutesNow + lead : 0;
    const start = Math.ceil(Math.max(open + lead, earliest) / 15) * 15;
    const slots: string[] = [];
    for (let m = start; m <= lastOrder; m += 15) slots.push(minutesToTime(m));
    if (!slots.length) continue;
    return {
      dateKey: toDateKey(day),
      dayLabel: i === 0 ? "Today" : i === 1 ? "Tomorrow" : DAY_NAMES[day.getDay()],
      slots,
      asapAvailable: i === 0 && minutesNow >= open && minutesNow + lead <= lastOrder,
    };
  }
  return { dateKey: toDateKey(now), dayLabel: "Today", slots: [], asapAvailable: false };
}

/** Base reservation times for a day: every 30 min, last seating 90 min before close. */
export function getSeatingTimes(date: Date): string[] {
  const hours = getHoursFor(date);
  if (!hours?.open || !hours.close) return [];
  const open = timeToMinutes(hours.open);
  const last = timeToMinutes(hours.close) - 90;
  const times: string[] = [];
  for (let m = open; m <= last; m += 30) times.push(minutesToTime(m));
  return times;
}

/**
 * Start of the service the staff panel reports on. Before 3 pm the useful view
 * is still the previous day's service (lunch/dinner from noon), after that it's today's.
 */
export function getServiceStart(now: Date): Date {
  const base = now.getHours() >= 15 ? startOfDay(now) : startOfDay(addDays(now, -1));
  base.setHours(12, 0, 0, 0);
  return base;
}

export function formatServiceLabel(start: Date, now: Date) {
  const sameDay = toDateKey(start) === toDateKey(now);
  return sameDay ? "Today's service, from 12 pm" : `Since ${DAY_NAMES[start.getDay()]} 12 pm`;
}

/** A slot is bookable only if it starts at least 30 minutes from now. */
export function isPastSlot(date: Date, time: string, now: Date) {
  return dateAtTime(date, time).getTime() < now.getTime() + 30 * 60 * 1000;
}
