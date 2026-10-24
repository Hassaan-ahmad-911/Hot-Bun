"use client";

import { create } from "zustand";
import { menuApi, subscribeToDb } from "@/lib/api";
import type { Category, Dish } from "@/lib/types";

type Status = "idle" | "loading" | "ready" | "error";

interface MenuState {
  categories: Category[];
  dishes: Dish[];
  status: Status;
  error: string | null;

  load: (opts?: { force?: boolean }) => Promise<void>;
  /** Optimistic update — the public menu reflects admin edits immediately. */
  updateDish: (id: string, patch: Partial<Omit<Dish, "id">>) => Promise<void>;
  createDish: (input: Omit<Dish, "id">) => Promise<Dish>;
  deleteDish: (id: string) => Promise<void>;
}

let unsubscribe: (() => void) | null = null;

/**
 * Shared menu state used by both the public menu and the admin editor.
 * The store is a client cache over /lib/api; it re-syncs whenever the
 * mock database changes (in this tab or another one).
 */
export const useMenu = create<MenuState>()((set, get) => ({
  categories: [],
  dishes: [],
  status: "idle",
  error: null,

  load: async ({ force = false } = {}) => {
    const { status } = get();
    if (!force && (status === "ready" || status === "loading")) return;
    set({ status: "loading", error: null });
    try {
      const { categories, dishes } = await menuApi.getMenu();
      set({ categories, dishes, status: "ready" });
      if (!unsubscribe) {
        unsubscribe = subscribeToDb(() => {
          if (get().status === "ready") set({ dishes: menuApi.peekDishes() });
        });
      }
    } catch (err) {
      set({ status: "error", error: err instanceof Error ? err.message : "Something went wrong." });
    }
  },

  updateDish: async (id, patch) => {
    const previous = get().dishes;
    set({ dishes: previous.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
    try {
      await menuApi.updateDish(id, patch);
    } catch (err) {
      set({ dishes: previous }); // roll back
      throw err;
    }
  },

  createDish: async (input) => {
    const dish = await menuApi.createDish(input);
    set((s) => ({ dishes: s.dishes.some((d) => d.id === dish.id) ? s.dishes : [...s.dishes, dish] }));
    return dish;
  },

  deleteDish: async (id) => {
    const previous = get().dishes;
    set({ dishes: previous.filter((d) => d.id !== id) });
    try {
      await menuApi.deleteDish(id);
    } catch (err) {
      set({ dishes: previous });
      throw err;
    }
  },
}));
