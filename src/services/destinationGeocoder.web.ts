import {
  DestinationGeocoderError,
  type DestinationGeocodedAddress,
  type ReverseGeocodeCoordinates,
} from "./destinationGeocoder.types";

type DestinationGeocoderResponse = {
  address?: unknown;
  addresses?: unknown;
};

const DESTINATION_GEOCODER_ENDPOINT = "/api/destination-geocode";
const MAXIMUM_ADDRESS_DISTANCE_METERS = 100;

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizeDestinationAddress(
  value: unknown,
): DestinationGeocodedAddress | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const street = optionalString(raw.street);
  const streetNumber = optionalString(raw.streetNumber);
  const postalCode = optionalString(raw.postalCode);
  const city = optionalString(raw.city);
  const formattedAddress = optionalString(raw.formattedAddress);

  if (!street || !postalCode || !city || !formattedAddress) return null;

  return {
    city,
    country: optionalString(raw.country) ?? "Danmark",
    district: optionalString(raw.district),
    distanceMeters: optionalNumber(raw.distanceMeters),
    formattedAddress,
    isoCountryCode: optionalString(raw.isoCountryCode) ?? "DK",
    name: streetNumber,
    postalCode,
    street,
    streetNumber,
  };
}

export async function reverseGeocodeDestination(
  { latitude, longitude }: ReverseGeocodeCoordinates,
  fetcher: typeof fetch = fetch,
): Promise<DestinationGeocodedAddress[]> {
  let response: Response;
  try {
    response = await fetcher(DESTINATION_GEOCODER_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ latitude, longitude }),
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

  const responsePayload = payload as DestinationGeocoderResponse;
  const rawAddresses = Array.isArray(responsePayload.addresses)
    ? responsePayload.addresses
    : [responsePayload.address];
  const uniqueAddresses = new Map<string, DestinationGeocodedAddress>();
  for (const value of rawAddresses) {
    const address = normalizeDestinationAddress(value);
    if (
      !address?.formattedAddress ||
      address.distanceMeters === null ||
      address.distanceMeters === undefined ||
      address.distanceMeters < 0 ||
      address.distanceMeters > MAXIMUM_ADDRESS_DISTANCE_METERS
    ) {
      continue;
    }
    const key = address.formattedAddress
      .normalize("NFKC")
      .toLocaleLowerCase("da-DK")
      .replace(/\s+/gu, " ")
      .trim();
    const current = uniqueAddresses.get(key);
    if (
      !current ||
      (address.distanceMeters ?? Infinity) <
        (current.distanceMeters ?? Infinity)
    ) {
      uniqueAddresses.set(key, address);
    }
  }
  return [...uniqueAddresses.values()]
    .sort(
      (a, b) =>
        (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity),
    )
    .slice(0, 5);
}

export type { DestinationGeocodedAddress } from "./destinationGeocoder.types";
