/**
 * Mock transport for the API layer.
 *
 * Everything in /lib/api goes through these helpers, so swapping to a real
 * backend means replacing the bodies of the resource functions with `fetch`
 * calls — components and stores never touch localStorage directly.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Simulated network latency, so skeletons and loading states are visible in the demo. */
export function delay(min = 180, max = 420) {
  const ms = min + Math.random() * (max - min);
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Error-state demo switch: add `?fail=menu` (or `orders`, `reservations`, `all`)
 * to any URL to make that resource's requests fail.
 */
export function maybeFail(resource: string) {
  if (typeof window === "undefined") return;
  const fail = new URLSearchParams(window.location.search).get("fail");
  if (fail === resource || fail === "all") {
    throw new ApiError(`We couldn't reach the kitchen (${resource}). Please try again.`, 503);
  }
}

/** Clone so callers can't mutate the "database" by accident. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
