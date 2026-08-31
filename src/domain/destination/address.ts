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
    const addressSegment = String(value ?? "").split(",")[0]?.trim();
    const match = addressSegment.match(/(?:^|\s)(\d{1,4})\s*([a-zæøå])?$/iu);
    if (match) {
      return {
        number: Number(match[1]),
        suffix: match[2]?.toLocaleUpperCase("da-DK"),
      };
    }
  }
  return {};
}

export type ReverseGeocodedHouseNumberInput = {
  streetNumber?: string | null;
  street?: string | null;
  name?: string | null;
  formattedAddress?: string | null;
};

/**
 * Parses structured reverse-geocoder evidence without treating a placemark/POI
 * name or a postcode segment as a house number.
 */
export function parseReverseGeocodedHouseNumber({
  streetNumber,
  street,
  formattedAddress,
}: ReverseGeocodedHouseNumberInput): { number?: number; suffix?: string } {
  const dedicated = parseHouseNumber(streetNumber);
  if (dedicated.number !== undefined) return dedicated;

  const addressSegment = String(formattedAddress ?? "").split(",")[0]?.trim();
  if (!addressSegment || !/\p{L}/u.test(addressSegment)) return {};

  const parsedStreet = parseStreetName(undefined, addressSegment);
  const dedicatedStreet = String(street ?? "").trim();
  if (
    !parsedStreet ||
    (dedicatedStreet && normalizeStreetName(parsedStreet) !== normalizeStreetName(dedicatedStreet))
  ) {
    return {};
  }

  return parseHouseNumber(addressSegment);
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
