const TOOL_PATH_PREFIX = "/tools/";

export function normalizeFavouritePaths(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value.filter(
        (path): path is string =>
          typeof path === "string" && path.startsWith(TOOL_PATH_PREFIX),
      ),
    ),
  );
}

export function toggleFavouritePath(paths: string[], path: string): string[] {
  if (paths.includes(path)) return paths.filter((item) => item !== path);
  return [...paths, path];
}
