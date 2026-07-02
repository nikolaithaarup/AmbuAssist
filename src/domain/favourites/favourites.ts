const TOOL_PATH_PREFIX = "/tools/";

export function normalizeFavouritePath(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const path = value.trim().split(/[?#]/, 1)[0].replace(/\/+$/, "");
  if (!path.startsWith(TOOL_PATH_PREFIX)) return null;
  return path;
}

export function normalizeFavouritePaths(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map(normalizeFavouritePath).filter((path): path is string => path !== null)));
}

export function toggleFavouritePath(paths: string[], path: string): string[] {
  const normalizedPaths = normalizeFavouritePaths(paths);
  const normalizedPath = normalizeFavouritePath(path);
  if (!normalizedPath) return normalizedPaths;
  if (normalizedPaths.includes(normalizedPath)) {
    return normalizedPaths.filter((item) => item !== normalizedPath);
  }
  return [...normalizedPaths, normalizedPath];
}

export function isFavouritePath(paths: string[], path: string): boolean {
  const normalizedPath = normalizeFavouritePath(path);
  return normalizedPath !== null && normalizeFavouritePaths(paths).includes(normalizedPath);
}
