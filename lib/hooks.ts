"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Current time, but only after mount (null during SSR) so time-dependent UI
 * such as "Open now" never causes a hydration mismatch.
 */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export type AsyncState<T> =
  | { status: "loading"; data?: T; error?: undefined }
  | { status: "ready"; data: T; error?: undefined }
  | { status: "error"; data?: T; error: string };

/** Minimal data-fetching hook for API-layer calls (swap for TanStack Query later if you like). */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async (opts: { quiet?: boolean } = {}) => {
    if (!opts.quiet) setState((s) => ({ status: "loading", data: s.data }));
    try {
      const data = await fnRef.current();
      setState({ status: "ready", data });
    } catch (err) {
      setState((s) => ({ status: "error", data: s.data, error: err instanceof Error ? err.message : "Something went wrong." }));
    }
  }, []);

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, reload: run, setData: (data: T) => setState({ status: "ready", data }) };
}

/** Lock page scroll while an overlay is open. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}
