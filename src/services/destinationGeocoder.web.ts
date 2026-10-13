import {
  DestinationGeocoderError,
  type DestinationGeocodedAddress,
  type ReverseGeocodeCoordinates,
} from "./destinationGeocoder.types";

type DestinationGeocoderResponse = {
  address?: unknown;
};

const DESTINATION_GEOCODER_ENDPOINT = "/api/destination-geocode";

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

  const address = normalizeDestinationAddress(
    (payload as DestinationGeocoderResponse).address,
  );
  return address ? [address] : [];
}

export type { DestinationGeocodedAddress } from "./destinationGeocoder.types";
