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
