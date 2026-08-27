import { parseHouseNumber, parseStreetName } from "./address";
import {
  mapByenGeocodeToOfficialBydel,
  mapRegionCityToKommune,
  norm,
  resolveStreetRoute,
  type StreetRouteResult,
} from "./routing";
import type {
  Kommune,
  RawStreetRow,
  RegionCategory,
} from "./types";
import { getCategoryForArea } from "./categoryRouting";

export type AutomaticRoutingStrategy =
  | { area: "byen"; street: string; route: StreetRouteResult }
  | { area: "region"; kommune: Kommune }
  | {
      area: "unresolved";
      reason:
        | "missing_street"
        | "unknown_city_street"
        | "missing_area_evidence";
    };

export type AddressRoutingEvidence = {
  street?: string;
  postcode?: string;
  city?: string;
  district?: string;
  subregion?: string;
  region?: string;
  houseNumber?: number;
};

function hasCopenhagenEvidence(address: AddressRoutingEvidence) {
  if (mapByenGeocodeToOfficialBydel(address)) return true;
  const locality = norm(
    [address.city, address.district, address.subregion, address.region]
      .filter(Boolean)
      .join(" "),
  );
  return (
    locality.includes("københavn") ||
    locality.includes("kobenhavn") ||
    locality.includes("frederiksberg")
  );
}

export function deriveAutomaticRoutingStrategy(
  address: AddressRoutingEvidence,
  streetRows: RawStreetRow[],
): AutomaticRoutingStrategy {
  const street = String(address.street ?? "").trim();
  const isCopenhagenAddress = hasCopenhagenEvidence(address);

  if (isCopenhagenAddress) {
    if (!street) return { area: "unresolved", reason: "missing_street" };
    const route = resolveStreetRoute(
      streetRows,
      street,
      "",
      address.houseNumber,
      address.postcode,
    );
    if (route.status === "not_found") {
      return { area: "unresolved", reason: "unknown_city_street" };
    }
    return { area: "byen", street, route };
  }

  const candidates = [
    address.city,
    address.district,
    address.subregion,
    address.region,
  ].filter(Boolean) as string[];
  for (const candidate of candidates) {
    const kommune = mapRegionCityToKommune(
      candidate,
      address.subregion ?? address.region,
    );
    if (kommune) return { area: "region", kommune };
  }

  return { area: "unresolved", reason: "missing_area_evidence" };
}

export type ManualLocationMatch =
  | {
      area: "byen";
      street: string;
      displayedHouseNumber: string;
      postcode?: string;
      route: StreetRouteResult;
    }
  | { area: "region"; kommune: Kommune }
  | { area: "unresolved" };

export function getCanonicalStreetLabel(value: string) {
  return value
    .replace(/\s*\([^)]*\bnr\.?[^)]*\)\s*$/iu, "")
    .trim();
}

export function getCanonicalRoutingRows(
  rows: RawStreetRow[],
  canonicalFallback: RawStreetRow[],
) {
  const containsLegacyRangeLabels = rows.some(
    (row) => getCanonicalStreetLabel(row.street) !== row.street.trim(),
  );
  return containsLegacyRangeLabels ? canonicalFallback : rows;
}

export function matchManualLocation(
  input: string,
  streetRows: RawStreetRow[],
  municipalities: readonly Kommune[],
): ManualLocationMatch {
  const parsedStreet = parseStreetName(undefined, input) ?? input;
  const postcode = input.match(/\b\d{4}\b/)?.[0];
  const normalizedInput = norm(input);
  const kommune = municipalities.find(
    (candidate) =>
      normalizedInput === norm(candidate) ||
      normalizedInput.includes(norm(candidate)),
  );
  const hasExplicitCopenhagenEvidence = hasCopenhagenEvidence({
    postcode,
    city: input,
  });
  if (kommune && !hasExplicitCopenhagenEvidence) {
    return { area: "region", kommune };
  }

  const streetRow = streetRows.find(
    (row) =>
      norm(row.street) === normalizedInput ||
      norm(row.street) === norm(parsedStreet),
  );
  if (streetRow) {
    const street = getCanonicalStreetLabel(streetRow.street);
    // Street labels may contain routing ranges such as "(Nr. 1–13B)".
    // Those numbers describe the rule, not the patient's house number.
    const parsedHouse = parseHouseNumber(input.replace(/\([^)]*\)/g, ""));
    const displayedHouseNumber = parsedHouse.number
      ? String(parsedHouse.number) + (parsedHouse.suffix ?? "")
      : "";
    return {
      area: "byen",
      street,
      displayedHouseNumber,
      postcode,
      route: resolveStreetRoute(
        streetRows,
        street,
        "",
        parsedHouse.number,
        postcode,
      ),
    };
  }

  return kommune ? { area: "region", kommune } : { area: "unresolved" };
}

export function getByenCategory(category: RegionCategory) {
  const mapped = getCategoryForArea(category, "byen");
  return mapped.available ? mapped.category : null;
}

export function getConfidenceUx(confidence?: "high" | "medium" | "poor") {
  if (confidence === "high") return "result" as const;
  if (confidence === "medium") return "confirm" as const;
  return "recovery" as const;
}
