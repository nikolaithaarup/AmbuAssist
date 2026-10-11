// Browsers clamp larger setTimeout values to a few milliseconds, which can
// otherwise turn a long-lived Portal session into a tight refresh loop.
export const MAX_SESSION_REFRESH_DELAY_MS = 2_147_483_647;

export function getSessionRefreshDelay(expiry: number, now = Date.now()): number {
  return Math.min(
    MAX_SESSION_REFRESH_DELAY_MS,
    Math.max(0, expiry - now),
  );
}
