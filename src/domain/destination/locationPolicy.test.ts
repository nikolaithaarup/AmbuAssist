import {
  isAcceptableCachedLocation,
  isAccurateEnough,
  LOCATION_POLICY,
  withTimeout,
} from "./locationPolicy";

describe("location policy", () => {
  const candidate = (accuracy: number, timestamp = 1_000) => ({
    timestamp,
    coords: { accuracy },
  });

  test("rejects accuracy that could span nearby streets", () => {
    expect(isAccurateEnough(candidate(LOCATION_POLICY.maximumAccuracyMeters))).toBe(true);
    expect(isAccurateEnough(candidate(LOCATION_POLICY.maximumAccuracyMeters + 1))).toBe(false);
  });

  test("accepts only recent, accurate cached positions", () => {
    expect(isAcceptableCachedLocation(candidate(50), 121_000)).toBe(true);
    expect(isAcceptableCachedLocation(candidate(50), 121_001)).toBe(false);
    expect(isAcceptableCachedLocation(candidate(150), 2_000)).toBe(false);
  });

  test("times out a hung request", async () => {
    await expect(withTimeout(new Promise(() => undefined), 1)).rejects.toThrow(
      "LOCATION_TIMEOUT",
    );
  });
});

