"use client";

import { create } from "zustand";

export { INTRO_SEEN_KEY } from "@/lib/intro-gate";

/** Whether the burger intro has finished (hero animations wait for it). */
export const useIntro = create<{ done: boolean; finish: () => void }>()((set) => ({
  done: false,
  finish: () => set({ done: true }),
}));
