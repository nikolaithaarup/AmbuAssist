import * as Location from "expo-location";

import type {
  DestinationGeocodedAddress,
  ReverseGeocodeCoordinates,
} from "./destinationGeocoder.types";

export async function reverseGeocodeDestination(
  coordinates: ReverseGeocodeCoordinates,
): Promise<DestinationGeocodedAddress[]> {
  return Location.reverseGeocodeAsync(coordinates);
}

export type { DestinationGeocodedAddress } from "./destinationGeocoder.types";
