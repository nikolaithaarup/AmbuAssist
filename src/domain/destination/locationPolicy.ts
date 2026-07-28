export const LOCATION_POLICY = {
  // Copenhagen blocks often contain parallel streets and visitation boundaries.
  // Coordinates are therefore only a gate for reverse geocoding: the resolved
  // address and routing rule remain authoritative.
  highConfidenceAccuracyMeters: 40,
  maximumAccuracyMeters: 100,
  maximumCachedAgeMs: 120_000,
  timeoutMs: 12_000,
  retryCount: 1,
} as const;

export type LocationConfidence = "high" | "medium" | "poor";

export function classifyLocationConfidence(input: {
  accuracy: number | null;
  hasStreet: boolean;
  hasCompleteRoutingAddress: boolean;
}): LocationConfidence {
  if (
    input.accuracy === null ||
    input.accuracy > LOCATION_POLICY.maximumAccuracyMeters ||
    !input.hasStreet
  ) {
    return "poor";
  }

  if (
    input.accuracy <= LOCATION_POLICY.highConfidenceAccuracyMeters &&
    input.hasCompleteRoutingAddress
  ) {
    return "high";
  }

  return "medium";
}

export type LocationCandidate = {
  timestamp: number;
  coords: { accuracy: number | null };
};

export function isAccurateEnough(candidate: LocationCandidate): boolean {
  const accuracy = candidate.coords.accuracy;
  return accuracy !== null && accuracy <= LOCATION_POLICY.maximumAccuracyMeters;
}

export function isAcceptableCachedLocation(
  candidate: LocationCandidate,
  now = Date.now(),
): boolean {
  return (
    now - candidate.timestamp <= LOCATION_POLICY.maximumCachedAgeMs &&
    isAccurateEnough(candidate)
  );
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = LOCATION_POLICY.timeoutMs,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("LOCATION_TIMEOUT")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
