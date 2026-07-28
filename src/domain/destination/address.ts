export type ResolvedAddress = {
  streetName?: string;
  houseNumber?: number;
  houseNumberSuffix?: string;
  postalCode?: string;
  city?: string;
  district?: string;
  municipality?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
};

const DASHES = /[‐‑‒–—−]/g;
const APOSTROPHES = /[’‘`´]/g;

/** A conservative lookup key. Danish letters are preserved. */
export function normalizeStreetName(value?: string | null): string {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(DASHES, "-")
    .replace(APOSTROPHES, "'")
    .replace(/\s*\([^)]*\bnr\.?[^)]*\)\s*$/iu, "")
    .replace(/[,;]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("da-DK");
}

export function parseHouseNumber(
  ...values: Array<string | null | undefined>
): { number?: number; suffix?: string } {
  for (const value of values) {
    const match = String(value ?? "").match(
      /(?:^|\s)(\d{1,4})\s*([a-zæøå])?(?=\s|,|$)/iu,
    );
    if (match) {
      return {
        number: Number(match[1]),
        suffix: match[2]?.toLocaleUpperCase("da-DK"),
      };
    }
  }
  return {};
}

/** Extracts a street from either a dedicated field or a formatted address. */
export function parseStreetName(
  street?: string | null,
  formattedAddress?: string | null,
): string | undefined {
  const dedicated = String(street ?? "").trim();
  if (dedicated) return dedicated;

  const firstPart = String(formattedAddress ?? "").split(",")[0]?.trim();
  if (!firstPart) return undefined;
  const withoutNumber = firstPart
    .replace(/\s+\d{1,4}\s*[a-zæøå]?(?:\s|$).*$/iu, "")
    .trim();
  return withoutNumber || undefined;
}

