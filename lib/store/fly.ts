"use client";

import { create } from "zustand";
import type { CategoryId } from "@/lib/types";

export interface Flight {
  id: number;
  from: { x: number; y: number; width: number; height: number };
  to: { x: number; y: number };
  category: CategoryId;
  image?: string;
}

interface FlyState {
  flights: Flight[];
  launch: (source: HTMLElement, opts: { category: CategoryId; image?: string }) => void;
  land: (id: number) => void;
}

let nextId = 1;

/** Cart buttons mark themselves with this attribute; the visible one is the flight target. */
export const CART_TARGET_ATTR = "data-cart-target";

function findTarget(): DOMRect | null {
  const targets = Array.from(document.querySelectorAll<HTMLElement>(`[${CART_TARGET_ATTR}]`));
  for (const el of targets) {
    const rect = el.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
    if (visible) return rect;
  }
  return null;
}

/** The "add to cart" flight: a dish thumbnail arcs from its card into the cart. */
export const useFly = create<FlyState>()((set) => ({
  flights: [],
  launch: (source, { category, image }) => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const from = source.getBoundingClientRect();
    const target = findTarget();
    if (!target) return;
    const flight: Flight = {
      id: nextId++,
      from: { x: from.left, y: from.top, width: from.width, height: from.height },
      to: { x: target.left + target.width / 2, y: target.top + target.height / 2 },
      category,
      image,
    };
    set((s) => ({ flights: [...s.flights, flight] }));
  },
  land: (id) => set((s) => ({ flights: s.flights.filter((f) => f.id !== id) })),
}));
