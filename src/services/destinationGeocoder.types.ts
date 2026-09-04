export type DestinationGeocodedAddress = {
  city?: string | null;
  country?: string | null;
  district?: string | null;
  formattedAddress?: string | null;
  isoCountryCode?: string | null;
  name?: string | null;
  postalCode?: string | null;
  region?: string | null;
  street?: string | null;
  streetNumber?: string | null;
  subregion?: string | null;
};

export type ReverseGeocodeCoordinates = {
  latitude: number;
  longitude: number;
};

export type DestinationGeocoderErrorCode =
  | "offline"
  | "timeout"
  | "provider_error"
  | "invalid_response";

export class DestinationGeocoderError extends Error {
  constructor(
    public readonly code: DestinationGeocoderErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "DestinationGeocoderError";
  }
}
