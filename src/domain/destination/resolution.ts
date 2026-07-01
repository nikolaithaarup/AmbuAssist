import type {
  Bydel,
  ByenCategory,
  HospitalCode,
  Kommune,
  RegionCategory,
} from "./types";

export type ByenHospitalMap = Partial<
  Record<Bydel, Partial<Record<ByenCategory, HospitalCode>>>
>;

export type RegionHospitalMap = Partial<
  Record<Kommune, Partial<Record<RegionCategory, HospitalCode>>>
>;

export type DestinationResolutionInput =
  | {
      area: "byen";
      bydel: Bydel | "";
      category: ByenCategory;
      map: ByenHospitalMap;
    }
  | {
      area: "region";
      kommune: Kommune | "";
      category: RegionCategory;
      map: RegionHospitalMap;
    };

export function resolveHospitalCode(
  input: DestinationResolutionInput,
): HospitalCode | null {
  if (input.area === "byen") {
    if (!input.bydel) return null;
    return input.map[input.bydel]?.[input.category] ?? "UNKNOWN";
  }

  if (!input.kommune) return null;
  return input.map[input.kommune]?.[input.category] ?? "UNKNOWN";
}
