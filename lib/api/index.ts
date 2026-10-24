/**
 * The mock API layer.
 *
 * Every function here is async and returns plain data, exactly like a fetch
 * wrapper would. To connect a real backend, replace each function body with a
 * `fetch` call to the endpoint noted in its comment — nothing in /components
 * or /lib/store needs to change.
 */
export * as menuApi from "./menu";
export * as ordersApi from "./orders";
export * as reservationsApi from "./reservations";
export * as dashboardApi from "./dashboard";
export { ApiError } from "./client";
export { subscribeToDb, resetDb } from "./mock-db";
