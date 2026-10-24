import { fromDateKey } from "@/lib/dates";
import { getSeatingTimes, isClosedDay, isPastSlot } from "@/lib/hours";
import type { Reservation, ReservationStatus, TimeSlot } from "@/lib/types";
import { hashString, uid } from "@/lib/utils";
import { ApiError, clone, delay, maybeFail } from "./client";
import { mutateDb, readDb } from "./mock-db";

/** Tables per 30-minute seating in this demo. */
const SLOT_CAPACITY = 4;

function slotsFor(dateKey: string, reservations: Reservation[], now = new Date()): TimeSlot[] {
  const date = fromDateKey(dateKey);
  if (isClosedDay(date)) return [];
  return getSeatingTimes(date).map((time) => {
    const booked = reservations.filter((r) => r.date === dateKey && r.time === time && r.status !== "cancelled").length;
    // Deterministic busy slots, so some always read as full in the demo.
    const busy = hashString(`${dateKey}-${time}`) % 100 < 22;
    return { time, available: !busy && booked < SLOT_CAPACITY && !isPastSlot(date, time, now) };
  });
}

// Real API: GET /api/reservations/availability?date=YYYY-MM-DD
export async function getAvailability(dateKey: string): Promise<TimeSlot[]> {
  await delay(250, 600);
  maybeFail("reservations");
  return slotsFor(dateKey, readDb().reservations);
}

export type CreateReservationInput = Omit<Reservation, "id" | "code" | "status" | "createdAt">;

// Real API: POST /api/reservations
export async function createReservation(input: CreateReservationInput): Promise<Reservation> {
  await delay(900, 1400);
  maybeFail("reservations");
  const slot = slotsFor(input.date, readDb().reservations).find((s) => s.time === input.time);
  if (!slot?.available) throw new ApiError("That table was just taken — please pick another time.", 409);

  const reservation: Reservation = {
    ...input,
    id: uid("res"),
    code: `RSV-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  mutateDb((d) => {
    d.reservations.push(reservation);
  });
  return clone(reservation);
}

// Real API: GET /api/reservations?date=YYYY-MM-DD
export async function listReservations(dateKey: string): Promise<Reservation[]> {
  await delay();
  maybeFail("reservations");
  return clone(
    readDb()
      .reservations.filter((r) => r.date === dateKey)
      .sort((a, b) => a.time.localeCompare(b.time)),
  );
}

// Real API: PATCH /api/reservations/:id { status }
export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation> {
  await delay(120, 300);
  let updated: Reservation | undefined;
  mutateDb((db) => {
    const res = db.reservations.find((r) => r.id === id);
    if (!res) throw new ApiError("Reservation not found", 404);
    res.status = status;
    updated = res;
  });
  return clone(updated!);
}
