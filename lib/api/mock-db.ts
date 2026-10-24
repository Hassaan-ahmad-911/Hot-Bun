import { dishes as seedDishes } from "@/data/menu";
import { generateSampleOrders } from "@/data/orders";
import { generateSampleReservations } from "@/data/reservations";
import { toDateKey } from "@/lib/dates";
import { getServiceStart } from "@/lib/hours";
import type { Dish, Order, Reservation } from "@/lib/types";

/**
 * A tiny localStorage-backed "database" standing in for a real backend.
 * It is the single source of truth for the mock API, which is what lets the
 * admin panel and the public site stay in sync — even across browser tabs.
 */

const STORAGE_KEY = "hotbun:mockdb:v1";
const CHANGE_EVENT = "hotbun:db-change";

interface Db {
  seededOn: string;
  dishes: Dish[];
  orders: Order[];
  reservations: Reservation[];
}

/** Sample data is regenerated once per service, so it always looks like the latest shift. */
const seedKey = (now = new Date()) => toDateKey(getServiceStart(now));

function freshSeed(): Db {
  const now = new Date();
  return {
    seededOn: seedKey(now),
    dishes: structuredClone(seedDishes),
    orders: generateSampleOrders(now),
    reservations: generateSampleReservations(now),
  };
}

let memory: Db | null = null;

export function readDb(): Db {
  if (typeof window === "undefined") return memory ?? (memory = freshSeed());
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const db = JSON.parse(raw) as Db;
      const today = toDateKey(new Date());
      if (db.seededOn !== seedKey()) {
        // New service: refresh the sample orders/bookings, keep the guest's own and any menu edits.
        const seed = freshSeed();
        db.orders = [...seed.orders, ...db.orders.filter((o) => !o.id.startsWith("ord_sample"))];
        db.reservations = [
          ...seed.reservations,
          ...db.reservations.filter((r) => !r.id.startsWith("res_sample") && r.date >= today),
        ];
        db.seededOn = seedKey();
        writeDb(db, { silent: true });
      }
      return db;
    }
  } catch {
    // Corrupt or blocked storage — fall back to memory.
  }
  if (!memory) {
    memory = freshSeed();
    writeDb(memory, { silent: true });
  }
  return memory;
}

export function writeDb(db: Db, opts: { silent?: boolean } = {}) {
  memory = db;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Quota exceeded (e.g. a huge uploaded photo) or storage blocked — keep the in-memory copy.
  }
  if (!opts.silent) window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function mutateDb(fn: (db: Db) => void) {
  const db = readDb();
  fn(db);
  writeDb(db);
}

/** Wipe all demo data back to the seed. */
export function resetDb() {
  memory = freshSeed();
  writeDb(memory);
}

/**
 * Subscribe to data changes from this tab (CustomEvent) or other tabs (storage event).
 * With a real backend this would be a websocket / SSE subscription.
 */
export function subscribeToDb(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}
