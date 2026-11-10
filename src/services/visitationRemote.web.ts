const DEFAULT_VISITATION_URL =
  "https://portal.synapsestudio.dk/api/ambuassist/visitation";

export async function fetchPublishedVisitation(): Promise<unknown | null> {
  try {
    const response = await fetch(
      process.env.EXPO_PUBLIC_PORTAL_VISITATION_URL ?? DEFAULT_VISITATION_URL,
      {
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      },
    );
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}
