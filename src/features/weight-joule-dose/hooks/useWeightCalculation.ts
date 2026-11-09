import { useMemo } from "react";
import type { AppSettings } from "../../../state/settings";
import { toNum } from "../utils/parsing";
import { canEstimateWeightFromAge, parseAgeYears } from "../utils/ageRuler";

export function useWeightCalculation(
  ageYears: string,
  weightKgOverride: string,
  _settings: AppSettings,
) {
  return useMemo(() => {
    const years = parseAgeYears(ageYears);
    // Ambulance quick estimate: (age in years × 2) + 8, only ages 1–12.
    // Outside that range a measured weight is required for energy/doses.
    const estKg = canEstimateWeightFromAge(years) ? years * 2 + 8 : NaN;
    const overrideKg = toNum(weightKgOverride);
    const weightKg = Number.isFinite(overrideKg) && overrideKg > 0 ? overrideKg : estKg;
    return { estKg, weightKg };
  }, [ageYears, weightKgOverride]);
}
