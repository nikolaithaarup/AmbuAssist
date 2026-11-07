import { parseReverseGeocodedHouseNumber, parseStreetName } from "./address";
import { deriveAutomaticRoutingStrategy } from "./automaticRouting";
import { norm, type StreetAliasMap } from "./routing";
import type { Kommune, RawStreetRow } from "./types";
import type { DestinationGeocodedAddress } from "../../services/destinationGeocoder.types";

export type GpsConfirmationChoice =
  | { kind: "municipality"; key: string; label: string; kommune: Kommune }
  | { kind: "street"; key: string; label: string; street: string;
      postcode?: string; postalFallbackCandidate?: number }
  | { kind: "address"; key: string; label: string; candidateIndex: number };

/** Group nearby DAR address candidates by the actual clinical routing decision.
 * A municipality choice does NOT identify a patient address. Within Byen a street
 * choice does NOT establish a house number, side, or range: those remain unresolved
 * until the authoritative street rule can decide them.
 */
export function buildGpsConfirmationChoices(
  candidates: readonly DestinationGeocodedAddress[],
  streetRows: RawStreetRow[],
  aliases: StreetAliasMap = {},
): GpsConfirmationChoice[] {
  const unique = new Map<string, GpsConfirmationChoice>();
  candidates.forEach((candidate, candidateIndex) => {
    const street = parseStreetName(candidate.street, candidate.formattedAddress) ?? "";
    const house = parseReverseGeocodedHouseNumber(candidate);
    const postcode = String(candidate.postalCode ?? "").trim();
    const strategy = deriveAutomaticRoutingStrategy({
      street,
      houseNumber: house.number,
      postcode,
      city: candidate.city ?? "",
      district: candidate.district ?? "",
      subregion: candidate.subregion ?? "",
      region: candidate.region ?? "",
      municipalityCode: candidate.municipalityCode,
    }, streetRows, aliases);

    if (strategy.area === "region") {
      const key = "kommune:" + norm(strategy.kommune);
      if (!unique.has(key)) unique.set(key, {
        kind: "municipality", key, label: strategy.kommune, kommune: strategy.kommune,
      });
      return;
    }
    if (strategy.area === "byen" && street) {
      const key = "gade:" + norm(street) + ":" + postcode;
      if (!unique.has(key)) unique.set(key, {
        kind: "street", key, label: postcode ? street + " · " + postcode : street, street,
        postcode: postcode || undefined,
        postalFallbackCandidate: strategy.source === "postal_district_fallback"
          ? candidateIndex : undefined,
      });
      return;
    }
    // Never invent a municipality or street route from an unmapped address.
    const key = "adresse:" + candidateIndex;
    unique.set(key, {
      kind: "address", key,
      label: candidate.formattedAddress || street || "Ukendt adresse",
      candidateIndex,
    });
  });
  return [...unique.values()];
}
