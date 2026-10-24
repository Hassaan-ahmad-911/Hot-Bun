"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Demo-only "login". There is no real authentication: the flag lives in
 * sessionStorage so the admin panel can show a login screen. Replace with your
 * auth provider (NextAuth, Clerk, Supabase…) and protect /admin in middleware.
 */
export const DEMO_CREDENTIALS = { email: "owner@hotbun.example", password: "smash-it" };

interface AdminAuthState {
  user: { name: string; email: string } | null;
  hydrated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      signIn: async (email, password) => {
        await new Promise((r) => setTimeout(r, 700));
        const ok =
          email.trim().toLowerCase() === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;
        if (ok) set({ user: { name: "Jess Ramos", email: DEMO_CREDENTIALS.email } });
        return ok;
      },
      signOut: () => set({ user: null }),
    }),
    {
      name: "hotbun:admin-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ user: s.user }),
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useAdminAuth.setState({ hydrated: true });
      },
    },
  ),
);
