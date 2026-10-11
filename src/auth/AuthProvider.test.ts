import {
  getSessionRefreshDelay,
  MAX_SESSION_REFRESH_DELAY_MS,
} from "./sessionRefresh";

describe("getSessionRefreshDelay", () => {
  it("uses the remaining lifetime for near-term expirations", () => {
    expect(getSessionRefreshDelay(25_000, 10_000)).toBe(15_000);
  });

  it("refreshes immediately after expiration", () => {
    expect(getSessionRefreshDelay(5_000, 10_000)).toBe(0);
  });

  it("caps long-lived sessions at the browser timer limit", () => {
    expect(getSessionRefreshDelay(Number.POSITIVE_INFINITY, 10_000)).toBe(
      MAX_SESSION_REFRESH_DELAY_MS,
    );
    expect(getSessionRefreshDelay(Date.UTC(2099, 0, 1), Date.UTC(2026, 0, 1))).toBe(
      MAX_SESSION_REFRESH_DELAY_MS,
    );
  });
});
