export const CURRENT_PWA_BUILD_ID =
  process.env.EXPO_PUBLIC_BUILD_ID?.trim() || "development";

export type PwaVersion = { buildId: string };

export function parsePwaVersion(value: unknown): PwaVersion | null {
  if (!value || typeof value !== "object") return null;
  const buildId = (value as { buildId?: unknown }).buildId;
  if (typeof buildId !== "string" || !buildId.trim()) return null;
  return { buildId: buildId.trim() };
}

export function isSafePwaUpdatePath(pathname: string): boolean {
  return pathname === "/" || pathname === "/home";
}

export function shouldApplyPwaUpdate({
  availableBuildId,
  currentBuildId = CURRENT_PWA_BUILD_ID,
  pathname,
  hasActiveArrestSession,
}: {
  availableBuildId: string | null;
  currentBuildId?: string;
  pathname: string;
  hasActiveArrestSession: boolean;
}): boolean {
  return Boolean(
    availableBuildId &&
      availableBuildId !== currentBuildId &&
      isSafePwaUpdatePath(pathname) &&
      !hasActiveArrestSession,
  );
}

export async function fetchAvailablePwaBuildId(
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  try {
    const response = await fetcher(`/version.json?t=${Date.now()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return parsePwaVersion(await response.json())?.buildId ?? null;
  } catch {
    return null;
  }
}
