import {
  classifyLocationConfidence,
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

  test.each([
    [20, true, true, "high"],
    [40, true, true, "high"],
    [41, true, true, "medium"],
    [100, true, true, "medium"],
    [20, true, false, "medium"],
    [101, true, true, "poor"],
    [20, false, true, "poor"],
    [null, true, true, "poor"],
  ] as const)(
    "classifies %s metre address confidence",
    (accuracy, hasStreet, hasCompleteRoutingAddress, expected) => {
      expect(
        classifyLocationConfidence({
          accuracy,
          hasStreet,
          hasCompleteRoutingAddress,
        }),
      ).toBe(expected);
    },
  );

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
