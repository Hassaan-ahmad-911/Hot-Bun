import { categories } from "@/data/menu";
import type { Category, Dish } from "@/lib/types";
import { uid } from "@/lib/utils";
import { ApiError, clone, delay, maybeFail } from "./client";
import { mutateDb, readDb } from "./mock-db";

// Real API: GET /api/menu
export async function getMenu(): Promise<{ categories: Category[]; dishes: Dish[] }> {
  await delay();
  maybeFail("menu");
  return { categories: clone(categories), dishes: clone(readDb().dishes) };
}

/** Synchronous read used to re-sync instantly after a change notification. */
export function peekDishes(): Dish[] {
  return clone(readDb().dishes);
}

// Real API: PATCH /api/menu/:id
export async function updateDish(id: string, patch: Partial<Omit<Dish, "id">>): Promise<Dish> {
  await delay(150, 350);
  let updated: Dish | undefined;
  mutateDb((db) => {
    const dish = db.dishes.find((d) => d.id === id);
    if (!dish) throw new ApiError("Dish not found", 404);
    Object.assign(dish, patch);
    updated = dish;
  });
  return clone(updated!);
}

// Real API: POST /api/menu
export async function createDish(input: Omit<Dish, "id">): Promise<Dish> {
  await delay(250, 500);
  const dish: Dish = { ...input, id: uid("dish") };
  mutateDb((db) => {
    db.dishes.push(dish);
  });
  return clone(dish);
}

// Real API: DELETE /api/menu/:id
export async function deleteDish(id: string): Promise<void> {
  await delay(150, 300);
  mutateDb((db) => {
    db.dishes = db.dishes.filter((d) => d.id !== id);
  });
}
