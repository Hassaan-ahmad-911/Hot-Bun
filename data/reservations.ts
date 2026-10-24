import { addDays, toDateKey } from "@/lib/dates";
import { getSeatingTimes } from "@/lib/hours";
import type { Reservation, SeatingPreference } from "@/lib/types";
import { seededRandom } from "@/lib/utils";

const GUESTS = [
  "Clara Mendes",
  "Nikoloz Kapanadze",
  "Ruth Abernathy",
  "Kenji Mori",
  "Elena Petrova",
  "Marcus Bell",
  "Aisha Rahman",
  "Theo Laurent",
  "Lucia Romano",
  "Ben Carter",
  "Mira Joshi",
  "Oscar Lund",
];

const NOTES = [
  "Birthday — candle in a shake, please!",
  "One guest is vegan.",
  "High chair needed.",
  "Anniversary, a quiet table if possible.",
  "Severe shellfish allergy.",
  "",
  "",
  "",
];

const SEATING: SeatingPreference[] = ["booth", "booth", "counter", "patio"];

/** Sample bookings for the next 10 days, relative to today. */
export function generateSampleReservations(today = new Date()): Reservation[] {
  const out: Reservation[] = [];
  for (let d = 0; d < 10; d++) {
    const date = addDays(today, d);
    const times = getSeatingTimes(date);
    if (!times.length) continue;
    const rand = seededRandom(date.getFullYear() * 400 + date.getMonth() * 32 + date.getDate());
    const count = 5 + Math.floor(rand() * 6);
    for (let i = 0; i < count; i++) {
      const name = GUESTS[Math.floor(rand() * GUESTS.length)];
      const time = times[Math.floor(rand() * times.length)];
      out.push({
        id: `res_sample_${toDateKey(date)}_${i}`,
        code: `RSV-${(Math.floor(rand() * 9000) + 1000).toString()}`,
        date: toDateKey(date),
        time,
        partySize: 2 + Math.floor(rand() * 5),
        seating: SEATING[Math.floor(rand() * SEATING.length)],
        name,
        phone: `+1 (555) 02${Math.floor(rand() * 90 + 10)}-${Math.floor(rand() * 9000 + 1000)}`,
        notes: NOTES[Math.floor(rand() * NOTES.length)] || undefined,
        status: "confirmed",
        createdAt: addDays(today, -Math.floor(rand() * 5)).toISOString(),
      });
    }
  }
  return out.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}
