import { useMemo } from "react";
import { estimateWeightKg, type AppSettings } from "../../../state/settings";
import { toNum } from "../utils/parsing";

export function useWeightCalculation(
  ageYears: string,
  weightKgOverride: string,
  settings: AppSettings,
) {
  return useMemo(() => {
    const estKg = estimateWeightKg(toNum(ageYears), settings);
    const overrideKg = toNum(weightKgOverride);
    const weightKg = Number.isFinite(overrideKg) ? overrideKg : estKg;
    return { estKg, weightKg };
  }, [ageYears, weightKgOverride, settings]);
}
