"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CategoryId, Dish } from "@/lib/types";

export interface CartLine {
  dishId: string;
  name: string;
  unitPrice: number;
  category: CategoryId;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  /** Increments on every add — components key "bump" animations off it. */
  pulse: number;
  /** Polite screen-reader announcement for the last cart change. */
  announcement: string;
  hydrated: boolean;

  add: (dish: Pick<Dish, "id" | "name" | "price" | "category">, quantity?: number) => void;
  setQuantity: (dishId: string, quantity: number) => void;
  increment: (dishId: string) => void;
  decrement: (dishId: string) => void;
  remove: (dishId: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

const MAX_QTY = 20;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      pulse: 0,
      announcement: "",
      hydrated: false,

      add: (dish, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.dishId === dish.id);
          const lines = existing
            ? state.lines.map((l) =>
                l.dishId === dish.id ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l,
              )
            : [
                ...state.lines,
                { dishId: dish.id, name: dish.name, unitPrice: dish.price, category: dish.category, quantity },
              ];
          return { lines, pulse: state.pulse + 1, announcement: `Added ${dish.name} to your order.` };
        }),

      setQuantity: (dishId, quantity) => {
        if (quantity <= 0) return get().remove(dishId);
        set((state) => ({
          lines: state.lines.map((l) => (l.dishId === dishId ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l)),
        }));
      },

      increment: (dishId) => {
        const line = get().lines.find((l) => l.dishId === dishId);
        if (!line) return;
        get().setQuantity(dishId, line.quantity + 1);
        set((s) => ({ pulse: s.pulse + 1, announcement: `${line.name}: ${Math.min(MAX_QTY, line.quantity + 1)}.` }));
      },

      decrement: (dishId) => {
        const line = get().lines.find((l) => l.dishId === dishId);
        if (!line) return;
        get().setQuantity(dishId, line.quantity - 1);
        set({ announcement: line.quantity - 1 > 0 ? `${line.name}: ${line.quantity - 1}.` : `Removed ${line.name}.` });
      },

      remove: (dishId) =>
        set((state) => {
          const line = state.lines.find((l) => l.dishId === dishId);
          return {
            lines: state.lines.filter((l) => l.dishId !== dishId),
            announcement: line ? `Removed ${line.name}.` : state.announcement,
          };
        }),

      clear: () => set({ lines: [], announcement: "" }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "hotbun:cart:v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
      // Hydrate manually after mount so the server and first client render match.
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useCart.setState({ hydrated: true });
      },
    },
  ),
);

export const selectItemCount = (s: CartState) => s.lines.reduce((n, l) => n + l.quantity, 0);
export const selectSubtotal = (s: CartState) => s.lines.reduce((n, l) => n + l.quantity * l.unitPrice, 0);
export const selectQuantityOf = (dishId: string) => (s: CartState) =>
  s.lines.find((l) => l.dishId === dishId)?.quantity ?? 0;
