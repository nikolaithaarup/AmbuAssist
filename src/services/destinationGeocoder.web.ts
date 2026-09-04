import {
  DestinationGeocoderError,
  type DestinationGeocodedAddress,
  type ReverseGeocodeCoordinates,
} from "./destinationGeocoder.types";

type DawaMiniAddress = {
  betegnelse?: unknown;
  husnr?: unknown;
  postnr?: unknown;
  postnrnavn?: unknown;
  supplerendebynavn?: unknown;
  vejnavn?: unknown;
};

const DEFAULT_DAWA_ENDPOINT =
  "https://api.dataforsyningen.dk/adgangsadresser/reverse";

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizeDawaAddress(
  value: DawaMiniAddress,
): DestinationGeocodedAddress {
  const street = optionalString(value.vejnavn);
  const streetNumber = optionalString(value.husnr);
  const city = optionalString(value.postnrnavn);

  return {
    city,
    country: "Danmark",
    district: optionalString(value.supplerendebynavn),
    formattedAddress:
      optionalString(value.betegnelse) ??
      [street, streetNumber, optionalString(value.postnr), city]
        .filter(Boolean)
        .join(" "),
    isoCountryCode: "DK",
    name: streetNumber,
    postalCode: optionalString(value.postnr),
    street,
    streetNumber,
  };
}

export async function reverseGeocodeDestination(
  { latitude, longitude }: ReverseGeocodeCoordinates,
  fetcher: typeof fetch = fetch,
): Promise<DestinationGeocodedAddress[]> {
  const endpoint =
    process.env.EXPO_PUBLIC_DESTINATION_GEOCODER_URL ?? DEFAULT_DAWA_ENDPOINT;
  const url = new URL(endpoint, globalThis.location?.origin);
  url.searchParams.set("x", String(longitude));
  url.searchParams.set("y", String(latitude));
  url.searchParams.set("struktur", "mini");

  let response: Response;
  try {
    response = await fetcher(url.toString(), {
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    throw new DestinationGeocoderError(
      offline ? "offline" : "provider_error",
      offline
        ? "Ingen internetforbindelse til adresseopslag."
        : "Adresseudbyderen kunne ikke kontaktes.",
    );
  }

  if (!response.ok) {
    throw new DestinationGeocoderError(
      "provider_error",
      `Adresseudbyderen svarede med HTTP ${response.status}.`,
    );
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new DestinationGeocoderError(
      "invalid_response",
      "Adresseudbyderen returnerede et ugyldigt svar.",
    );
  }

  return [normalizeDawaAddress(payload as DawaMiniAddress)];
}

export type { DestinationGeocodedAddress } from "./destinationGeocoder.types";
