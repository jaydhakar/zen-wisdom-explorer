/**
 * App configuration derived from environment.
 *
 * The backend base URL is never hardcoded — it comes from EXPO_PUBLIC_API_URL
 * (see .env.example). Falls back to localhost for the simplest local case.
 */

const DEFAULT_API_URL = "http://localhost:8000";

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL
).replace(/\/+$/, "");
