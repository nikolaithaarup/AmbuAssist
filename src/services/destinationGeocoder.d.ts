export {
  type DestinationGeocodedAddress,
  type ReverseGeocodeCoordinates,
} from "./destinationGeocoder.types";

import type {
  DestinationGeocodedAddress,
  ReverseGeocodeCoordinates,
} from "./destinationGeocoder.types";

export function reverseGeocodeDestination(
  coordinates: ReverseGeocodeCoordinates,
): Promise<DestinationGeocodedAddress[]>;
