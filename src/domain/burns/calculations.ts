import {
  ADULT_BURN_ZONES,
  ADULT_FLUID_THRESHOLD_PERCENT,
  CHILD_BURN_ZONES,
  CHILD_FLUID_THRESHOLD_PERCENT,
  MODIFIED_PARKLAND_ML_PER_KG_PERCENT,
  type BurnAgeGroup,
  type BurnZone,
} from "./constants";

export function getBurnZones(ageGroup: BurnAgeGroup): BurnZone[] {
  return ageGroup === "adult" ? ADULT_BURN_ZONES : CHILD_BURN_ZONES;
}

export function calculateTbsa(
  ageGroup: BurnAgeGroup,
  selectedZoneIds: string[],
): number {
  return getBurnZones(ageGroup)
    .filter((zone) => selectedZoneIds.includes(zone.id))
    .reduce((sum, zone) => sum + zone.percent, 0);
}

export function isBurnFluidRelevant(
  ageGroup: BurnAgeGroup,
  tbsaPercent: number,
): boolean {
  return ageGroup === "adult"
    ? tbsaPercent >= ADULT_FLUID_THRESHOLD_PERCENT
    : tbsaPercent >= CHILD_FLUID_THRESHOLD_PERCENT;
}

export type BurnFluidCalculation = {
  modifiedParklandTotal: number;
  firstEightHours: number;
  nextSixteenHours: number;
  firstHourRate: number;
  laterHourRate: number;
};

export function calculateBurnFluids(
  patientWeightKg: number,
  tbsaPercent: number,
): BurnFluidCalculation {
  const modifiedParklandTotal =
    patientWeightKg > 0 && tbsaPercent > 0
      ? patientWeightKg * tbsaPercent * MODIFIED_PARKLAND_ML_PER_KG_PERCENT
      : 0;
  const firstEightHours = modifiedParklandTotal / 2;
  const nextSixteenHours = modifiedParklandTotal / 2;
  const firstHourRate = firstEightHours / 8;
  const laterHourRate = nextSixteenHours / 16;

  return {
    modifiedParklandTotal,
    firstEightHours,
    nextSixteenHours,
    firstHourRate,
    laterHourRate,
  };
}
