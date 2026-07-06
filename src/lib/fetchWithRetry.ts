import { auth } from './firebase';

/**
 * Wraps fetch() with a short automatic retry on 5xx responses. In production these endpoints sit
 * behind an nginx + Authelia auth_request setup that occasionally times out talking to Authelia,
 * which nginx turns into an opaque 500 before the request ever reaches the app (see the b2prep
 * incident: intermittent "auth request unexpected status: 408" on /api/sheets/sync and
 * /api/tutor/chat). That failure is transient, so retrying once after a short delay is usually
 * enough. 4xx responses are returned immediately since retrying a validation error can't help.
 */
export async function fetchWithRetry(
  input: string,
  init?: RequestInit,
  { retries = 1, delayMs = 1500 }: { retries?: number; delayMs?: number } = {}
): Promise<Response> {
  let lastResponse: Response;
  for (let attempt = 0; ; attempt++) {
    lastResponse = await fetch(input, init);
    if (lastResponse.status < 500 || attempt >= retries) return lastResponse;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

/**
 * Same as fetchWithRetry, but attaches the current Firebase ID token as a Bearer token. The
 * server.ts endpoints verify this themselves (see serverAuth.ts) rather than relying solely on
 * whatever reverse proxy happens to sit in front of the app in production.
 */
export async function authedFetchWithRetry(
  input: string,
  init: RequestInit = {},
  options?: { retries?: number; delayMs?: number }
): Promise<Response> {
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetchWithRetry(input, { ...init, headers }, options);
}
